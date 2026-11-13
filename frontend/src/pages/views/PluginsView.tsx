import { useEffect, useState } from "react";
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

    const loadPlugins = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch("/plugins");
            if (!response.ok) {
                throw new Error("Impossible de récupérer les plugins");
            }

            const data: Plugin[] = await response.json();
            console.log(data);
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
                    <div
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
        </div>
    );
}