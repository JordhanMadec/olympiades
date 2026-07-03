# ⚙️ Railway Configuration - Variables d'Environnement

## Configuration Backend

### Variables Normales (Runtime)

Dans Railway Dashboard → Service **backend** → **Variables** :

```
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_SSL=true
FRONTEND_URL=https://olympiades.jordhanmadec.fr
```

**Note** : Les variables PostgreSQL (`DATABASE_*`) sont auto-générées par Railway.

---

## Configuration Frontend

### Variables Normales (Runtime)

Dans Railway Dashboard → Service **frontend** → **Variables** :

```
VITE_API_URL=https://api.olympiades.jordhanmadec.fr
```

### ⚠️ CRITIQUE : Build Arguments

Railway doit passer la variable pendant le **build Docker**.

**Option 1 : Via Service Settings (Interface)**

1. Railway Dashboard → Service **frontend**
2. **Settings** → **Build**
3. Chercher section **"Build Args"** ou **"Build Arguments"**
4. Cliquer **"Add Build Argument"**
5. Ajouter :
   ```
   Name: VITE_API_URL
   Value: https://api.olympiades.jordhanmadec.fr
   ```
6. **Save** et **Redeploy**

**Option 2 : Via Railway CLI**

```bash
cd frontend
railway run --service frontend -- \
  docker build \
  --build-arg VITE_API_URL=https://api.olympiades.jordhanmadec.fr \
  -t frontend .
```

**Option 3 : Variable Système Railway**

Si Railway a une option "Build-time environment variables" :

1. Settings → Build ou Environment
2. Activer **"Expose variables at build time"**
3. Railway passera automatiquement toutes les variables comme build args

---

## Vérification des Variables

### Backend

Logs Railway doivent afficher :
```
🚀 Backend running on http://0.0.0.0:8080
```

Test :
```bash
curl https://api.olympiades.jordhanmadec.fr/api
# Devrait retourner { "status": "ok", ... }
```

### Frontend

Ouvrir https://olympiades.jordhanmadec.fr

Console navigateur :
```javascript
// Vérifier l'API URL compilée
console.log(window.location.origin);
```

Tester une requête :
```javascript
// Ouvrir Console → Network
// Faire une action qui appelle l'API
// Vérifier que la requête va vers https://api.olympiades.jordhanmadec.fr
```

---

## 🐛 Dépannage

### Frontend appelle toujours localhost

**Cause** : `VITE_API_URL` n'a pas été passée pendant le build.

**Solution** :
1. Vérifier que la variable existe dans Railway (Section Variables)
2. **Crucial** : Ajouter comme Build Argument (voir Option 1 ci-dessus)
3. Redéployer le service frontend

**Vérification** :
```bash
# Dans les logs de build Railway, chercher :
# "ARG VITE_API_URL"
# Si absent, le build arg n'a pas été passé
```

### Backend ne se connecte pas à PostgreSQL

**Cause** : Variables de connexion incorrectes.

**Solution** :
1. Railway → Service PostgreSQL → **Connect** → Noter les variables
2. Vérifier que `DATABASE_TYPE=postgres`
3. Vérifier que le service backend est **lié** à PostgreSQL

**Vérification** :
```bash
# Logs backend doivent afficher :
# "TypeOrmCoreModule dependencies initialized"
# Si erreur de connexion, vérifier DATABASE_URL
```

### CORS errors

**Cause** : `FRONTEND_URL` incorrect dans backend.

**Solution** :
1. Vérifier `FRONTEND_URL=https://olympiades.jordhanmadec.fr`
2. **Pas de trailing slash** `/` à la fin
3. Redéployer le backend

---

## 📊 Récapitulatif Variables

| Service | Variable | Type | Valeur |
|---------|----------|------|--------|
| backend | NODE_ENV | Runtime | production |
| backend | DATABASE_TYPE | Runtime | postgres |
| backend | DATABASE_SSL | Runtime | true |
| backend | FRONTEND_URL | Runtime | https://olympiades.jordhanmadec.fr |
| frontend | VITE_API_URL | Runtime | https://api.olympiades.jordhanmadec.fr |
| frontend | VITE_API_URL | **Build Arg** ⚠️ | https://api.olympiades.jordhanmadec.fr |

**Note** : PostgreSQL génère automatiquement `DATABASE_URL`, `DATABASE_HOST`, etc.

---

## 🚀 Ordre de Configuration

1. ✅ Créer PostgreSQL
2. ✅ Déployer backend avec variables runtime
3. ✅ Déployer frontend avec variables runtime **ET build args**
4. ✅ Configurer domaines
5. ✅ Configurer DNS OVH
6. ✅ Tester les endpoints

---

## 💡 Astuce Railway

Si Railway ne permet pas de définir les build args via l'interface, vous pouvez :

1. Utiliser une variable d'environnement Railway système
2. Railway expose automatiquement certaines variables pendant le build
3. Ou utiliser un build script personnalisé

**Alternative** : Définir l'URL dans le code si elle ne change pas :

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     import.meta.env.PROD 
                     ? 'https://api.olympiades.jordhanmadec.fr/api'
                     : 'http://127.0.0.1:3001/api';
```

Mais c'est moins flexible !
