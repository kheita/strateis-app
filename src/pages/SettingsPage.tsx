import { useEffect } from "react";
import { Settings as SettingsIcon, Construction } from "lucide-react";
import { Badge } from "../components/common/Badge";

const LAYER_LABEL = "Préférences";

export function SettingsPage() {
  useEffect(() => {
    document.title = "Strateis App — Paramètres";
  }, []);

  return (
    <div className="relative h-full w-full overflow-auto">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-6 py-16 sm:px-10 sm:py-20">
        <div className="animate-slide-up">
          <div className="mb-6 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-tertiary">
            <span>{LAYER_LABEL}</span>
            <span className="text-muted">/</span>
            <span className="text-gold">Paramètres</span>
          </div>

          <div className="mb-8 flex items-start gap-5">
            <div className="surface border-default flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-elev-1">
              <SettingsIcon size={20} className="text-gold" strokeWidth={1.6} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[30px] font-medium tracking-[-0.02em] text-primary">
                  Paramètres
                </h1>
                <Badge variant="soon">Bientôt</Badge>
              </div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-secondary">
                Préférences du compte, du thème, des notifications et de la sécurité.
              </p>
            </div>
          </div>

          <div className="surface border-default rounded-xl border p-8 shadow-elev-1">
            <div className="flex items-start gap-4">
              <div className="surface-subtle border-subtle flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                <Construction size={15} className="text-gold" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-tertiary">
                  Module en cours de conception
                </div>
                <h2 className="mt-1 text-[15.5px] font-medium text-primary">
                  Cette interface arrive prochainement.
                </h2>
                <p className="mt-2 max-w-prose text-[13.5px] leading-relaxed text-secondary">
                  L'espace <span className="text-primary">Paramètres</span> centralisera les
                  préférences personnelles et la configuration du compte. Il sera livré dans une
                  itération dédiée afin de respecter le standard du cockpit.
                </p>
              </div>
            </div>

            <div className="border-subtle mt-8 border-t pt-5">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat label="Statut" value="En conception" />
                <Stat label="Couche" value={LAYER_LABEL} />
                <Stat label="Version" value="—" mono />
              </ul>
            </div>
          </div>

          <div className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            Aucune donnée affichée — mode placeholder.
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <li>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-tertiary">
        {label}
      </div>
      <div
        className={
          "mt-1 text-[13.5px] text-primary " + (mono ? "font-mono tracking-[0.04em]" : "")
        }
      >
        {value}
      </div>
    </li>
  );
}
