# 🎯 Configuration Railway - Résumé Visuel

## Structure Projet Railway

```
📦 Projet: olympiades-production
│
├── 🗄️ PostgreSQL Database
│   ├── Auto-généré: DATABASE_URL
│   ├── Auto-généré: DATABASE_HOST, PORT, USER, PASSWORD, NAME
│   └── Connecté à: backend (automatique)
│
├── 🔧 Service: backend
│   ├── 📁 Root Directory: backend         ⚠️ CRUCIAL
│   ├── 🐳 Builder: Dockerfile
│   ├── 📄 Dockerfile Path: Dockerfile
│   ├── ▶️  Start Command: node dist/main
│   ├── 🌿 Branch: main
│   ├── 🔄 Auto Deploy: ON
│   ├── 🌐 Custom Domain: api.olympiades.jordhanmadec.fr
│   └── 🔧 Variables:
│       ├── NODE_ENV=production
│       ├── DATABASE_TYPE=postgres
│       ├── DATABASE_SSL=true
│       └── FRONTEND_URL=https://olympiades.jordhanmadec.fr
│
└── 🎨 Service: frontend
    ├── 📁 Root Directory: frontend        ⚠️ CRUCIAL
    ├── 🐳 Builder: Dockerfile
    ├── 📄 Dockerfile Path: Dockerfile
    ├── ▶️  Start Command: serve -s dist -l 3000
    ├── 🌿 Branch: main
    ├── 🔄 Auto Deploy: ON
    ├── 🌐 Custom Domain: olympiades.jordhanmadec.fr
    └── 🔧 Variables:
        └── VITE_API_URL=https://api.olympiades.jordhanmadec.fr
```

---

## Configuration DNS OVH

```
🌐 Zone DNS: jordhanmadec.fr

┌─────────────────────┬──────┬───────────────────────────────────────┐
│ Sous-domaine        │ Type │ Cible                                 │
├─────────────────────┼──────┼───────────────────────────────────────┤
│ olympiades          │ CNAME│ frontend-production-xxxx.up.railway.app │
│ api.olympiades      │ CNAME│ backend-production-xxxx.up.railway.app  │
└─────────────────────┴──────┴───────────────────────────────────────┘
```

⚠️ Remplacez `xxxx` par les valeurs fournies par Railway

---

## Workflow de Développement

```
💻 Local Development
    │
    ├── git add .
    ├── git commit -m "..."
    └── git push origin main
          │
          ↓
🚀 Railway (Auto-Deploy)
    │
    ├── Détecte le commit
    ├── Build backend (si changements dans /backend)
    ├── Build frontend (si changements dans /frontend)
    └── Deploy automatiquement
          │
          ↓
🌐 Production
    │
    ├── https://olympiades.jordhanmadec.fr (frontend)
    └── https://api.olympiades.jordhanmadec.fr (backend)
```

---

## Variables d'Environnement

### Backend (Railway Dashboard)
```env
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_SSL=true
FRONTEND_URL=https://olympiades.jordhanmadec.fr

# Auto-générées par Railway PostgreSQL:
# DATABASE_URL
# DATABASE_HOST
# DATABASE_PORT
# DATABASE_USER
# DATABASE_PASSWORD
# DATABASE_NAME
```

### Frontend (Railway Dashboard)
```env
VITE_API_URL=https://api.olympiades.jordhanmadec.fr
```

---

## Fichiers Importants dans le Repo

```
olympiades/
│
├── backend/
│   ├── Dockerfile              ✅ Build optimisé multi-stage
│   ├── railway.json            ✅ Config Railway
│   ├── package.json
│   ├── src/
│   │   ├── app.module.ts       ✅ TypeORM configuré pour PostgreSQL
│   │   └── main.ts             ✅ CORS configuré
│   └── scripts/
│       └── export-sqlite.js    ✅ Export données
│
├── frontend/
│   ├── Dockerfile              ✅ Build optimisé multi-stage
│   ├── railway.json            ✅ Config Railway
│   ├── package.json
│   └── src/
│       └── services/
│           └── api.ts          ✅ VITE_API_URL configuré
│
└── Documentation/
    ├── RAILWAY_GITHUB_GUIDE.md     📖 Guide détaillé
    ├── RAILWAY_CHECKLIST.md        ✅ Checklist rapide
    └── RAILWAY_VISUAL.md           📊 Ce fichier
```

---

## Points de Vérification

### ✅ Configuration Railway Correcte

| Service  | Root Directory | Dockerfile Path | Start Command          |
|----------|---------------|-----------------|------------------------|
| backend  | `backend`     | `Dockerfile`    | `node dist/main`       |
| frontend | `frontend`    | `Dockerfile`    | `serve -s dist -l 3000`|

### ✅ Variables Définies

| Service  | Variables Requises |
|----------|--------------------|
| backend  | 4 variables        |
| frontend | 1 variable         |

### ✅ Domaines Configurés

| Service  | Domaine                              |
|----------|--------------------------------------|
| backend  | api.olympiades.jordhanmadec.fr      |
| frontend | olympiades.jordhanmadec.fr          |

### ✅ DNS OVH Configuré

| Enregistrement        | Statut |
|----------------------|--------|
| olympiades (CNAME)   | ⏳/✅   |
| api.olympiades (CNAME)| ⏳/✅   |

---

## Commandes de Vérification

```bash
# Vérifier propagation DNS
nslookup olympiades.jordhanmadec.fr
nslookup api.olympiades.jordhanmadec.fr

# Tester les endpoints (après propagation)
curl https://api.olympiades.jordhanmadec.fr/api
curl https://olympiades.jordhanmadec.fr

# Vérifier SSL
curl -I https://olympiades.jordhanmadec.fr
```

---

## Timeline Typique

```
🕐 T+0 min     : Configuration Railway (15 min)
🕑 T+15 min    : Premier déploiement (5 min)
🕒 T+20 min    : Configuration DNS OVH (5 min)
🕓 T+25 min    : Attente propagation DNS (15 min - 48h)
🕔 T+40 min    : Tests et vérification (5 min)
🎉 T+45 min    : Application en production ! ✅
```

*Note : La propagation DNS est généralement < 1h*

---

## État Actuel

- [x] Code préparé pour Railway
- [x] Dockerfiles optimisés
- [x] Configuration TypeORM PostgreSQL
- [x] Variables d'environnement configurées
- [x] CORS configuré
- [x] Données SQLite exportées
- [ ] Services créés sur Railway
- [ ] Domaines configurés
- [ ] DNS OVH configuré
- [ ] Application déployée

**Prochaine étape** : Suivre le guide RAILWAY_GITHUB_GUIDE.md
