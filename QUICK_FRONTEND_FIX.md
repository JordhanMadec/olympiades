# 🎯 Fix Frontend API URL - SOLUTION RAPIDE

## Problème

Frontend appelle `localhost` au lieu de `https://api.olympiades.jordhanmadec.fr`

## Cause

Vite injecte les variables d'environnement **pendant le build**, pas au runtime. Railway doit passer `VITE_API_URL` comme **Docker build argument**.

---

## Solution Appliquée

### 1. ✅ Modifié `frontend/Dockerfile`

Ajout de :
```dockerfile
# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build
```

---

## Configuration Railway (À FAIRE)

### Sur Railway Dashboard :

**Service Frontend → Settings → Build**

Chercher **"Build Arguments"** ou **"Build-time Variables"**

Ajouter :
```
VITE_API_URL = https://api.olympiades.jordhanmadec.fr
```

**Important** : C'est un **Build Argument**, pas une variable d'environnement normale !

---

## Alternative : Hardcoder (Solution de Secours)

Si Railway ne permet pas les build args, modifier temporairement :

**`frontend/src/services/api.ts`** :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://api.olympiades.jordhanmadec.fr/api'
    : 'http://127.0.0.1:3001/api');
```

Cette solution utilise `import.meta.env.PROD` (toujours disponible dans Vite) pour détecter la production.

---

## Prochaines Étapes

### Option 1 : Build Argument Railway (Recommandé)

1. ✅ Dockerfile modifié
2. ⏳ Configurer build arg sur Railway
3. ⏳ Redéployer
4. ⏳ Tester

### Option 2 : Hardcoder (Rapide)

1. ✅ Dockerfile modifié
2. ⏳ Modifier `api.ts` avec le code ci-dessus
3. ⏳ Commit et push
4. ⏳ Railway redéploie automatiquement
5. ⏳ Tester

---

## Test

Après redéploiement :

1. Ouvrir https://olympiades.jordhanmadec.fr
2. Console navigateur (F12)
3. Onglet **Network**
4. Faire une action (charger équipes, etc.)
5. Vérifier que les requêtes vont vers `https://api.olympiades.jordhanmadec.fr`

---

## Statut

- ✅ Dockerfile modifié (ARG VITE_API_URL)
- ⏳ Configuration Railway à faire
- ⏳ Ou utiliser solution de secours (hardcoder)

---

Recommandation : **Commencer par la solution de secours** (hardcoder) pour avoir un site fonctionnel rapidement, puis migrer vers build args quand vous aurez le temps.
