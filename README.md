# 🏆 Olympiades - Application Web de Gestion

Application web complète pour gérer des olympiades par équipes avec différents types de jeux, tirages au sort optimisés et mode diaporama.

## ✨ Fonctionnalités Complètes

### 🏅 Gestion des équipes
- Créer, modifier, supprimer des équipes
- Attribution de couleurs personnalisées
- Validation automatique des noms uniques

### 🎮 Gestion des jeux
- **3 types de scoring** :
  - **TIME** (⏱️) : Meilleur temps gagne (course, relais...)
  - **SCORE** (⚽) : Plus haut score gagne (football, basket...)
  - **POINTS** (🎯) : Plus de points gagne (accumulation)
- **2 formats de compétition** :
  - **Round-Robin** : Tous contre tous avec optimisation
  - **Élimination directe** : Bracket tournament avec byes
- Description et règles complètes par jeu

### 🎲 Tirages au sort intelligents
- **Round-Robin optimisé** : Minimise automatiquement les confrontations répétées
- **Bracket automatique** : Génération de bracket (puissance de 2) avec gestion des byes
- Historique des confrontations entre équipes
- Création automatique des matchs depuis le tirage

### 📊 Rencontres et scores
- Liste des matchs avec filtrage par jeu
- Saisie des scores adaptée au type (temps, score, points)
- **Calcul automatique** des rangs et points olympiques
- Système de points : 1er=10pts, 2ème=8pts, 3ème=6pts, 4ème=5pts...
- Statuts : En attente / En cours / Terminé

### 🏆 Classements
- **Classement général** : Cumul de tous les jeux
- **Classement par jeu** : Performance sur un jeu spécifique
- Statistiques : points, matchs joués, moyenne par match
- Top 3 mis en évidence

### 📺 Mode diaporama
- Affichage plein écran optimisé pour projection
- Défilement automatique configurable (3s à 15s)
- Podium top 3 animé pour le classement général
- Design immersif avec dégradés et animations
- Contrôles : play/pause, navigation, plein écran

## 🛠️ Stack Technique

**Backend:**
- **NestJS** - Framework Node.js
- **TypeORM** - ORM pour base de données
- **SQLite** - Base de données légère
- **class-validator** - Validation automatique
- **TypeScript** - Typage statique

**Frontend:**
- **React 18** - Library UI moderne
- **TypeScript** - Typage strict
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Navigation SPA
- **Axios** - Client HTTP
- **Vite** - Build tool ultra-rapide

## 🚀 Installation et Lancement

### Prérequis
- Node.js 18+ ou supérieur
- npm ou yarn

### Option 1: Installation manuelle

**1. Backend**
```bash
cd backend
npm install
npm run start:dev
```
Le backend démarre sur `http://localhost:3001`

**2. Frontend** (dans un autre terminal)
```bash
cd frontend
npm install
npm run dev
```
Le frontend démarre sur `http://localhost:5173`

### Option 2: Avec Docker

```bash
docker-compose up -d
```
- Frontend : `http://localhost:5173`
- Backend API : `http://localhost:3001`

## 📖 Guide d'utilisation

### 1. Configuration initiale
1. Créez vos équipes dans **Équipes** (nom + couleur)
2. Configurez vos jeux dans **Jeux** (type, format, règles)

### 2. Tirage au sort
1. Allez dans **Tirages**
2. Sélectionnez un jeu
3. Cochez les équipes participantes
4. Cliquez sur "Générer le tirage"
5. Validez avec "Créer les matchs"

### 3. Saisie des scores
1. Allez dans **Rencontres**
2. Cliquez sur "Enregistrer scores" pour un match
3. Saisissez les résultats (temps, score ou points selon le type)
4. Les rangs et points olympiques sont calculés automatiquement !

### 4. Consultation des résultats
- **Tableau de bord** : Vue d'ensemble + top 3
- **Classements** : Général ou par jeu
- **Diaporama** : Mode plein écran pour projection sur grand écran

## 🏗️ Architecture

### Backend (NestJS + SQLite)
```
backend/
├── src/
│   ├── teams/          # Module équipes (CRUD)
│   ├── games/          # Module jeux (types/formats)
│   ├── matches/        # Module rencontres (scores/rangs)
│   ├── rankings/       # Module classements (SQL)
│   └── draws/          # Module tirages (algorithmes)
└── olympiades.sqlite   # Base de données
```

**5 Entités:**
- `Team` : Équipes (id, name, color)
- `Game` : Jeux (type, format, scoringDirection)
- `Match` : Rencontres (status, round, bracketPosition)
- `MatchTeam` : Résultats (rawScore, rank, points)
- `TeamMatchHistory` : Historique confrontations

**24 API Routes:**
- `/api/teams` - CRUD équipes
- `/api/games` - CRUD jeux
- `/api/matches` - CRUD matchs + `/scores`
- `/api/rankings` - Classements général et par jeu
- `/api/draws` - Tirages round-robin et bracket

### Frontend (React + TypeScript + TailwindCSS)
```
frontend/
├── src/
│   ├── components/     # 9 composants réutilisables
│   ├── pages/          # 7 pages de l'application
│   ├── services/       # 5 services API (axios)
│   └── types/          # Types synchronisés avec backend
```

**7 Pages:**
- `Dashboard` : Vue d'ensemble et statistiques
- `TeamsPage` : Gestion équipes avec modales
- `GamesPage` : Gestion jeux avec types/formats
- `DrawsPage` : Interface de tirage au sort
- `MatchesPage` : Liste matchs et saisie scores
- `RankingsPage` : Classements avec filtres
- `SlideshowPage` : Mode diaporama fullscreen

## 📊 Système de Scoring

### Points olympiques
| Rang | Points |
|------|--------|
| 🥇 1er  | 10 |
| 🥈 2ème | 8  |
| 🥉 3ème | 6  |
| 4ème    | 5  |
| 5ème    | 4  |
| 6ème    | 3  |
| 7ème    | 2  |
| 8ème    | 1  |

### Types de jeux
- **TIME** : `scoringDirection = ASC` → temps plus bas = meilleur rang
- **SCORE** : `scoringDirection = DESC` → score plus haut = meilleur rang
- **POINTS** : `scoringDirection = DESC` → plus de points = meilleur rang

### Algorithmes

**Round-Robin optimisé:**
1. Teste 100 combinaisons aléatoires d'équipes
2. Calcule le score de confrontation (somme des matchCount)
3. Sélectionne la combinaison avec score minimal
4. Met à jour l'historique des confrontations
→ Minimise les rencontres répétées entre mêmes équipes

**Bracket automatique:**
1. Détermine taille bracket (puissance de 2 : 2, 4, 8, 16, 32...)
2. Calcule nombre de byes nécessaires
3. Répartit équipes (aléatoire ou par seeding)
4. Génère structure complète (finale, demi, quarts...)

## 🐳 Docker

`docker-compose.yml` configuré avec :
- Service backend (NestJS)
- Service frontend (Vite)
- Volume pour persistence SQLite

```bash
docker-compose up -d     # Démarrer
docker-compose down      # Arrêter
docker-compose logs -f   # Voir les logs
```

## 📁 Structure du Projet

```
olympiades/
├── backend/                  # Backend NestJS
│   ├── src/
│   │   ├── teams/           # Module équipes
│   │   ├── games/           # Module jeux  
│   │   ├── matches/         # Module matchs
│   │   ├── draws/           # Module tirages
│   │   ├── rankings/        # Module classements
│   │   └── database/        # Entités communes
│   ├── package.json
│   └── olympiades.sqlite    # Base de données
│
├── frontend/                 # Frontend React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # Services API
│   │   └── types/           # Types TypeScript
│   └── package.json
│
├── docker-compose.yml       # Configuration Docker
└── README.md                # Ce fichier
```

## 🎯 Exemples d'utilisation

**Jeu de type TIME (Course en sac):**
- Saisie : temps en secondes (ex: 45.3s)
- Calcul auto : temps le plus bas = 1er rang = 10 points

**Jeu de type SCORE (Foot):**
- Saisie : score du match (ex: 5 buts)
- Calcul auto : score le plus haut = 1er rang = 10 points

**Jeu de type POINTS (Quiz):**
- Saisie : points accumulés (ex: 87 points)
- Calcul auto : plus de points = 1er rang = 10 points

## 🔐 Sécurité et Données

- Base SQLite locale (pas de cloud)
- Pas d'authentification (usage interne)
- Données persistantes dans `backend/olympiades.sqlite`
- Backup recommandé avant événement

## 📝 Licence

MIT - Projet développé pour la gestion d'olympiades par équipes.

## 🙏 Support

Pour toute question ou amélioration, consultez le code ou contactez le développeur.

---

**Note:** Application locale uniquement, pas de déploiement cloud prévu.
