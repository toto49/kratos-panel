import React, { useState } from 'react';

interface SetupWizardProps {
    onSetupComplete: () => void;
}


interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder: string;
}

const InputField = (props: InputFieldProps) => (
    <input
        {...props}
        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-sm"
    />
);

export default function SetupWizard({ onSetupComplete }: SetupWizardProps) {
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        pseudo: '',
        mail: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8081/api/auth/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la création de l'administrateur.");
            }

            const data = await response.json();
            console.log('Admin créé avec succès:', data);

            onSetupComplete();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div >
            <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 border border-gray-700 shadow-2xl space-y-6">

                {/* Header */}
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        Kratos-Panel
                    </h1>
                    <p className="text-sm text-gray-400">
                        Configuration du compte Administrateur
                    </p>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center">
                        {error}
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            type="text"
                            name="prenom"
                            placeholder="Prénom"
                            onChange={handleChange}
                            value={formData.prenom}
                            required
                        />
                        <InputField
                            type="text"
                            name="nom"
                            placeholder="Nom"
                            onChange={handleChange}
                            value={formData.nom}
                            required
                        />
                    </div>

                    <InputField
                        type="text"
                        name="pseudo"
                        placeholder="Pseudo"
                        onChange={handleChange}
                        value={formData.pseudo}
                        required
                    />

                    <InputField
                        type="email"
                        name="mail"
                        placeholder="Adresse email"
                        onChange={handleChange}
                        value={formData.mail}
                        required
                    />

                    <InputField
                        type="password"
                        name="password"
                        placeholder="Mot de passe Master"
                        onChange={handleChange}
                        value={formData.password}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white  hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                    >
                        {loading ? 'Initialisation...' : 'Initialiser Kratos-Panel'}
                    </button>
                </form>
            </div>
        </div>
    );
}