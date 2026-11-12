import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.tsx';

interface DashboardLayoutProps {
    user: Record<string, unknown>;
    onLogout: () => void;
}

export default function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
    const location = useLocation();


    const getPageTitle = (pathname: string) => {
        switch (pathname) {
            case '/servers':
                return 'Gestion des Serveurs';
            case '/containers':
                return 'Conteneurs Docker';
            case '/settings':
                return 'Paramètres';
            case '/dashboard':
            default:
                return 'Tableau de bord';
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-bg-main text-text-main">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="w-full bg-bg-card border-b border-border-color px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-xl font-bold tracking-tight text-text-main">
                        {getPageTitle(location.pathname)}
                    </h2>
                    <button
                        onClick={onLogout}
                        className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                        Déconnexion
                    </button>
                </header>

                <main className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
}