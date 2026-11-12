import React, { useState } from 'react';
import { useNodesStatus, useCreateNode, useDeleteNode, type NodeResponse } from '../../queries/nodesStatus';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder: string;
}

const InputField = (props: InputFieldProps) => (
    <input
        {...props}
        className="w-full rounded-lg bg-bg-input border border-border-color px-3.5 py-2.5 text-sm text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
    />
);

export default function ServersView() {
    const { data: nodes, isLoading, error: fetchError } = useNodesStatus();
    const createNodeMutation = useCreateNode();
    const deleteNodeMutation = useDeleteNode();

    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', fqdn: '' });
    const [createdNode, setCreatedNode] = useState<NodeResponse | null>(null);
    const [nodeToDelete, setNodeToDelete] = useState<NodeResponse | null>(null);
    const [copied, setCopied] = useState(false);

    const handleOpen = () => {
        setFormData({ name: '', fqdn: '' });
        setCreatedNode(null);
        setCopied(false);
        createNodeMutation.reset();
        setIsVisible(true);
    };

    const handleClose = () => {
        setIsVisible(false);
        setCreatedNode(null);
    };

    const serverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const serverSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createNodeMutation.mutate(
            { name: formData.name.trim(), fqdn: formData.fqdn.trim() },
            {
                onSuccess: (newNode) => {
                    setCreatedNode(newNode);
                },
            }
        );
    };

    const confirmDelete = () => {
        if (!nodeToDelete) return;
        deleteNodeMutation.mutate(nodeToDelete.id, {
            onSuccess: () => {
                setNodeToDelete(null);
            },
        });
    };

    const getInstallCommand = (token: string) => {
        const backendUrl = import.meta.env.VITE_API_URL || window.location.origin;
        return `curl -fsSL https://raw.githubusercontent.com/toto49/kratos-panel/main/install.sh | sudo bash -s -- --url="${backendUrl}" --token="${token}"`;
    };

    const handleCopy = async (token: string) => {
        await navigator.clipboard.writeText(getInstallCommand(token));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-text-main">Serveurs enregistrés</h3>
                    <p className="text-sm text-text-muted">Gérez les nœuds distants connectés à Kratos-Panel.</p>
                </div>
                <button
                    onClick={handleOpen}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-all cursor-pointer"
                >
                    + Ajouter un serveur
                </button>
            </div>

            {/* États de chargement / erreur de la liste */}
            {isLoading && (
                <div className="rounded-xl bg-bg-card border border-border-color p-6 text-text-muted animate-pulse">
                    Chargement des serveurs...
                </div>
            )}

            {fetchError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6 text-red-400">
                    {fetchError.message}
                </div>
            )}

            {/* Liste des serveurs */}
            {!isLoading && !fetchError && (
                <div className="rounded-xl bg-bg-card border border-border-color overflow-hidden shadow-md">
                    {nodes && nodes.length > 0 ? (
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                            <tr className="border-b border-border-color bg-bg-input/50 text-text-muted">
                                <th className="p-4">Nom</th>
                                <th className="p-4">FQDN / IP</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Specs</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color/50">
                            {nodes.map((node) => (
                                <tr key={node.id} className="hover:bg-bg-input/30 transition-all">
                                    <td className="p-4 font-semibold text-text-main">{node.name}</td>
                                    <td className="p-4 font-mono text-xs text-text-muted">{node.fqdn}</td>
                                    <td className="p-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    node.isOnline
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        node.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                                                    }`}
                                                />
                                                {node.isOnline ? 'En ligne' : 'Hors ligne'}
                                            </span>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-text-muted">
                                        {node.cpuCores
                                            ? `${node.cpuCores} vCPU • ${((node.ramTotalMb ?? 0) / 1024).toFixed(1)} Go`
                                            : 'En attente de connexion'}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setCreatedNode(node);
                                                setIsVisible(true);
                                            }}
                                            className="text-xs px-3 py-1.5 rounded-md border border-border-color text-text-muted hover:text-text-main hover:bg-bg-input transition-all cursor-pointer"
                                        >
                                            Install
                                        </button>
                                        <button
                                            onClick={() => {
                                                deleteNodeMutation.reset();
                                                setNodeToDelete(node);
                                            }}
                                            className="text-xs px-3 py-1.5 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center text-sm text-text-muted">
                            Aucun serveur enregistré pour le moment.
                        </div>
                    )}
                </div>
            )}

            {/* Modal d'ajout / commande d'installation */}
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-xl bg-bg-card border border-border-color p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-border-color pb-3">
                            <h3 className="text-lg font-bold text-text-main">
                                {createdNode ? `Agent : ${createdNode.name}` : 'Ajouter un serveur'}
                            </h3>
                            <button
                                onClick={handleClose}
                                className="text-text-muted hover:text-text-main font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {!createdNode ? (
                            <form onSubmit={serverSubmit} className="space-y-4">
                                {createNodeMutation.isError && (
                                    <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center">
                                        {createNodeMutation.error.message}
                                    </div>
                                )}

                                <InputField
                                    type="text"
                                    name="name"
                                    placeholder="Nom du serveur (ex: VPS-01)"
                                    onChange={serverChange}
                                    value={formData.name}
                                    required
                                />

                                <InputField
                                    type="text"
                                    name="fqdn"
                                    placeholder="IP ou FQDN (ex: 51.15.80.24)"
                                    onChange={serverChange}
                                    value={formData.fqdn}
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={createNodeMutation.isPending}
                                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    {createNodeMutation.isPending ? 'Ajout...' : 'Ajouter'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-text-muted">
                                    Exécute cette commande sur le serveur distant pour installer et relier l'agent :
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => void handleCopy(createdNode.agentToken)}
                                            className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                                        >
                                            {copied ? '✓ Copié' : 'Copier'}
                                        </button>
                                    </div>
                                    <pre className="p-3 rounded-lg bg-bg-main border border-border-color text-xs font-mono text-text-main overflow-x-auto whitespace-pre-wrap break-all select-all">
                                        {getInstallCommand(createdNode.agentToken)}
                                    </pre>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover cursor-pointer"
                                >
                                    Fermer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression */}
            {nodeToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-sm rounded-xl bg-bg-card border border-border-color p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-text-main">Supprimer le serveur ?</h3>
                        <p className="text-sm text-text-muted">
                            Voulez-vous vraiment supprimer <strong className="text-text-main">{nodeToDelete.name}</strong> ({nodeToDelete.fqdn}) ? Son token agent sera immédiatement révoqué.
                        </p>

                        {deleteNodeMutation.isError && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                                {deleteNodeMutation.error.message}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setNodeToDelete(null)}
                                disabled={deleteNodeMutation.isPending}
                                className="rounded-lg border border-border-color px-4 py-2 text-sm text-text-muted hover:text-text-main cursor-pointer"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleteNodeMutation.isPending}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 cursor-pointer"
                            >
                                {deleteNodeMutation.isPending ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}