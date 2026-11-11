import { useEffect, useState } from 'react';
import SetupWizard from './pages/SetupWizard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
    const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [user, setUser] = useState <Record<string, unknown> | null>(() => {
        const savedUser = localStorage.getItem("kratos_user");
        const token = localStorage.getItem("kratos_token");
        return (savedUser && token) ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        let isMounted = true;

        const checkStatus = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/auth/status');
                const data = await response.json();
                if (isMounted) {
                    setIsInitialized(data.initialized);
                }
            } catch (err) {
                console.error('Impossible de contacter le backend :', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        checkStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("kratos_token");
        localStorage.removeItem("kratos_user");
        setUser(null);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center  text-text-muted">
                Chargement de Kratos-Panel...
            </div>
        );
    }
    if (!isInitialized) {
        return <SetupWizard onSetupComplete={() => setIsInitialized(true)} />;
    }

    if (user) {
        return <Dashboard user={user} onLogout={handleLogout} />;
    }

    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
}