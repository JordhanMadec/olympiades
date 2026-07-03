# ✅ Railway GitHub Deploy - Checklist Rapide

## 🎯 Configuration Étape par Étape

### 1️⃣ Créer le Projet (2 min)

- [ ] Aller sur https://railway.app
- [ ] Cliquer **"New Project"**
- [ ] Sélectionner **"Deploy from GitHub repo"**
- [ ] Choisir `JordhanMadec/olympiades`
- [ ] **Ne pas déployer encore !**

---

### 2️⃣ PostgreSQL (1 min)

- [ ] Cliquer **"+ New"** → **"Database"** → **"Add PostgreSQL"**
- [ ] Attendre la création (30 secondes)
- [ ] ✅ PostgreSQL prêt

---

### 3️⃣ Backend (5 min)

- [ ] Cliquer **"+ New"** → **"GitHub Repo"** → `JordhanMadec/olympiades`
- [ ] Renommer le service en `backend`
- [ ] **Settings** → **Build** :
  - [ ] **Root Directory** : `backend` ⚠️ **CRUCIAL**
  - [ ] **Builder** : Dockerfile
  - [ ] **Dockerfile Path** : `Dockerfile`
- [ ] **Settings** → **Deploy** :
  - [ ] **Start Command** : `node dist/main`
- [ ] **Variables** → Ajouter :
  ```
  NODE_ENV=production
  DATABASE_TYPE=postgres
  DATABASE_SSL=true
  FRONTEND_URL=https://olympiades.jordhanmadec.fr
  ```
- [ ] Cliquer **"Deploy"**

---

### 4️⃣ Frontend (5 min)

- [ ] Cliquer **"+ New"** → **"GitHub Repo"** → `JordhanMadec/olympiades`
- [ ] Renommer le service en `frontend`
- [ ] **Settings** → **Build** :
  - [ ] **Root Directory** : `frontend` ⚠️ **CRUCIAL**
  - [ ] **Builder** : Dockerfile
  - [ ] **Dockerfile Path** : `Dockerfile`
- [ ] **Settings** → **Deploy** :
  - [ ] **Start Command** : `serve -s dist -l 3000`
- [ ] **Variables** → Ajouter :
  ```
  VITE_API_URL=https://api.olympiades.jordhanmadec.fr
  ```
- [ ] Cliquer **"Deploy"**

---

### 5️⃣ Domaines Railway (2 min)

#### Backend
- [ ] Service `backend` → **Settings** → **Networking**
- [ ] **Custom Domain** : `api.olympiades.jordhanmadec.fr`
- [ ] **Noter le CNAME** (ex: `backend-production-xxxx.up.railway.app`)

#### Frontend
- [ ] Service `frontend` → **Settings** → **Networking**
- [ ] **Custom Domain** : `olympiades.jordhanmadec.fr`
- [ ] **Noter le CNAME** (ex: `frontend-production-xxxx.up.railway.app`)

---

### 6️⃣ DNS OVH (5 min)

- [ ] Aller sur https://www.ovh.com/manager/
- [ ] **Noms de domaine** → `jordhanmadec.fr`
- [ ] **Zone DNS** → **Ajouter une entrée**

#### Frontend
- [ ] Type : **CNAME**
- [ ] Sous-domaine : `olympiades`
- [ ] Cible : `[CNAME Railway frontend]`
- [ ] Valider

#### Backend
- [ ] Type : **CNAME**
- [ ] Sous-domaine : `api.olympiades`
- [ ] Cible : `[CNAME Railway backend]`
- [ ] Valider

---

### 7️⃣ Vérification (2 min)

- [ ] Vérifier les logs Railway (onglet **Logs** de chaque service)
- [ ] Attendre la propagation DNS (15 min - 1h généralement)
- [ ] Tester : https://olympiades.jordhanmadec.fr
- [ ] Tester : https://api.olympiades.jordhanmadec.fr/api

---

### 8️⃣ Migrer les Données

- [ ] Backend déployé → tables créées automatiquement
- [ ] Importer `data-export.json` via :
  - [ ] API REST (Postman)
  - [ ] Connexion PostgreSQL directe
  - [ ] Script d'import personnalisé

---

## 🔍 Points Critiques

### ⚠️ Le plus important : Root Directory

**BACKEND** :
```
Root Directory: backend
Dockerfile Path: Dockerfile
```

**FRONTEND** :
```
Root Directory: frontend
Dockerfile Path: Dockerfile
```

Sans cela, le build échoue avec `package.json not found` !

---

## 🎯 Résultat Final

✅ 3 services dans Railway :
- `backend` (Node.js)
- `frontend` (React)
- `PostgreSQL`

✅ Auto-deploy depuis GitHub :
- Chaque commit sur `main` → déploiement automatique
- Branche : `main`
- Repo : `JordhanMadec/olympiades`

✅ Domaines :
- Frontend : https://olympiades.jordhanmadec.fr
- Backend : https://api.olympiades.jordhanmadec.fr

---

## 🐛 Si ça ne marche pas

### Build Backend échoue
1. Vérifier **Root Directory** = `backend`
2. Vérifier logs Railway
3. Vérifier que `pg` est dans `package.json`

### Build Frontend échoue
1. Vérifier **Root Directory** = `frontend`
2. Vérifier logs Railway
3. Vérifier que `serve` est installé globalement dans le Dockerfile

### Domaines ne fonctionnent pas
1. Vérifier les CNAME sur OVH
2. Attendre propagation DNS
3. Vérifier avec `nslookup olympiades.jordhanmadec.fr`

### CORS error
1. Vérifier `FRONTEND_URL` dans backend
2. Vérifier `VITE_API_URL` dans frontend
3. Redéployer les services

---

## 📞 Aide

Pour le guide détaillé : voir **RAILWAY_GITHUB_GUIDE.md**

---

Temps total estimé : **20-30 minutes** (+ propagation DNS)
