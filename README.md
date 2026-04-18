# Strateis App — Shell V1

Cockpit digital interne de Strateis Partners.
Stack : Vite + React 19 + TypeScript + Tailwind CSS + React Router 7 + Supabase + Framer Motion + Lucide React.

## Installation

```bash
npm install
```

## Variables d'environnement

À renseigner dans Replit Secrets (ou un fichier `.env`) :

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Lancement

```bash
npm run dev      # Serveur de développement (port 5000)
npm run build    # Build de production
npm run preview  # Prévisualisation du build
npm run lint     # Lint ESLint
```

## Raccourcis clavier

- `⌘K` / `Ctrl+K` : ouvrir la palette de commandes
- `⌘\` / `Ctrl+\` : replier / déplier la sidebar
- `Esc` : fermer la palette ou les overlays

## Structure

```
src/
  components/
    auth/            Garde de route Supabase
    brand/           Logo & wordmark
    common/          Tooltip, Badge, Kbd
    layout/          AppShell, Sidebar, TopBar
    palette/         Command Palette (⌘K)
    status/          Statut système (dropdown + bottom-sheet)
  contexts/          Auth, Theme, CommandPalette
  hooks/             useUtcClock, useSidebarCollapse
  config/            navigation, sources mockées
  pages/             LoginPage, ModulePlaceholder
  lib/               supabase, cn, keyboard
```

## Notes

- L'application est **dark-first** ; le thème est persisté dans `localStorage` (`strateis-theme`).
- Le statut système affiche pour l'instant des sources **simulées** (`src/config/sources.ts`).
- Toutes les pages de modules sont des placeholders unifiés — les vrais modules seront construits dans des itérations dédiées.
