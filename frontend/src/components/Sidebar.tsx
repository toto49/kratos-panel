import {NavLink} from 'react-router-dom';

export default function Sidebar() {
    const menuItems = [
        { to: '/dashboard', label: 'Vue d\'ensemble' },
        { to: '/servers', label: 'Serveurs'},
        {to: '/services', label: 'Services'},
        { to: '/plugins', label: 'Plugins'},
        { to: '/settings', label: 'Paramètres'},
    ];

    return (
        <aside className="w-64 h-screen bg-bg-card border-r border-border-color flex flex-col justify-between sticky top-0 left-0 p-4 shrink-0">
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2 py-2">

                    <h1 className="text-xl font-bold tracking-tight text-text-main">
                        Kratos-Panel
                    </h1>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-text-muted hover:bg-bg-input hover:text-text-main'
                                }`
                            }
                        >

                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="pt-4 border-t border-border-color/50 px-2 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Système en ligne</span>
                </div>
            </div>
        </aside>
    );
}