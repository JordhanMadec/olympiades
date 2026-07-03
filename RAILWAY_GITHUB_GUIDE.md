# 🚀 Guide Railway - Déploiement via GitHub (Interface Web)

Ce guide vous montre comment configurer le déploiement automatique depuis GitHub via l'interface Railway.

## ✅ Avantages de cette méthode

- ✅ Déploiement automatique à chaque commit sur `main`
- ✅ Configuration visuelle plus simple
- ✅ Logs et dashboard intégrés
- ✅ Rollback facile vers versions précédentes
- ✅ Plus fiable que le déploiement CLI

---

## 📋 Prérequis

1. ✅ Code pushé sur GitHub (`JordhanMadec/olympiades`)
2. ✅ Compte Railway connecté
3. ✅ Accès au repository GitHub

---

## 🎯 Étapes Détaillées

### Étape 1 : Créer le Projet Railway

1. Allez sur **https://railway.app**
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Si demandé, autorisez Railway à accéder à vos repos GitHub
5. Cherchez et sélectionnez `JordhanMadec/olympiades`
6. Railway va analyser le repo et proposer de créer des services

⚠️ **NE PAS** déployer automatiquement - nous devons d'abord configurer les chemins !

---

### Étape 2 : Créer la Base de Données PostgreSQL

1. Dans votre nouveau projet Railway
2. Cliquez sur **"+ New"**
3. Sélectionnez **"Database"** → **"Add PostgreSQL"**
4. Attendez que PostgreSQL soit provisionné (quelques secondes)
5. ✅ La base de données est créée !

**Note** : Railway génère automatiquement :
- `DATABASE_URL` (connexion complète)
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

---

### Étape 3 : Créer le Service Backend

1. Cliquez sur **"+ New"** → **"GitHub Repo"**
2. Sélectionnez à nouveau `JordhanMadec/olympiades`
3. Railway détecte le repo

#### Configuration Backend (TRÈS IMPORTANT)

4. Dans le service créé, cliquez sur **Settings**
5. Section **"Build"** :
   - **Root Directory** : `backend`  ⬅️ **CRUCIAL !**
   - **Builder** : Dockerfile
   - **Dockerfile Path** : `Dockerfile` (pas `backend/Dockerfile`)
   
6. Section **"Deploy"** :
   - **Start Command** : `node dist/main`
   - **Healthcheck Path** : `/api`
   
7. Section **"Networking"** :
   - Cliquez sur **"Generate Domain"** pour obtenir une URL temporaire
   
8. **Renommez le service** :
   - En haut, cliquez sur le nom du service
   - Renommez en `backend`

#### Variables d'Environnement Backend

9. Cliquez sur l'onglet **"Variables"**
10. Ajoutez ces variables :

```
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_SSL=true
FRONTEND_URL=https://olympiades.jordhanmadec.fr
```

**Important** : Ne touchez PAS aux variables `DATABASE_*` - elles sont auto-générées !

11. Cliquez sur **"Deploy"** ou attendez le déploiement automatique

---

### Étape 4 : Créer le Service Frontend

1. Cliquez sur **"+ New"** → **"GitHub Repo"**
2. Sélectionnez `JordhanMadec/olympiades` (oui, encore !)
3. Railway crée un nouveau service depuis le même repo

#### Configuration Frontend (TRÈS IMPORTANT)

4. Dans le service créé, cliquez sur **Settings**
5. Section **"Build"** :
   - **Root Directory** : `frontend`  ⬅️ **CRUCIAL !**
   - **Builder** : Dockerfile
   - **Dockerfile Path** : `Dockerfile`
   
6. Section **"Deploy"** :
   - **Start Command** : `serve -s dist -l 3000`
   
7. Section **"Networking"** :
   - Cliquez sur **"Generate Domain"** pour obtenir une URL temporaire
   
8. **Renommez le service** :
   - Renommez en `frontend`

#### Variables d'Environnement Frontend

9. Cliquez sur l'onglet **"Variables"**
10. Ajoutez :

```
VITE_API_URL=https://api.olympiades.jordhanmadec.fr
```

11. Cliquez sur **"Deploy"**

---

### Étape 5 : Configurer les Domaines Personnalisés

#### Backend - api.olympiades.jordhanmadec.fr

1. Ouvrez le service **backend**
2. Onglet **"Settings"**
3. Section **"Networking"** → **"Public Networking"**
4. Cliquez sur **"Custom Domain"**
5. Entrez : `api.olympiades.jordhanmadec.fr`
6. Railway affiche un **CNAME** à configurer (ex: `xxx.up.railway.app`)
7. **NOTEZ CE CNAME** (vous en aurez besoin pour OVH)

#### Frontend - olympiades.jordhanmadec.fr

1. Ouvrez le service **frontend**
2. Onglet **"Settings"**
3. Section **"Networking"** → **"Public Networking"**
4. Cliquez sur **"Custom Domain"**
5. Entrez : `olympiades.jordhanmadec.fr`
6. Railway affiche un **CNAME** à configurer
7. **NOTEZ CE CNAME**

---

### Étape 6 : Configurer le DNS sur OVH

1. Connectez-vous à votre espace client OVH : **https://www.ovh.com/manager/**
2. Allez dans **"Noms de domaine"** → `jordhanmadec.fr`
3. Cliquez sur l'onglet **"Zone DNS"**
4. Cliquez sur **"Ajouter une entrée"**

#### Pour le Frontend

5. Sélectionnez **"CNAME"**
6. Remplissez :
   - **Sous-domaine** : `olympiades`
   - **Cible** : `[le CNAME fourni par Railway pour frontend]`
   - Exemple : `frontend-production-xxxx.up.railway.app`
7. Cliquez sur **"Suivant"** puis **"Valider"**

#### Pour le Backend

8. Cliquez à nouveau sur **"Ajouter une entrée"**
9. Sélectionnez **"CNAME"**
10. Remplissez :
    - **Sous-domaine** : `api.olympiades`
    - **Cible** : `[le CNAME fourni par Railway pour backend]`
    - Exemple : `backend-production-xxxx.up.railway.app`
11. Cliquez sur **"Suivant"** puis **"Valider"**

⏱️ **Propagation DNS** : 15 minutes à 48h (souvent < 1h)

---

### Étape 7 : Configurer le Déploiement Automatique

Bonne nouvelle : **c'est déjà fait !** ✅

Railway surveille automatiquement :
- La branche `main` (par défaut)
- Tout commit déclenche un nouveau déploiement

#### Pour Vérifier :

1. Dans chaque service (backend et frontend)
2. Onglet **"Settings"** → Section **"Source"**
3. Vérifiez que :
   - **Repository** : `JordhanMadec/olympiades`
   - **Branch** : `main`
   - **Auto Deploy** : activé ✅

#### Pour Changer la Branche :

Si vous voulez déployer depuis une autre branche :
1. **Settings** → **Source**
2. Cliquez sur **"Configure"**
3. Changez la branche
4. Sauvegardez

---

### Étape 8 : Migrer les Données

Maintenant que tout est déployé, importez vos données SQLite :

#### Option A : Via l'API (Recommandé)

Une fois le backend déployé, TypeORM crée automatiquement les tables avec `synchronize: true`.

Vous pouvez ensuite :
1. Utiliser Postman/curl pour créer les données via l'API
2. Ou créer un script d'import qui utilise l'API

#### Option B : Connexion Directe PostgreSQL

1. Dans Railway, cliquez sur le service **PostgreSQL**
2. Onglet **"Data"** ou **"Connect"**
3. Railway affiche une commande de connexion :
   ```bash
   psql postgresql://user:pass@host:port/database
   ```
4. Connectez-vous et insérez vos données manuellement

#### Option C : Script d'Import

Créez un script Node.js qui :
1. Lit `data-export.json`
2. Se connecte à PostgreSQL avec les variables d'environnement Railway
3. Insert les données

---

### Étape 9 : Vérifier le Déploiement

#### Logs

Dans Railway, chaque service a un onglet **"Logs"** :
- Vérifiez que le build réussit
- Vérifiez que l'app démarre
- Cherchez les erreurs

#### Tests

```bash
# Tester le backend (une fois DNS propagé)
curl https://api.olympiades.jordhanmadec.fr/api

# Tester le frontend
curl https://olympiades.jordhanmadec.fr
```

Ou ouvrez dans le navigateur :
- https://olympiades.jordhanmadec.fr
- https://api.olympiades.jordhanmadec.fr/api

#### SSL/HTTPS

Railway génère automatiquement les certificats SSL via Let's Encrypt. Cela peut prendre 5-10 minutes après la configuration DNS.

---

## 📊 Structure Finale

```
Railway Project: olympiades-production
│
├── Service: backend
│   ├── Source: GitHub (JordhanMadec/olympiades)
│   ├── Root Directory: backend
│   ├── Branch: main
│   ├── Auto Deploy: ✅
│   └── Domain: api.olympiades.jordhanmadec.fr
│
├── Service: frontend
│   ├── Source: GitHub (JordhanMadec/olympiades)
│   ├── Root Directory: frontend
│   ├── Branch: main
│   ├── Auto Deploy: ✅
│   └── Domain: olympiades.jordhanmadec.fr
│
└── Database: PostgreSQL
    └── Auto-linked to backend
```

---

## 🔄 Workflow de Développement

Maintenant, à chaque fois que vous faites :

```bash
git add .
git commit -m "Mon changement"
git push origin main
```

Railway détecte le commit et :
1. ✅ Build les services concernés (backend et/ou frontend)
2. ✅ Déploie automatiquement
3. ✅ Vous recevez une notification du résultat

---

## 🐛 Dépannage

### Le build échoue

1. Vérifiez les logs dans Railway
2. Vérifiez que **Root Directory** est bien configuré :
   - Backend : `backend`
   - Frontend : `frontend`
3. Vérifiez que les Dockerfiles sont corrects

### Les domaines ne fonctionnent pas

1. Vérifiez la configuration DNS sur OVH
2. Utilisez `nslookup` pour vérifier la propagation :
   ```bash
   nslookup olympiades.jordhanmadec.fr
   nslookup api.olympiades.jordhanmadec.fr
   ```
3. Attendez la propagation DNS (peut prendre jusqu'à 48h)

### Erreur CORS

1. Vérifiez que `FRONTEND_URL` est bien configuré dans le backend
2. Vérifiez que `VITE_API_URL` est bien configuré dans le frontend
3. Redéployez si nécessaire

### Base de données ne se connecte pas

1. Vérifiez que PostgreSQL est bien lié au backend
2. Vérifiez que `DATABASE_TYPE=postgres` est défini
3. Vérifiez les logs du backend pour les erreurs de connexion

---

## 🎉 Félicitations !

Votre application est maintenant :
- ✅ Hébergée sur Railway
- ✅ Déployée automatiquement depuis GitHub
- ✅ Accessible via vos domaines personnalisés
- ✅ Avec SSL/HTTPS automatique
- ✅ Base de données PostgreSQL managée

---

## 📞 Ressources

- Dashboard Railway : https://railway.app
- Documentation Railway : https://docs.railway.app
- Support Railway : https://help.railway.app
- Espace OVH : https://www.ovh.com/manager/

---

## 💡 Bonus : Commandes Utiles

```bash
# Vérifier la propagation DNS
nslookup olympiades.jordhanmadec.fr
nslookup api.olympiades.jordhanmadec.fr

# Tester les endpoints
curl -I https://api.olympiades.jordhanmadec.fr/api
curl -I https://olympiades.jordhanmadec.fr

# Vérifier le certificat SSL
openssl s_client -connect olympiades.jordhanmadec.fr:443 -servername olympiades.jordhanmadec.fr
```
