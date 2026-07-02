# Olympiades 🏅

Application web full-stack de gestion d'olympiades par équipes — remplace la gestion manuelle sur fichiers Excel.

## Fonctionnalités

- **Équipes** : création avec nom et couleur personnalisée
- **Jeux** : 3 types (TIME ⏱️, SCORE ⚽, POINTS 🎯), 2 formats (Round-Robin, Élimination directe)
- **Tirages** : algorithme round-robin optimisé (minimise les confrontations répétées) ou bracket d'élimination
- **Matchs** : saisie des scores bruts → calcul automatique des rangs et points olympiques
- **Classements** : général et par jeu, en temps réel
- **Diaporama** : affichage plein écran animé pour projection grand écran

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Backend | NestJS 10, TypeORM 0.3, SQLite (better-sqlite3), class-validator |
| Frontend | React 18, TypeScript 5, TailwindCSS 3, React Router 6, Axios, Vite 5 |
| DevOps | Docker Compose |

## Démarrage rapide

### Sans Docker

```bash
# Backend (http://localhost:3001)
cd backend
npm install
npm run start:dev

# Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

### Avec Docker

```bash
docker-compose up --build
```

Accès : http://localhost:5173

## Architecture

```
backend/
  src/
    entities/       # Team, Game, Match, MatchTeam, TeamMatchHistory
    teams/          # CRUD équipes
    games/          # CRUD jeux
    matches/        # CRUD matchs + soumission scores
    rankings/       # Classements global et par jeu
    draws/          # Algorithmes de tirage au sort

frontend/
  src/
    types/          # Types TypeScript partagés
    services/       # Clients API (teams, games, matches, rankings, draws)
    components/     # Layout, Modal, Badge, ConfirmDialog, StatusComponents
    pages/          # Home, Teams, Games, Matches, Draws, Rankings, Slideshow
```

## Points olympiques

| Rang | Points |
|------|--------|
| 1er  | 10     |
| 2ème | 8      |
| 3ème | 6      |
| 4ème | 5      |
| 5ème | 4      |
| 6ème | 3      |
| 7ème | 2      |
| 8ème | 1      |

## Notes

- Pas d'authentification (usage interne local)
- SQLite avec `synchronize: true` (dev uniquement)
- CORS activé pour développement frontend/backend séparés
