# Migration: Remove Rules Column

## Contexte
L'attribut `rules` a été retiré de l'entité `Game`. Cette migration supprime la colonne `rules` de la table `games` en base de données PostgreSQL.

## Fichiers modifiés
- ✅ `src/games/game.entity.ts` - Colonne rules retirée
- ✅ `src/games/dto/create-game.dto.ts` - Propriété rules retirée
- ✅ `src/games/dto/update-game.dto.ts` - Basée sur CreateGameDto (déjà OK)

## Migration créée
- **TypeORM Migration**: `src/migrations/1720046549000-RemoveRulesColumn.ts`
- **SQL Direct**: `migrations/001_remove_rules_column.sql`

---

## Option 1 : Exécuter avec TypeORM (Recommandé)

### En Local (SQLite - Optionnel)
Si vous voulez tester localement :
```bash
cd backend
npm run migration:run
```

### En Production (Railway PostgreSQL)

#### Méthode A : Via Railway CLI
```bash
# Se connecter à Railway
railway login

# Sélectionner le projet
railway link

# Exécuter la migration
railway run npm run migration:run
```

#### Méthode B : Via Déploiement
1. Commitez les fichiers de migration
2. Railway va redéployer
3. Ajoutez un script de démarrage qui exécute les migrations

---

## Option 2 : Exécuter en SQL Direct (Simple)

### Via Railway Dashboard
1. Allez sur Railway → Votre projet
2. Cliquez sur le service **PostgreSQL**
3. Onglet **Data** ou **Connect**
4. Cliquez sur **Query**
5. Exécutez :
```sql
ALTER TABLE games DROP COLUMN IF EXISTS rules;
```

### Via psql (CLI)
```bash
# Récupérer la DATABASE_URL depuis Railway
railway variables

# Se connecter
psql "votre-database-url-ici"

# Exécuter la migration
\i migrations/001_remove_rules_column.sql

# Ou directement
ALTER TABLE games DROP COLUMN IF EXISTS rules;

# Vérifier
\d games
```

---

## Vérification

### Vérifier que la colonne est supprimée
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'games';
```

Vous ne devriez **PAS** voir `rules` dans la liste.

### Colonnes attendues
- id
- name
- description
- gameType
- gameFormat
- scoringDirection
- teamsPerMatch
- unit
- winPoints
- createdAt
- updatedAt

---

## Rollback (Si Besoin)

### TypeORM
```bash
npm run migration:revert
```

### SQL Direct
```sql
ALTER TABLE games ADD COLUMN rules TEXT NOT NULL DEFAULT '';
```

---

## Recommandation

**Pour la production Railway**, je recommande :
1. **Option SQL Direct via Dashboard** (le plus simple, 2 minutes)
   - Connexion directe à la DB
   - Pas besoin de reconfigurer le projet
   - Exécution immédiate

2. **Option TypeORM** (si vous voulez un historique de migrations)
   - Nécessite de configurer la connexion depuis votre machine
   - Plus propre pour le suivi des migrations futures

---

## Après la Migration

Une fois la migration exécutée :
1. ✅ La colonne `rules` sera supprimée
2. ✅ Le backend continuera de fonctionner normalement
3. ✅ Aucune modification du code n'est nécessaire (déjà fait)
4. ✅ Aucun impact sur les données existantes (juste la structure)

---

## Impact

⚠️ **Données perdues** : Si la colonne `rules` contient des données, elles seront définitivement supprimées.

✅ **Pas d'impact applicatif** : Le code backend n'utilise plus ce champ.

✅ **Pas de downtime** : L'opération est rapide (< 1 seconde).
