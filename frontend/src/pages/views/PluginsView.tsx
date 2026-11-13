import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api.tsx";

export interface PluginField {
    key: string;
    label: string;
    type: "text" | "secret" | "select";
    default?: string;
    options?: string[];
    required?: boolean;
}
export interface Plugin {
    id: string;
    name: string;
    version: string;
    description: string;
    definition: {
        runtime: {
            image: string;
            workingDir: string;
            startCommand: string;
        };
        fields: PluginField[];
    };
    updatedAt: string;
}

export default function PluginsView() {

    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
    const [ajouterService, setAjouterService] = useState<Plugin | null>(null);

    const loadPlugins = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch("/plugins");
            if (!response.ok) {
                throw new Error("Impossible de récupérer les plugins");
            }

            const data: Plugin[] = await response.json();
            setPlugins(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlugins();
    }, []);

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Plugins disponibles</h1>
                <button
                    onClick={loadPlugins}
                    type="button"
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded"
                >
                    Rafraîchir
                </button>
            </div>

            {loading && <p className="text-zinc-400">Chargement des plugins...</p>}

            {error && <p className="text-red-400">{error}</p>}

            {!loading && !error && plugins.length === 0 && (
                <p className="text-zinc-400">Aucun plugin trouvé en base.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plugins.map((plugin) => (
                    <div onClick={()=> setSelectedPlugin(plugin)}
                        key={plugin.id}
                        className="p-4 rounded-lg bg-bg-card "
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-white">{plugin.name}</h2>
                            <span className="text-xs px-2 py-0.5 rounded bg-border-color     text-green-600">
                                v{plugin.version}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-2">{plugin.description}</p>
                        {plugin.definition.fields?.[0] &&(
                            <div key={plugin.definition.fields[0].label} className="text-xs text-zinc-400">
                                <strong>{plugin.definition.fields[0].label} par défaut </strong> ({plugin.definition.fields[0].default}) Disponible : {plugin.definition.fields?.[0]?.options?.join(", ")}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {selectedPlugin && (
                <div
                    key={selectedPlugin.id}
                    onClick={() => setSelectedPlugin(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg rounded-xl bg-bg-card border border-border-color p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
                    >

                        <div className="flex items-start justify-between border-b border-border-color pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-text-main">
                                        {selectedPlugin.name}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">
                            v{selectedPlugin.version}
                        </span>
                                </div>
                                <p className="text-xs text-text-muted font-mono mt-1">
                                    ID : {selectedPlugin.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedPlugin(null)}
                                className="text-text-muted hover:text-text-main font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>


                        <p className="text-sm text-text-muted">
                            {selectedPlugin.description}
                        </p>


                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                Configuration Runtime
                            </h4>
                            <div className="p-3 rounded-lg bg-black/20 border border-border-color space-y-1.5 text-xs">
                                <div>
                                    <span className="text-text-muted">Image : </span>
                                    <code className="text-indigo-400">{selectedPlugin.definition.runtime.image}</code>
                                </div>
                                <div>
                                    <span className="text-text-muted">Dossier : </span>
                                    <code className="text-text-main">{selectedPlugin.definition.runtime.workingDir}</code>
                                </div>
                                <div>
                                    <span className="text-text-muted">Commande : </span>
                                    <code className="text-emerald-400">{selectedPlugin.definition.runtime.startCommand}</code>
                                </div>
                            </div>
                        </div>


                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                Variables requises ({selectedPlugin.definition.fields?.length || 0})
                            </h4>
                            <div className="space-y-2">
                                {selectedPlugin.definition.fields?.map((field) => (
                                    <div
                                        key={field.key}
                                        className="p-3 rounded-lg bg-black/20 border border-border-color flex items-center justify-between text-xs"
                                    >
                                        <div>
                                            <span className="font-semibold text-text-main">{field.label}</span>
                                            <span className="ml-2 font-mono text-text-muted">({field.key})</span>
                                        </div>
                                        <div className="text-text-muted">
                                            {field.type === "select" && field.options
                                                ? `Choix : ${field.options.join(", ")}`
                                                : field.type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-border-color">
                            <button
                                type="button"
                                onClick={() => {setSelectedPlugin(null); setAjouterService(selectedPlugin)}}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                            >
                                ajouter services
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedPlugin(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {ajouterService && (
                <div
                    key={ajouterService.id}
                    onClick={() => setAjouterService(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg rounded-xl bg-bg-card border border-border-color p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
                    >
                        <div className="flex items-start justify-between border-b border-border-color pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-text-main">
                                        Ajouter service
                                    </h3>

                                </div>
                                <p className="text-xs text-text-muted font-mono mt-1">
                                    Plugin : {ajouterService.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setAjouterService(null)}
                                className="text-text-muted hover:text-text-main font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <select></select>
                        <input type={"text"} placeholder={"Nom du service"}/>
                    </div>
                </div>


            )}
        </div>


    );
}