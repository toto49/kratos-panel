import { useEffect, useState } from 'react';
import SetupWizard from './pages/SetupWizard';
import Login from './pages/Login';

export default function App() {
    // Spécifier explicitement les types autorisés (boolean | null)
    const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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

    if (loading) {
        return
    }

    // 1. Si pas encore d'admin -> Écran Setup Wizard
    if (!isInitialized) {
        return <SetupWizard onSetupComplete={() => setIsInitialized(true)} />;
    }

    // 2. Si le système est prêt -> Écran de Connexion
    return <Login />;
}