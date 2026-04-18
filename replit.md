# Strateis App

## Vue d'ensemble
Strateis App est le cockpit digital interne de Strateis Partners — un cabinet de conseil basé à Abidjan. L'application est destinée à devenir un produit primable, adaptable en marque blanche pour d'autres cabinets et institutions panafricaines.

## Tech stack
- **Frontend** : React 19 + TypeScript (strict)
- **Build** : Vite 8
- **Styling** : Tailwind CSS 3 (mode dark via `class`)
- **Routing** : React Router 7
- **Animations** : Framer Motion 12
- **Icons** : Lucide React
- **Auth & data** : Supabase (PostgreSQL + Edge Functions)

## Identité visuelle (non-négociable)
- **Couleurs** : Navy (#0B1121 et déclinaisons) + Gold (#D4A853) — gold utilisé avec parcimonie
- **Typographie** : DM Sans (contenu) + JetBrains Mono (data, labels, timestamps)
- **Mode** : dark-first (light disponible en option)

## État actuel — Shell V1 + Dashboard Intelligence V1 (livrés)
Le squelette de l'application est en place et le premier module métier (Intelligence / Dashboard) est livré.

### Dashboard Intelligence V1 (`/intelligence/dashboard`)
- 4 tuiles KPI hero (MRR IdeeLab, Pipeline B2G, Missions actives, Visibilité) avec sparklines, deltas, états stale
- 4 widgets 2×2 : Agenda (empty state Calendar non câblé), Feed Intelligence (4 onglets), Top B2G hot (5 + scoring), Tracker SEO + AEO (sparkline + bars)
- Refresh control (sync timestamp + bouton manuel) avec polling auto 60 s
- 5 états visuels : loading (skeletons), chargé, empty (premium, jamais "Aucune donnée"), stale (24 h+), erreur API (bannière slim, garde le cache)
- Données réelles via Edge Function `monitor-fetch` (views dashboard/feeds/b2g/seo) + table `monitor_kpis_daily`
- Erreurs partielles vs globales distinguées et exposées via bannière dédiée
- Responsive : ≥1280 hero 4×1 / widgets 2×2 ; 768–1279 hero 2×2 / widgets empilés ; <768 tout empilé

Inclut :
- Authentification Supabase (email + mot de passe) avec route guard
- Sidebar collapsable avec sections INTELLIGENCE / WORKSPACE
- TopBar avec breadcrumb, recherche globale (⌘K), indicateur de santé, horloge UTC, toggle thème, notifications
- Command Palette (⌘K) avec navigation clavier complète
- Statut système (dropdown desktop + bottom-sheet mobile) avec 8 sources mockées
- Toggle dark/light avec persistance localStorage
- Pages placeholder unifiées paramétrées par module
- Responsive desktop / tablet / mobile

## Variables d'environnement
- `VITE_SUPABASE_URL` — URL du projet Supabase
- `VITE_SUPABASE_ANON_KEY` — clé anon Supabase

## Comptes existants
- `ceo@strateis.co`
- `aguibou.tall@strateis.co`

## Architecture
```
src/
  components/{auth,brand,common,help,layout,palette,status}/
  components/dashboard/{KpiTile,Widget,Sparkline,EmptyState,Skeleton,RefreshControl,ErrorBanner}.tsx
  components/dashboard/widgets/{Agenda,Feed,B2G,SeoAeo}Widget.tsx
  contexts/{Auth,Theme,CommandPalette}Context.tsx
  hooks/{useUtcClock,useSidebarCollapse,useDashboardData}.ts
  config/{navigation,sources}.ts
  pages/{LoginPage,ModulePlaceholder,SettingsPage,IntelligenceDashboardPage}.tsx
  lib/{supabase,cn,keyboard,format,dashboardApi}.ts
```

## Développement
- `npm run dev` (port 5000)
- `npm run build` puis `npm run preview`

## Déploiement
- Type : site statique (Replit static deployment)
- Build : `npm run build`
- Public : `dist/`

## Décisions clés
- Dark mode par défaut (pas de fallback `prefers-color-scheme` pour garantir l'identité)
- Le palette ⌘K reste actif dans les inputs (raccourci global), mais ⌘\ ne déclenche plus le toggle sidebar quand on tape
- Les pages de modules sont volontairement minimales en V1 — un seul composant `ModulePlaceholder` paramétré
- Le statut système utilise un dropdown sur desktop et un bottom-sheet sur mobile
