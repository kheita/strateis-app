import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { LogoMark } from "../components/brand/Logo";
import { useUtcClock } from "../hooks/useUtcClock";

export function LoginPage() {
  const { session, signIn, loading: authLoading } = useAuth();
  const location = useLocation();
  const clock = useUtcClock();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Strateis App — Connexion";
  }, []);

  if (!authLoading && session) {
    const dest = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
    return <Navigate to={dest} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="surface-app relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,83,0.05),transparent_60%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <LogoMark size={24} />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-tertiary">
            Strateis · Cockpit
          </span>
        </div>
        <div className="hidden font-mono text-[10.5px] uppercase tracking-[0.16em] text-tertiary sm:block">
          {clock.date} · {clock.time} UTC
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[420px] animate-slide-up">
          <div className="mb-8">
            <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
              Accès cabinet
            </div>
            <h1 className="text-[28px] font-medium tracking-[-0.018em] text-primary">
              Bienvenue sur Strateis App.
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-secondary">
              Le cockpit interne de Strateis Partners. Identifiez-vous avec votre adresse cabinet.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="surface rounded-xl border border-default p-6 shadow-elev-2"
            noValidate
          >
            <div className="space-y-4">
              <Field
                id="email"
                label="Adresse email"
                type="email"
                autoComplete="email"
                placeholder="vous@strateis.co"
                value={email}
                onChange={setEmail}
                required
                disabled={submitting}
              />
              <Field
                id="password"
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                required
                disabled={submitting}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-md border border-[rgb(var(--status-down))]/30 bg-[rgb(var(--status-down))]/10 px-3 py-2.5 text-[12.5px] text-primary"
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0 status-down" strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-[13.5px] font-medium text-[rgb(var(--text-on-gold))] transition-base hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={14} strokeWidth={2.25} />
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-between text-[11.5px] text-tertiary">
              <button
                type="button"
                className="cursor-not-allowed transition-base hover:text-secondary"
                onClick={(e) => e.preventDefault()}
                title="Disponible prochainement"
              >
                Mot de passe oublié ?
              </button>
              <span className="font-mono uppercase tracking-[0.12em]">SSO · bientôt</span>
            </div>
          </form>

          <p className="mt-6 text-center text-[11.5px] text-muted">
            Accès réservé aux collaborateurs de Strateis Partners.
          </p>
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-between border-t border-subtle px-6 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:px-10">
        <span>Strateis Partners SAS</span>
        <span className="hidden sm:inline">Abidjan · Côte d'Ivoire</span>
        <span>v0.1 · Shell</span>
      </footer>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  disabled,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-tertiary"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="surface-subtle w-full rounded-md border border-default px-3 py-2.5 text-[13.5px] text-primary placeholder:text-muted transition-base focus:border-gold focus:outline-none focus:ring-0 disabled:opacity-50"
      />
    </div>
  );
}
