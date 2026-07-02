# 🏆 Olympiades - Application Web de Gestion

Application web complète pour gérer des olympiades par équipes avec différents types de jeux.

## 📋 Fonctionnalités

- ✅ Gestion des équipes (CRUD)
- ✅ Gestion des jeux avec support de 3 types de scoring (Temps, Score, Points)
- ✅ Support de 2 formats : Round-Robin et Élimination directe
- ✅ Tirages au sort intelligents minimisant les confrontations répétées
- ✅ Saisie des scores adaptée au type de jeu
- ✅ Classements (général et par jeu)
- ✅ Tableau des rencontres (liste ou bracket)
- ✅ Mode diaporama pour affichage sur grand écran

## 🛠️ Stack Technique

**Backend:**
- NestJS
- TypeORM
- SQLite
- TypeScript

**Frontend:**
- React
- TypeScript
- TailwindCSS
- React Router
- Vite

## 🚀 Installation et Lancement

### Prérequis

- Node.js 20 ou supérieur
- npm ou yarn

### Option 1: Avec Docker (Recommandé)

```bash
# Lancer toute l'application
docker-compose up

# L'application sera accessible sur:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
```

### Option 2: Installation manuelle

```bash
# Installer les dépendances du backend
cd backend
npm install

# Installer les dépendances du frontend
cd ../frontend
npm install
```

### Démarrage en développement

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

L'application sera accessible sur:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📚 Documentation

- **Plan complet**: Voir `plan.md` pour l'architecture détaillée
- **Exemples de jeux**: Voir `files/exemples-jeux.md` pour des cas d'usage

## 🏗️ Structure du Projet

```
olympiades/
├── backend/              # Backend NestJS
│   ├── src/
│   │   ├── teams/       # Module équipes
│   │   ├── games/       # Module jeux
│   │   ├── matches/     # Module matchs
│   │   ├── draws/       # Module tirages
│   │   └── rankings/    # Module classements
│   └── olympiades.sqlite # Base de données SQLite
│
├── frontend/            # Frontend React
│   ├── src/
│   │   ├── components/ # Composants React
│   │   ├── services/   # Services API
│   │   ├── hooks/      # Custom hooks
│   │   └── types/      # Types TypeScript
│   └── ...
│
└── docker-compose.yml  # Configuration Docker
```

## 🎯 Types de Jeux Supportés

### Formats
- **Round-Robin**: Tous contre tous ou par groupes
- **Élimination Directe**: Tournoi en bracket (8, 16, 32 équipes)

### Types de Scoring
- **TIME**: Jeux chronométrés (meilleur temps gagne)
- **SCORE**: Jeux avec score de match (comme au foot)
- **POINTS**: Jeux à accumulation de points

## 📝 Licence

Ce projet est privé et réservé à un usage interne.
