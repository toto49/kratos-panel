import { useSystemStatus } from '../queries/systemStatus';
import {formatUptime} from "../utils/formatters.ts";
import Sidebar from "../components/Sidebar.tsx";
import {useState} from "react";
interface DashboardProps {
    user: Record<string, unknown>;
    onLogout: () => void;
}

const formatStorage = (value: number) => `${value.toLocaleString('fr-FR')} Go`;

export default function Dashboard({ user, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const {
        data: systemStatus,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useSystemStatus();

    return (
        <div className="flex min-h-screen w-full bg-bg-main text-text-main">
            {/* Sidebar fixe à gauche */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Zone de contenu principale à droite */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="w-full bg-bg-card border-b border-border-color px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-xl font-bold tracking-tight text-text-main capitalize">
                        {activeTab === 'dashboard' ? 'Tableau de bord' : activeTab}
                    </h2>
                    <button
                        onClick={onLogout}
                        className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                        Déconnexion
                    </button>
                </header>

                <main className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-text-main">
                                            Bienvenue, {String(user.pseudo)} !
                                        </h2>
                                        <p className="text-sm text-text-muted mt-1">
                                            Voici l'état actuel de votre système.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void refetch()}
                                        disabled={isFetching}
                                        className="rounded-lg border border-border-color px-3 py-2 text-sm text-text-muted hover:text-text-main disabled:opacity-50 cursor-pointer disabled:cursor-wait transition-all"
                                    >
                                        {isFetching ? 'Actualisation...' : 'Actualiser'}
                                    </button>
                                </div>
                            </div>

                            {isLoading && (
                                <div className="rounded-xl bg-bg-card border border-border-color p-6 text-text-muted animate-pulse">
                                    Chargement des métriques système...
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6 text-red-400">
                                    Impossible de charger le statut système. Vérifiez que le backend est disponible.
                                </div>
                            )}

                            {systemStatus && (
                                <section className="grid gap-4 sm:grid-cols-3" aria-label="Métriques système">
                                    <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                                        <p className="text-sm text-text-muted">Stockage total</p>
                                        <p className="mt-2 text-2xl font-bold font-mono">
                                            {formatStorage(systemStatus.storage?.totalGB)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                                        <p className="text-sm text-text-muted">Stockage utilisé</p>
                                        <p className="mt-2 text-2xl font-bold font-mono">
                                            {formatStorage(systemStatus.storage?.usedGB)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                                        <p className="text-sm text-text-muted">Stockage disponible</p>
                                        <p className="mt-2 text-2xl font-bold font-mono text-emerald-400">
                                            {formatStorage(systemStatus.storage?.freeGB)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                                        <p className="text-sm text-text-muted">Uptime Server</p>
                                        <p className="mt-2 text-2xl font-bold font-mono text-emerald-400">
                                            {formatUptime(systemStatus.os?.uptime)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                                        <p className="text-sm text-text-muted">Version OS</p>
                                        <p className="mt-2 text-2xl font-bold truncate">
                                            {systemStatus.os?.manufacturer} {systemStatus.os?.os} {systemStatus.os?.version}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                                        <p className="text-sm text-text-muted">Architecture</p>
                                        <p className="mt-2 text-2xl font-bold font-mono">
                                            {systemStatus.os?.architecture} bits
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                                        <p className="text-sm text-text-muted">Nombre de nœuds</p>
                                        <p className="mt-2 text-xl font-semibold text-text-muted italic">
                                            Non déployé
                                        </p>
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {activeTab === 'servers' && (
                        <div className="rounded-xl bg-bg-card border border-border-color p-6">
                            <h3 className="text-lg font-bold">Gestion des Serveurs</h3>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
