// src/App.tsx
import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SetupWizard from './pages/SetupWizard';
import Login from './pages/Login';
import DashboardLayout from './pages/layouts/DashboardLayout';
import SystemView from './pages/views/SystemView';
import ServersView from './pages/views/ServersView';
import { SESSION_EXPIRED_EVENT } from './utils/api';

export default function App() {
    const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [user, setUser] = useState<Record<string, unknown> | null>(() => {
        const savedUser = localStorage.getItem("kratos_user");
        const token = localStorage.getItem("kratos_token");
        return (savedUser && token) ? JSON.parse(savedUser) : null;
    });

    const handleLogout = useCallback(() => {
        localStorage.removeItem("kratos_token");
        localStorage.removeItem("kratos_user");
        setUser(null);
    }, []);

    useEffect(() => {
        window.addEventListener(SESSION_EXPIRED_EVENT, handleLogout);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleLogout);
    }, [handleLogout]);

    useEffect(() => {
        let isMounted = true;
        const checkStatus = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/auth/status');
                const data = await response.json();
                if (isMounted) setIsInitialized(data.initialized);
            } catch (err) {
                console.error('Impossible de contacter le backend :', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        checkStatus();
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-text-muted">
                Chargement de Kratos-Panel...
            </div>
        );
    }

    if (!isInitialized) {
        return <SetupWizard onSetupComplete={() => setIsInitialized(true)} />;
    }

    if (!user) {
        return <Login onLoginSuccess={(userData) => setUser(userData)} />;
    }

    // Application authentifiée avec React Router
    return (
        <Routes>
            <Route path="/" element={<DashboardLayout user={user} onLogout={handleLogout} />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<SystemView />} />
                <Route path="servers" element={<ServersView />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}