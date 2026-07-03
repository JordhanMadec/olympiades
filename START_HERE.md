# 🚀 DÉMARRAGE RAPIDE - Railway avec GitHub

**Version courte pour déployer immédiatement**

---

## ⚡ Actions à Faire MAINTENANT

### 1. Sur Railway.app (10 min)

🔗 **https://railway.app**

1. **"New Project"** → **"Deploy from GitHub repo"**
2. Sélectionner `JordhanMadec/olympiades`
3. **"+ New"** → **"Database"** → **"PostgreSQL"**

**Service Backend :**
4. **"+ New"** → **"GitHub Repo"** → `JordhanMadec/olympiades`
5. Settings → Build → **Root Directory** : `backend`
6. Renommer service : `backend`
7. Variables :
   ```
   NODE_ENV=production
   DATABASE_TYPE=postgres
   DATABASE_SSL=true
   FRONTEND_URL=https://olympiades.jordhanmadec.fr
   ```

**Service Frontend :**
8. **"+ New"** → **"GitHub Repo"** → `JordhanMadec/olympiades`
9. Settings → Build → **Root Directory** : `frontend`
10. Renommer service : `frontend`
11. Variables :
    ```
    VITE_API_URL=https://api.olympiades.jordhanmadec.fr
    ```

**Domaines :**
12. Backend → Settings → Networking → Custom Domain : `api.olympiades.jordhanmadec.fr`
13. Frontend → Settings → Networking → Custom Domain : `olympiades.jordhanmadec.fr`
14. **NOTER LES 2 CNAME** fournis par Railway

---

### 2. Sur OVH (5 min)

🔗 **https://www.ovh.com/manager/**

1. **Noms de domaine** → `jordhanmadec.fr` → **Zone DNS**
2. **Ajouter une entrée** → CNAME
   - Sous-domaine : `olympiades`
   - Cible : `[CNAME Railway frontend]`
3. **Ajouter une entrée** → CNAME
   - Sous-domaine : `api.olympiades`
   - Cible : `[CNAME Railway backend]`

---

## ⚠️ Point CRUCIAL

**Root Directory est la clé du succès :**

| Service  | Root Directory |
|----------|---------------|
| backend  | `backend`     |
| frontend | `frontend`    |

Sans ça, le build échoue avec `package.json not found` !

---

## ✅ Résultat

Après 15-60 min (propagation DNS) :
- ✅ https://olympiades.jordhanmadec.fr
- ✅ https://api.olympiades.jordhanmadec.fr/api
- ✅ Auto-deploy à chaque commit sur `main`

---

## 📚 Guides Détaillés

- **Guide complet** : `RAILWAY_GITHUB_GUIDE.md`
- **Checklist** : `RAILWAY_CHECKLIST.md`
- **Visuel** : `RAILWAY_VISUAL.md`

---

**Temps estimé** : 15-20 min de config + attente DNS

**Bon déploiement ! 🚀**
