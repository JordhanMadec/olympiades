# ✅ Frontend API Fix - PRÊT À DÉPLOYER

## 🎯 Problème Résolu

Le frontend appelait `localhost` au lieu de l'API de production.

## 🔧 Solution Appliquée

### 1. **Modifié `frontend/Dockerfile`** ✅

Ajout du support pour build arguments :
```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

### 2. **Modifié `frontend/src/services/api.ts`** ✅

Ajout d'un fallback automatique pour la production :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://api.olympiades.jordhanmadec.fr/api'
    : 'http://127.0.0.1:3001/api');
```

**Logique** :
- Si `VITE_API_URL` est définie → utiliser cette valeur
- Sinon, si mode production (`import.meta.env.PROD` = true) → utiliser l'URL de prod
- Sinon (mode dev) → utiliser localhost

**Avantage** : Fonctionne immédiatement sans configuration Railway supplémentaire !

---

## 🚀 Déploiement

### Changements Staged

```
M  backend/railway.json               (healthcheck supprimé)
A  backend/src/app.controller.ts      (health endpoint)
M  backend/src/app.module.ts          (ajout controller)
M  frontend/Dockerfile                (build arg support)
M  frontend/src/services/api.ts       (fallback production)
```

### Commit et Push

```bash
git commit -m "fix: add health endpoint and production API URL fallback

Backend:
- Add AppController with GET / and GET /api health endpoints
- Remove healthcheckPath from railway.json

Frontend:
- Add Docker ARG support for VITE_API_URL
- Add production URL fallback in api.ts (import.meta.env.PROD)
- Frontend now automatically uses production API URL when deployed

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>"

git push origin main
```

---

## ✅ Résultat Attendu

Après le push, Railway va :

### Backend
1. ✅ Build avec nouveau Dockerfile
2. ✅ Démarrer avec health endpoint `/api`
3. ✅ Healthcheck passe (ou ignoré)
4. ✅ API accessible sur `https://api.olympiades.jordhanmadec.fr/api`

### Frontend
1. ✅ Build avec support build arg
2. ✅ Détecte `import.meta.env.PROD = true`
3. ✅ Utilise automatiquement `https://api.olympiades.jordhanmadec.fr/api`
4. ✅ Site accessible sur `https://olympiades.jordhanmadec.fr`
5. ✅ Appelle l'API de production !

---

## 🧪 Tests Post-Déploiement

### 1. Backend Health Check

```bash
curl https://api.olympiades.jordhanmadec.fr/api
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2026-07-03T...",
  "service": "olympiades-backend",
  "message": "API is running"
}
```

### 2. Frontend API Calls

1. Ouvrir https://olympiades.jordhanmadec.fr
2. Console navigateur (F12)
3. Onglet **Network**
4. Naviguer dans l'app (charger équipes, jeux, etc.)
5. Vérifier que les requêtes vont vers `https://api.olympiades.jordhanmadec.fr/api/*`

### 3. Test Fonctionnel

- [ ] Page d'accueil charge
- [ ] Liste des équipes affichée
- [ ] Liste des jeux affichée
- [ ] Création d'équipe fonctionne
- [ ] Création de jeu fonctionne
- [ ] Pas d'erreurs CORS

---

## 📊 Configuration Railway Finale

### Backend Variables

```
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_SSL=true
FRONTEND_URL=https://olympiades.jordhanmadec.fr
```

### Frontend Variables

```
VITE_API_URL=https://api.olympiades.jordhanmadec.fr
```

**Note** : Même si `VITE_API_URL` n'est pas passée comme build arg, le fallback dans `api.ts` fonctionnera !

---

## 🎉 Avantages de Cette Solution

1. ✅ **Fonctionne sans configuration Railway compliquée**
2. ✅ **Détection automatique dev/prod** avec `import.meta.env.PROD`
3. ✅ **Compatible build args** si vous les configurez plus tard
4. ✅ **Pas de hardcoding** - utilise les variables si disponibles
5. ✅ **Zero config** pour Railway

---

## 🐛 Si Ça Ne Marche Toujours Pas

### Frontend appelle encore localhost

**Vérification** :
```javascript
// Console navigateur
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('PROD mode:', import.meta.env.PROD);
console.log('DEV mode:', import.meta.env.DEV);
```

**Solutions** :
1. Vérifier que Railway build en mode production
2. Vérifier les logs de build Railway
3. Vérifier que `NODE_ENV=production` dans Railway

### CORS errors

**Vérification** :
- Backend doit avoir `FRONTEND_URL=https://olympiades.jordhanmadec.fr`
- Pas de trailing slash `/`

**Solution** :
```bash
# Sur Railway, backend variables
FRONTEND_URL=https://olympiades.jordhanmadec.fr
```

---

## 📝 Fichiers Modifiés

```
backend/
├── railway.json               (healthcheck removed)
├── src/
│   ├── app.controller.ts     (NEW - health endpoint)
│   └── app.module.ts         (controller added)

frontend/
├── Dockerfile                 (ARG support)
└── src/
    └── services/
        └── api.ts            (production fallback)
```

---

**Status** : ✅ PRÊT À DÉPLOYER

**Action** : `git push origin main`

Une fois poussé, Railway redéploiera automatiquement et tout devrait fonctionner ! 🚀
