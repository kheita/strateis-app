import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ALL_MODULES, findSectionById } from "../config/navigation";
import { Construction } from "lucide-react";
import { Badge } from "../components/common/Badge";

type Props = {
  /** Optional: explicit moduleId (used when route is not parameterized). */
  moduleId?: string;
};

export function ModulePlaceholder({ moduleId }: Props) {
  const params = useParams();
  const id = moduleId ?? params.moduleId;
  const moduleEntry = ALL_MODULES.find((m) => m.id === id);

  useEffect(() => {
    if (moduleEntry) {
      document.title = `Strateis App — ${moduleEntry.label}`;
    }
  }, [moduleEntry]);

  if (!moduleEntry) {
    return <UnknownModule />;
  }

  const section = findSectionById(moduleEntry.section);
  const Icon = moduleEntry.icon;

  return (
    <div className="relative h-full w-full overflow-auto">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-6 py-16 sm:px-10 sm:py-20">
        <div className="animate-slide-up">
          <div className="mb-6 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-tertiary">
            <span>{section?.label}</span>
            <span className="text-muted">/</span>
            <span className="text-gold">{moduleEntry.label}</span>
          </div>

          <div className="mb-8 flex items-start gap-5">
            <div className="surface border-default flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-elev-1">
              <Icon size={20} className="text-gold" strokeWidth={1.6} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[30px] font-medium tracking-[-0.02em] text-primary">
                  {moduleEntry.label}
                </h1>
                {moduleEntry.badge && <Badge variant="soon">{moduleEntry.badge}</Badge>}
              </div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-secondary">
                {moduleEntry.subtitle}
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
                  Le module <span className="text-primary">{moduleEntry.label}</span> est en cours
                  de spécification. Il s'inscrit dans la couche{" "}
                  <span className="text-primary">{section?.label}</span> et sera livré dans une
                  itération dédiée afin de respecter le standard du cockpit.
                </p>
              </div>
            </div>

            <div className="border-subtle mt-8 border-t pt-5">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat label="Statut" value="En conception" />
                <Stat label="Couche" value={section?.label ?? "—"} />
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

function UnknownModule() {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="text-center">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-tertiary">
          Erreur 404
        </div>
        <h1 className="mt-2 text-[22px] font-medium text-primary">Module introuvable</h1>
        <p className="mt-2 text-[13.5px] text-secondary">
          La route demandée ne correspond à aucun module connu.
        </p>
      </div>
    </div>
  );
}
