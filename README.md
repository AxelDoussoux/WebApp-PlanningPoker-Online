# WebApp Planning Poker Online

Application web de Planning Poker pour l'estimation collaborative des tâches en équipe Agile.

## Description

Planning Poker est un outil d'estimation utilisé dans les méthodologies Agile (Scrum). Les membres de l'équipe votent simultanément sur la complexité d'une tâche en utilisant des cartes (suite de Fibonacci : 0, 1, 2, 3, 5, 8, 13, 20, 40, café, ?).

### Fonctionnalités

- **Connexion** : Créer ou réutiliser un pseudo
- **Création de session** : Nommer la session, choisir le mode de jeu, ajouter des tâches
- **Modes de jeu** : Strict (unanimité) ou Moyenne
- **Rejoindre** : Code à 6 chiffres pour rejoindre une session
- **Vote en temps réel** : Votes synchronisés via Supabase
- **Résultats** : Affichage des votes après validation
- **Récapitulatif** : Historique des votes en fin de session

## Technologies

| Technologie | Usage |
|-------------|-------|
| **React 19** | Framework UI |
| **TypeScript** | Typage statique |
| **Vite** | Build & Dev server |
| **Tailwind CSS** | Styling |
| **Supabase** | Backend (BDD PostgreSQL + Realtime) |
| **Jest** | Tests unitaires |
| **TypeDoc** | Documentation |

## Installation

```bash
# Cloner le repo
git clone https://github.com/VOTRE_USERNAME/planning-poker.git
cd planning-poker

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase
```

### Variables d'environnement

Créer un fichier `.env.local` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=votre_cle_publique
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run test` | Exécuter les tests unitaires |
| `npm run docs` | Générer la documentation |
| `npm run lint` | Vérifier le code avec ESLint |

## Structure du projet

```
src/
├── blocks/           # Composants de page (Home, Session, Game)
├── context/          # React Context (SessionContext)
├── hooks/            # Hooks personnalisés
├── lib/              # Configuration (Supabase, types)
├── services/         # Logique métier (CRUD Supabase)
│   ├── participants.ts
│   ├── sessions.ts
│   ├── tasks.ts
│   └── votes.ts
└── App.tsx           # Composant principal
```

## Base de données (Supabase)

### Tables

| Table | Description |
|-------|-------------|
| `sessions` | Sessions de Planning Poker |
| `participants` | Utilisateurs connectés |
| `tasks` | Tâches à estimer |
| `votes` | Votes des participants |

## Tests

```bash
npm run test
```

Les tests couvrent les 4 services :
- `sessions.ts` : Génération de code, création/recherche de session
- `participants.ts` : CRUD participants
- `tasks.ts` : CRUD tâches
- `votes.ts` : CRUD votes

## Documentation

```bash
npm run docs
```

La documentation JSDoc est générée dans le dossier `docs/`.

## Déploiement (GitHub Pages)

Le projet est configuré pour un déploiement automatique sur GitHub Pages via GitHub Actions.

1. Ajouter les secrets dans **Settings → Secrets → Actions** :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

2. Activer GitHub Pages : **Settings → Pages → Source → GitHub Actions**

3. Push sur `main` pour déclencher le déploiement

## Auteurs

- Projet réalisé dans le cadre du cours M1 Info - Conception de projet

## Licence

ISC

