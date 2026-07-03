# 🔧 Fix Frontend API URL - Configuration Railway

## Problème Identifié

Le frontend appelle toujours `localhost` même si `VITE_API_URL` est défini dans Railway.

**Cause** : Les variables `VITE_*` sont injectées au **moment du build**, pas au runtime. Railway doit passer la variable pendant le build Docker.

## Solution

### Changements Effectués

**1. Modifié `frontend/Dockerfile`** ✅

Ajout d'un `ARG` pour accepter la variable d'environnement pendant le build :

```dockerfile
# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build
```

### Configuration Railway (IMPORTANT)

Sur Railway, il faut définir la variable **deux fois** :

#### Dans l'interface Railway Frontend Service :

1. **Variables** (section normale) :
   ```
   VITE_API_URL=https://api.olympiades.jordhanmadec.fr
   ```

2. **Dans Settings → Build → Build Arguments** (CRUCIAL !) :
   Cliquez sur **"Add Build Argument"**
   ```
   Name: VITE_API_URL
   Value: https://api.olympiades.jordhanmadec.fr
   ```

Ou si l'interface a changé, cherchez **"Build-time variables"** ou **"Build Args"**.

## Alternative : Configuration via railway.json

Si Railway ne permet pas de définir les build args via l'interface, on peut utiliser `railway.json` :

**Créer/Modifier `frontend/railway.json`** :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile",
    "buildArgs": {
      "VITE_API_URL": "https://api.olympiades.jordhanmadec.fr"
    }
  },
  "deploy": {
    "startCommand": "serve -s dist -l 3000",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Pourquoi Deux Variables ?

1. **Variable normale** (`VITE_API_URL`) :
   - Disponible au runtime dans le container
   - Pas utilisée par Vite (trop tard)
   - Utile pour les logs

2. **Build Argument** (`ARG VITE_API_URL`) :
   - Passée pendant `docker build`
   - Injectée dans le code JavaScript par Vite
   - C'est celle qui compte !

## Vérification

Après le redéploiement, vérifiez que l'API URL est correcte :

### Dans le navigateur (Console)

```javascript
// Ouvrez la console des développeurs sur votre site
console.log(import.meta.env.VITE_API_URL);
```

Si c'est encore `localhost`, le build arg n'a pas été passé.

### Inspecter le code compilé

```bash
# Téléchargez un fichier .js du frontend déployé
# Cherchez la valeur de l'API URL dans le code
curl https://olympiades.jordhanmadec.fr/assets/index-*.js | grep -o 'http[s]*://[^"]*api[^"]*'
```

Devrait afficher : `https://api.olympiades.jordhanmadec.fr`

## Test Local du Build

Pour tester que le Dockerfile fonctionne avec l'ARG :

```bash
cd frontend

# Build avec l'argument
docker build --build-arg VITE_API_URL=https://api.olympiades.jordhanmadec.fr -t frontend-test .

# Run
docker run -p 3000:3000 frontend-test

# Test
curl http://localhost:3000
# Ouvrir http://localhost:3000 dans le navigateur
# Vérifier que les appels API vont vers https://api.olympiades.jordhanmadec.fr
```

## Configuration Railway - Étape par Étape

### Option 1 : Via railway.json (Recommandé)

1. Le fichier `frontend/railway.json` sera créé avec `buildArgs`
2. Commiter et pusher
3. Railway utilisera automatiquement ces arguments

### Option 2 : Via Interface Railway

1. Aller sur Railway Dashboard
2. Sélectionner le service **frontend**
3. Onglet **Settings**
4. Section **Build** ou **Environment**
5. Chercher **"Build Arguments"** ou **"Build-time Variables"**
6. Ajouter :
   - Key: `VITE_API_URL`
   - Value: `https://api.olympiades.jordhanmadec.fr`
7. Redéployer manuellement

## Fichiers Modifiés

```
frontend/
├── Dockerfile              ← MODIFIÉ (ajout ARG + ENV)
└── railway.json            ← À CRÉER (avec buildArgs)
```

## Prochaines Étapes

1. ✅ Dockerfile modifié
2. ⏳ Créer `frontend/railway.json` avec buildArgs
3. ⏳ Commiter et pusher
4. ⏳ Railway redéploie automatiquement
5. ⏳ Vérifier que l'API URL est correcte

---

**Important** : Railway ne prend pas en compte les variables d'environnement normales pour les builds Vite. Il faut absolument utiliser des **build arguments** Docker.
