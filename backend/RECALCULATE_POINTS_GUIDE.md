# 🔄 Script de Recalcul des Points

## 📋 Description

Ce script recalcule automatiquement les points de **tous les matchs complétés** en appliquant la nouvelle logique :

- **Round Robin** : Système olympique pour TOUS les types (10, 8, 6, 5, 4, 3, 2, 1)
- **Elimination** : Système selon type de jeu

## 🎯 Quand l'Utiliser

- Après avoir corrigé la logique de calcul des points
- Si des matchs ont été complétés avec l'ancienne logique incorrecte
- Pour mettre à jour le classement après un changement de règles

## 🚀 Utilisation

### Option 1 : Local (SQLite) - Recommandé pour Test

```bash
cd backend
npm run build           # Compiler le projet (obligatoire)
npm run recalculate:points
```

**En développement** (sans build) :
```bash
npm run recalculate:points:dev
```

Le script détecte automatiquement SQLite en local.

### Option 2 : Production Railway (PostgreSQL)

⚠️ **IMPORTANT** : Le script est maintenant **compilé en JavaScript** et inclus dans le build Docker.

#### Méthode : Via Dashboard Railway (⭐ Recommandé)

1. Aller sur https://railway.app
2. Sélectionner le projet **olympiades**
3. Cliquer sur le service **backend**
4. Onglet **Deployments**
5. Cliquer sur le déploiement actif (le plus récent)
6. Cliquer sur l'onglet **View Logs** puis **Deploy Logs**
7. En haut à droite, cliquer sur **⋮** (trois points) → **Run Command**
8. Entrer la commande : `npm run recalculate:points`
9. Cliquer sur **Run**

✅ Le script est maintenant **disponible dans le container** après chaque build !

---

## ⚠️ Erreur Courante

### ❌ Cannot find module './recalculate-points.ts'

**Erreur dans Railway** :
```
Error: Cannot find module './recalculate-points.ts'
```

**Cause** : Le script n'était pas compilé et inclus dans le build Docker.

**✅ Solution Appliquée** : 
- Le script est maintenant dans `src/scripts/` (et non plus dans `scripts/` à la racine)
- Il est compilé avec `npm run build` → `dist/scripts/recalculate-points.js`
- La commande `npm run recalculate:points` utilise maintenant le fichier JavaScript compilé
- Le Dockerfile copie automatiquement tout le dossier `dist/`

**Vérification** :
```bash
# Après build, le script compilé doit exister :
ls dist/scripts/recalculate-points.js
```

---

### ❌ ENOTFOUND postgres.railway.internal (Deprecated)

**Erreur lors de `railway run`** :
```
📍 Database Type: POSTGRES
🌐 Database Host: postgres.railway.internal

❌ Error: getaddrinfo ENOTFOUND postgres.railway.internal
```

**Cause** : 
- `railway run` exécute la commande **sur votre machine locale** avec les variables d'environnement Railway injectées
- L'hostname `postgres.railway.internal` n'est résolvable que **depuis l'intérieur des containers Railway**

**✅ Solution** : Utilisez le **Dashboard Railway** pour exécuter la commande directement dans le container (voir méthode ci-dessus).

---

## 📊 Sortie du Script

### Exemple de Sortie

```
🚀 Starting match points recalculation...

✅ Database connection established

📊 Found 13 completed matches

════════════════════════════════════════════════════════════════════════════════
📈 RECALCULATION SUMMARY
════════════════════════════════════════════════════════════════════════════════
Total matches analyzed: 13
Matches updated: 8
Teams updated: 24
════════════════════════════════════════════════════════════════════════════════

📋 DETAILED CHANGES:

────────────────────────────────────────────────────────────────────────────────
🎮 Match #1 - Basket (ROUND_ROBIN)
────────────────────────────────────────────────────────────────────────────────
  📉 Équipe Rouge          | Rank: 2 | Points: 0 → 8
  📉 Équipe Verte          | Rank: 3 | Points: 0 → 6
  📉 Équipe Bleue          | Rank: 4 | Points: 0 → 5

────────────────────────────────────────────────────────────────────────────────
🎮 Match #2 - Beer Pong (ROUND_ROBIN)
────────────────────────────────────────────────────────────────────────────────
  📉 Équipe Orange         | Rank: 2 | Points: 0 → 8
  📉 Équipe Jaune          | Rank: 3 | Points: 0 → 6

════════════════════════════════════════════════════════════════════════════════
✅ All points have been recalculated successfully!
════════════════════════════════════════════════════════════════════════════════

💡 Next steps:
   1. Check the rankings to verify the changes
   2. Inform users that points have been updated
   3. Review the general ranking

🔌 Database connection closed
```

---

## 🔍 Ce que Fait le Script

### Étape 1 : Connexion
- Se connecte à la base de données (SQLite ou PostgreSQL)
- Utilise les variables d'environnement

### Étape 2 : Récupération
- Récupère tous les matchs avec `status = COMPLETED`
- Charge les relations : game, matchTeams, teams

### Étape 3 : Calcul
Pour chaque match :
- Vérifie le format du jeu (ROUND_ROBIN vs ELIMINATION)
- Calcule les nouveaux points selon la nouvelle logique
- Compare avec les anciens points

### Étape 4 : Mise à Jour
- Met à jour UNIQUEMENT les matchTeams dont les points changent
- Sauvegarde en base de données

### Étape 5 : Rapport
- Affiche un résumé des changements
- Liste détaillée par match et par équipe
- Indique les variations de points (📈 / 📉)

---

## ⚠️ Précautions

### Avant Exécution

✅ **Backup** : Sauvegardez votre base de données
```bash
# PostgreSQL
pg_dump -h host -U user dbname > backup.sql

# SQLite
cp olympiades.sqlite olympiades.sqlite.backup
```

✅ **Test en Local** : Testez d'abord sur votre base SQLite locale

✅ **Vérification** : Notez les classements actuels pour comparer après

### Pendant Exécution

- ⏱️ Le script prend quelques secondes
- 🔒 Évitez de modifier les matchs pendant l'exécution
- 📊 Le script ne touche QUE les matchs complétés

### Après Exécution

- ✅ Vérifiez le classement général
- ✅ Vérifiez les classements par épreuve
- ✅ Testez que l'application fonctionne correctement

---

## 🛠️ Détails Techniques

### Nouvelle Logique Appliquée

```typescript
// ROUND_ROBIN : Toujours système olympique
if (game.gameFormat === GameFormat.ROUND_ROBIN) {
  points = [10, 8, 6, 5, 4, 3, 2, 1][rank - 1] || 0;
}

// ELIMINATION : Dépend du type
else if (game.gameFormat === GameFormat.ELIMINATION) {
  if (game.gameType === 'SCORE') {
    points = rank === 1 ? winPoints : 0;
  } else {
    points = [10, 8, 6, 5, 4, 3, 2, 1][rank - 1] || 0;
  }
}
```

### Fichiers Modifiés

- `match_teams` table : Colonne `points` mise à jour
- Aucune modification sur `matches` table
- Aucune modification sur `games` ou `teams`

### Données Préservées

- ✅ Scores bruts (`rawScore`)
- ✅ Rangs (`rank`)
- ✅ Statut des matchs
- ✅ Toutes les autres données

### Données Modifiées

- 🔄 Points (`points`) dans `match_teams`

---

## 🧪 Test

### Test en Local

```bash
# 1. Sauvegarder
cp backend/olympiades.sqlite backend/olympiades.sqlite.backup

# 2. Noter le classement actuel
# Ouvrir http://localhost:3001/api/rankings

# 3. Exécuter le script
cd backend
npm run recalculate:points

# 4. Vérifier le nouveau classement
# Recharger http://localhost:3001/api/rankings

# 5. Restaurer si besoin
cp backend/olympiades.sqlite.backup backend/olympiades.sqlite
```

---

## ❓ FAQ

### Q1 : Le script modifie-t-il les matchs en cours ?
**Non**, uniquement les matchs avec `status = COMPLETED`.

### Q2 : Puis-je annuler les changements ?
**Oui**, avec un backup de la base de données.

### Q3 : Combien de temps prend le script ?
**Quelques secondes** pour ~50 matchs. Proportionnel au nombre de matchs.

### Q4 : Le script peut-il être exécuté plusieurs fois ?
**Oui**, il est idempotent. Si les points sont déjà corrects, aucun changement.

### Q5 : Faut-il redémarrer l'application ?
**Non**, les changements sont immédiatement visibles.

### Q6 : Que faire si le script échoue ?
1. Vérifier les logs d'erreur
2. Vérifier la connexion DB
3. Restaurer le backup
4. Signaler l'erreur

---

## 🎯 Exemple Concret

### Avant le Script

**Match Basket (ROUND_ROBIN, SCORE)**

| Équipe | Score | Rank | Points (anciens) |
|--------|-------|------|------------------|
| Rouge  | 25    | 1    | 10 ✅            |
| Verte  | 20    | 2    | **0** ❌         |
| Bleue  | 15    | 3    | **0** ❌         |
| Jaune  | 10    | 4    | **0** ❌         |

**Classement Général** : Rouge = 10, Verte = 0, Bleue = 0, Jaune = 0

### Après le Script

**Match Basket (ROUND_ROBIN, SCORE)**

| Équipe | Score | Rank | Points (nouveaux) |
|--------|-------|------|-------------------|
| Rouge  | 25    | 1    | 10 ✅             |
| Verte  | 20    | 2    | **8** ✅          |
| Bleue  | 15    | 3    | **6** ✅          |
| Jaune  | 10    | 4    | **5** ✅          |

**Classement Général** : Rouge = 10, Verte = 8, Bleue = 6, Jaune = 5

---

## 📝 Notes

- Le script utilise les mêmes entités TypeORM que l'application
- Compatible avec SQLite (dev) et PostgreSQL (prod)
- Affiche un résumé clair des modifications
- Logging détaillé pour audit
- Rollback possible avec backup

---

## 🚀 Pour Railway

### Exécution Unique

```bash
railway run npm run recalculate:points
```

### Vérification Avant/Après

```bash
# Avant
railway run curl http://localhost:3001/api/rankings

# Exécution
railway run npm run recalculate:points

# Après
railway run curl http://localhost:3001/api/rankings
```

---

C'est prêt ! 🎉
