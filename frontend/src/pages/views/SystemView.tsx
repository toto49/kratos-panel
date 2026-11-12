import { useOutletContext } from 'react-router-dom';
import { useSystemStatus } from '../../queries/systemStatus';
import { formatUptime } from '../../utils/formatters';

const formatStorage = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0 Go';
    return `${value.toLocaleString('fr-FR')} Go`;
};

export default function SystemView() {
    const { user } = useOutletContext<{ user: Record<string, unknown> }>();
    const { data: systemStatus, error, isLoading, isFetching, refetch } = useSystemStatus();

    return (
        <>
            <div className="rounded-xl bg-bg-card border border-border-color p-6 shadow-md">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-text-main">
                            Bienvenue, {String(user?.pseudo || 'Utilisateur')} !
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
                </section>
            )}
        </>
    );
}