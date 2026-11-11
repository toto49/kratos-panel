import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
}

interface LoginProps {
  onLoginSuccess?: (userData: Record<string, unknown>) => void;
}

const InputField = (props: InputFieldProps) => (
    <input
        {...props}
        className="w-full rounded-lg bg-bg-input border border-border-color px-3.5 py-2.5 text-sm text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
    />
);

export default function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pseudo: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8081/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pseudo: formData.pseudo,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Identifiants incorrects ou erreur d'authentification.");
      }

      const data: { token: string; user: Record<string, unknown> } = await response.json();

      localStorage.setItem("kratos_token", data.token);
      localStorage.setItem("kratos_user", JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex min-h-screen items-center justify-center  p-4">
        <div className="w-full max-w-md rounded-2xl bg-bg-card p-8 border border-border-color shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
              Kratos-Panel
            </h1>
            <p className="text-sm text-text-muted">
              Connexion au panneau d'administration
            </p>
          </div>

          {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                type="text"
                name="pseudo"
                placeholder="Pseudo"
                onChange={handleChange}
                value={formData.pseudo}
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
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-text-main hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-card disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 cursor-pointer"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
  );
}