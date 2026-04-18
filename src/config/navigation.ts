import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Radar,
  Cpu,
  Building2,
  Scale,
  Swords,
  LineChart,
  Activity,
  Compass,
  Briefcase,
  Lightbulb,
  Clapperboard,
  GraduationCap,
  Cog,
  FileText,
  LayoutTemplate,
} from "lucide-react";

export type SectionId = "intelligence" | "workspace";

export type NavModule = {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  section: SectionId;
  /** Short subtitle shown on the placeholder page. */
  subtitle: string;
  /** Optional badge (e.g. "Bientôt"). */
  badge?: string;
};

export type NavSection = {
  id: SectionId;
  label: string;
  caption: string;
  modules: NavModule[];
};

export const NAVIGATION: NavSection[] = [
  {
    id: "intelligence",
    label: "Intelligence",
    caption: "Veille, monitoring & signaux",
    modules: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/intelligence/dashboard",
        icon: LayoutDashboard,
        section: "intelligence",
        subtitle: "Vue consolidée des signaux clés du cabinet.",
      },
      {
        id: "veille-africa-tech",
        label: "Veille Africa Tech",
        path: "/intelligence/veille-africa-tech",
        icon: Radar,
        section: "intelligence",
        subtitle: "Levées, lancements et mouvements de l'écosystème panafricain.",
      },
      {
        id: "veille-ia-tech",
        label: "Veille IA & Tech",
        path: "/intelligence/veille-ia-tech",
        icon: Cpu,
        section: "intelligence",
        subtitle: "Avancées IA, outils et tendances de la tech globale.",
      },
      {
        id: "b2g-pipeline",
        label: "B2G Pipeline",
        path: "/intelligence/b2g-pipeline",
        icon: Building2,
        section: "intelligence",
        subtitle: "Appels d'offres et opportunités institutionnelles suivis par le cabinet.",
      },
      {
        id: "reglementaire",
        label: "Réglementaire",
        path: "/intelligence/reglementaire",
        icon: Scale,
        section: "intelligence",
        subtitle: "Évolutions normatives, fiscales et politiques pertinentes.",
      },
      {
        id: "concurrence",
        label: "Concurrence",
        path: "/intelligence/concurrence",
        icon: Swords,
        section: "intelligence",
        subtitle: "Suivi des cabinets et acteurs concurrents sur nos marchés.",
      },
      {
        id: "seo-visibilite",
        label: "SEO & Visibilité",
        path: "/intelligence/seo-visibilite",
        icon: LineChart,
        section: "intelligence",
        subtitle: "Performance organique, positions et part de voix de Strateis.",
      },
      {
        id: "feeds-live",
        label: "Feeds Live",
        path: "/intelligence/feeds-live",
        icon: Activity,
        section: "intelligence",
        subtitle: "Flux temps réel agrégés depuis l'ensemble des sources.",
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    caption: "Production & opérations",
    modules: [
      {
        id: "hub",
        label: "Hub",
        path: "/workspace/hub",
        icon: Compass,
        section: "workspace",
        subtitle: "Point d'entrée du collaborateur — priorités, mandats actifs, planning.",
      },
      {
        id: "consulting",
        label: "Consulting",
        path: "/workspace/consulting",
        icon: Briefcase,
        section: "workspace",
        subtitle: "Espace de travail des missions de conseil en cours.",
      },
      {
        id: "ideelab",
        label: "IdeeLab",
        path: "/workspace/ideelab",
        icon: Lightbulb,
        section: "workspace",
        subtitle: "Capture, instruction et maturation des idées du cabinet.",
      },
      {
        id: "studio",
        label: "Studio",
        path: "/workspace/studio",
        icon: Clapperboard,
        section: "workspace",
        subtitle: "Production de livrables visuels, vidéos et prototypes.",
        badge: "Bientôt",
      },
      {
        id: "academy",
        label: "Academy",
        path: "/workspace/academy",
        icon: GraduationCap,
        section: "workspace",
        subtitle: "Formation interne, frameworks et capitalisation de savoir.",
        badge: "Bientôt",
      },
      {
        id: "operations",
        label: "Opérations",
        path: "/workspace/operations",
        icon: Cog,
        section: "workspace",
        subtitle: "Pilotage opérationnel du cabinet — équipe, finance, conformité.",
      },
      {
        id: "content",
        label: "Content",
        path: "/workspace/content",
        icon: FileText,
        section: "workspace",
        subtitle: "Production éditoriale et publication multi-canal.",
      },
      {
        id: "frameworks",
        label: "Frameworks",
        path: "/workspace/frameworks",
        icon: LayoutTemplate,
        section: "workspace",
        subtitle: "Bibliothèque des cadres méthodologiques propriétaires.",
      },
    ],
  },
];

export const ALL_MODULES: NavModule[] = NAVIGATION.flatMap((s) => s.modules);

export function findModuleByPath(pathname: string): NavModule | undefined {
  return ALL_MODULES.find((m) => pathname.startsWith(m.path));
}

export function findSectionById(id: SectionId): NavSection | undefined {
  return NAVIGATION.find((s) => s.id === id);
}
