# 🔧 Fix Railway Deployment - Instructions

## Problème Identifié

Railway essaie de build depuis la racine du projet, mais vos Dockerfiles sont dans `backend/` et `frontend/`.

**Erreur**: `npm error enoent Could not read package.json`

## ✅ Solution

Railway doit déployer **depuis chaque sous-dossier** avec l'option `--path-as-root`.

### Méthode 1 : Ligne de Commande (Recommandé)

**Backend:**
```bash
cd /Users/jordhan/dev/olympiades
railway up backend --path-as-root --service backend

# Ou si le service n'existe pas encore:
railway up backend --path-as-root --new --name olympiades-backend
```

**Frontend:**
```bash
cd /Users/jordhan/dev/olympiades
railway up frontend --path-as-root --service frontend

# Ou si le service n'existe pas encore:
railway up frontend --path-as-root --new --name olympiades-frontend
```

### Méthode 2 : Depuis le Sous-Dossier

**Backend:**
```bash
cd backend
railway up
```

**Frontend:**
```bash
cd frontend
railway up
```

### Méthode 3 : Configuration Railway (Automatique)

Créer un fichier `railway.json` à la racine qui spécifie les chemins :

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile",
    "watchPatterns": ["backend/**"]
  },
  "deploy": {
    "startCommand": "node dist/main"
  }
}
```

## 🚀 Commandes Complètes

### Étape 1: Créer le Projet (une seule fois)
```bash
cd /Users/jordhan/dev/olympiades
railway init --name olympiades-production
```

### Étape 2: Créer PostgreSQL Database
Via l'interface Railway:
1. https://railway.app
2. Ouvrir le projet `olympiades-production`
3. New → Database → PostgreSQL

### Étape 3: Déployer Backend
```bash
# Créer et déployer le service backend
railway up backend --path-as-root --new --name backend

# Attendre que le build termine, puis configurer les variables
railway variables set NODE_ENV=production --service backend
railway variables set DATABASE_TYPE=postgres --service backend
railway variables set DATABASE_SSL=true --service backend
railway variables set FRONTEND_URL=https://olympiades.jordhanmadec.fr --service backend
```

### Étape 4: Déployer Frontend
```bash
# Créer et déployer le service frontend
railway up frontend --path-as-root --new --name frontend

# Configurer la variable
railway variables set VITE_API_URL=https://api.olympiades.jordhanmadec.fr --service frontend
```

### Étape 5: Configurer les Domaines
Dans Railway dashboard:
1. **Backend service** → Settings → Networking → Custom Domain → `api.olympiades.jordhanmadec.fr`
2. **Frontend service** → Settings → Networking → Custom Domain → `olympiades.jordhanmadec.fr`

### Étape 6: DNS OVH
Configurer les CNAME avec les valeurs fournies par Railway.

## ⚠️ Note Importante

Quand vous utilisez `railway up` depuis la racine, vous **devez** spécifier le chemin avec `--path-as-root`.

## 🔍 Vérifier le Déploiement

```bash
# Voir les logs
railway logs --service backend
railway logs --service frontend

# Ouvrir le dashboard
railway open
```

## 💡 Alternative: Structure Mono-Service

Si vous préférez, vous pouvez aussi créer deux projets Railway séparés:
- `olympiades-backend` (deployer depuis `/backend`)
- `olympiades-frontend` (deployer depuis `/frontend`)

Mais la méthode multi-service dans un seul projet est plus simple pour gérer PostgreSQL.
