interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Vue d\'ensemble' },
        { id: 'servers', label: 'Serveurs' },
        { id: 'containers', label: 'Conteneurs Docker' },
        { id: 'settings', label: 'Paramètres' },
    ];

    return (
        <aside className="w-64 h-screen bg-bg-card border-r border-border-color flex flex-col justify-between sticky top-0 left-0 p-4 shrink-0">
            <div className="space-y-6">
                {/* Branding / Logo */}
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
                        K
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-text-main">
                        Kratos-Panel
                    </h1>
                </div>

                {/* Navigation en colonne */}
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-bg-main text-white shadow-sm'
                                        : 'text-text-muted hover:bg-border-color hover:text-text-main'
                                }`}
                            >

                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Pied de sidebar */}
            <div className="pt-4 border-t border-border-color/50 px-2 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Système en ligne</span>
                </div>
            </div>
        </aside>
    );
}