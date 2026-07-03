# Guide de Déploiement Railway - Application Olympiades

Ce guide vous accompagne pour déployer votre application sur Railway avec PostgreSQL.

## 📋 Prérequis

- ✅ Compte Railway créé
- ✅ Railway CLI installé (`railway --version` doit afficher la version)
- ✅ Nom de domaine `olympiades.jordhanmadec.fr` sur OVH
- ✅ Code source prêt avec les configurations PostgreSQL

## 🚀 Étapes de Déploiement

### 1. Authentification Railway

```bash
railway login
```

Cela ouvrira votre navigateur pour vous connecter.

### 2. Créer le Projet Railway

```bash
# À la racine du projet
railway init
```

Suivez les instructions :
- Choisissez "Create a new project"
- Nommez le projet : `olympiades-production`

### 3. Créer la Base de Données PostgreSQL

Dans l'interface web Railway :
1. Allez sur https://railway.app
2. Ouvrez votre projet `olympiades-production`
3. Cliquez sur "New" → "Database" → "Add PostgreSQL"
4. Notez les variables d'environnement (elles seront automatiquement disponibles)

### 4. Déployer le Backend

⚠️ **Important** : Déployez depuis la racine avec `--path-as-root` :

```bash
# Depuis la racine du projet (/Users/jordhan/dev/olympiades)
railway up backend --path-as-root --service backend

# OU créer un nouveau service :
railway up backend --path-as-root --new --name backend
```

Après le déploiement, configurez les variables d'environnement dans Railway :

```bash
railway variables set NODE_ENV=production --service backend
railway variables set DATABASE_TYPE=postgres --service backend
railway variables set DATABASE_SSL=true --service backend
railway variables set FRONTEND_URL=https://olympiades.jordhanmadec.fr --service backend
```

**Important** : Railway connecte automatiquement le backend à PostgreSQL via `DATABASE_URL`. Les variables `DATABASE_HOST`, `DATABASE_PORT`, etc., seront extraites automatiquement.

### 5. Migrer les Données

```bash
# Exporter les données SQLite (depuis la racine du projet)
cd backend
node scripts/export-sqlite.js
```

Cela crée un fichier `data-export.json` avec toutes vos données.

**Pour importer dans PostgreSQL** :
- Option 1 : Utiliser TypeORM synchronize (déjà activé en dev)
- Option 2 : Créer un script d'import personnalisé
- Option 3 : Utiliser un outil comme pgAdmin pour importer les données

### 6. Déployer le Frontend

⚠️ **Important** : Déployez depuis la racine avec `--path-as-root` :

```bash
# Depuis la racine du projet (/Users/jordhan/dev/olympiades)
railway up frontend --path-as-root --service frontend

# OU créer un nouveau service :
railway up frontend --path-as-root --new --name frontend
```

Configurez la variable d'environnement :

```bash
railway variables set VITE_API_URL=https://api.olympiades.jordhanmadec.fr --service frontend
```

### 7. Configurer les Domaines Personnalisés

Dans l'interface Railway :

**Pour le Backend :**
1. Allez dans les settings du service backend
2. Section "Networking" → "Public Networking"
3. Cliquez sur "Generate Domain" pour obtenir une URL Railway
4. Cliquez sur "Custom Domain"
5. Entrez : `api.olympiades.jordhanmadec.fr`
6. Notez les valeurs CNAME à configurer sur OVH

**Pour le Frontend :**
1. Même processus dans le service frontend
2. Entrez : `olympiades.jordhanmadec.fr`
3. Notez les valeurs CNAME à configurer sur OVH

### 8. Configurer le DNS sur OVH

Connectez-vous à votre espace client OVH :

1. Allez dans "Noms de domaine" → `jordhanmadec.fr`
2. Onglet "Zone DNS"
3. Ajoutez les enregistrements CNAME :

```
Type: CNAME
Sous-domaine: olympiades
Cible: [URL fournie par Railway pour le frontend]

Type: CNAME
Sous-domaine: api.olympiades
Cible: [URL fournie par Railway pour le backend]
```

4. Sauvegardez les modifications

⚠️ **La propagation DNS peut prendre 24-48h** (souvent plus rapide)

### 9. Vérifier le Déploiement

```bash
# Tester le backend
curl https://api.olympiades.jordhanmadec.fr/api

# Tester le frontend
curl https://olympiades.jordhanmadec.fr
```

## 🔧 Commandes Utiles

```bash
# Voir les logs du backend
cd backend && railway logs

# Voir les logs du frontend
cd frontend && railway logs

# Ouvrir le dashboard Railway
railway open

# Redéployer après changements
railway up --detach
```

## 📊 Structure Railway

Votre projet aura 3 services :
1. **PostgreSQL** - Base de données (géré par Railway)
2. **Backend** - API NestJS
3. **Frontend** - Application React

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez les logs : `railway logs`
- Vérifiez que `DATABASE_TYPE=postgres` est bien défini
- Vérifiez la connexion PostgreSQL

### Le frontend ne charge pas
- Vérifiez que `VITE_API_URL` pointe vers le bon domaine
- Vérifiez les logs CORS dans le backend

### Les domaines ne fonctionnent pas
- Attendez la propagation DNS (vérifier avec `nslookup`)
- Vérifiez que les CNAME sont bien configurés sur OVH
- Railway génère automatiquement les certificats SSL (peut prendre quelques minutes)

## 📝 Variables d'Environnement

### Backend
```
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_SSL=true
FRONTEND_URL=https://olympiades.jordhanmadec.fr
```

### Frontend
```
VITE_API_URL=https://api.olympiades.jordhanmadec.fr
```

## 🎉 Prochaines Étapes

1. Configurez les sauvegardes automatiques de la base de données
2. Mettez en place un monitoring (Railway inclut des métriques basiques)
3. Configurez les webhooks pour les déploiements automatiques depuis GitHub

## 📞 Support

- Documentation Railway : https://docs.railway.app
- Support OVH : https://www.ovh.com/fr/support/
