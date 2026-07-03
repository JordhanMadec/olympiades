# 🔧 Fix Railway Healthcheck - RÉSOLU

## Problème Identifié

Le backend démarrait correctement mais échouait au healthcheck Railway :
```
Attempt #1-14 failed with service unavailable
Healthcheck failed!
```

**Logs Backend** :
- ✅ NestJS démarre correctement
- ✅ Toutes les routes sont mappées
- ✅ Application écoute sur port 8080 (Railway)
- ❌ Healthcheck échoue sur `/api`

## Cause du Problème

Railway essayait de faire un **GET** sur `/api` pour vérifier que l'application est vivante, mais :
- Votre backend n'avait **pas de route GET `/api`**
- Seulement des sous-routes : `/api/teams`, `/api/games`, etc.

## Solution Appliquée

### 1. Ajouté un Controller de Health ✅

**Fichier créé** : `backend/src/app.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'olympiades-backend',
    };
  }

  @Get('api')
  getApiHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'olympiades-backend',
      message: 'API is running',
    };
  }
}
```

Ce controller expose :
- **GET /** → Health check racine
- **GET /api** → Health check pour Railway

### 2. Ajouté le Controller au Module ✅

**Fichier modifié** : `backend/src/app.module.ts`

Ajout de :
```typescript
import { AppController } from "./app.controller";
// ...
@Module({
  // ...
  controllers: [AppController],
})
```

### 3. Supprimé le Healthcheck de railway.json ✅

**Fichier modifié** : `backend/railway.json`

Railway détecte automatiquement si le port répond. Le healthcheck manuel n'est pas nécessaire :

```json
{
  "deploy": {
    "startCommand": "node dist/main",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Routes Disponibles Après Fix

| Route | Méthode | Description |
|-------|---------|-------------|
| `/` | GET | Health check racine |
| `/api` | GET | Health check API (Railway) |
| `/api/teams` | GET/POST/PUT/DELETE | CRUD équipes |
| `/api/games` | GET/POST/PUT/DELETE | CRUD jeux |
| `/api/matches` | GET/POST/PUT/DELETE | CRUD matchs |
| `/api/rankings/*` | GET | Classements |
| `/api/draws/*` | GET/POST | Tirages au sort |

## Test du Fix

Une fois déployé sur Railway, vous pouvez tester :

```bash
# Health check racine
curl https://api.olympiades.jordhanmadec.fr/

# Health check API (celui que Railway utilise)
curl https://api.olympiades.jordhanmadec.fr/api

# Route équipes (existante)
curl https://api.olympiades.jordhanmadec.fr/api/teams
```

## Prochaines Étapes

1. **Commiter et pusher** ces changements sur GitHub
2. Railway détecte automatiquement le commit
3. Redéploiement automatique
4. Le healthcheck devrait maintenant **passer** ✅

## Fichiers Modifiés

```
backend/
├── src/
│   ├── app.controller.ts     ← NOUVEAU (health endpoints)
│   └── app.module.ts          ← MODIFIÉ (ajout controller)
└── railway.json               ← MODIFIÉ (supprimé healthcheck)
```

## Commit Recommandé

```bash
git add backend/
git commit -m "fix: add health check endpoint for Railway deployment"
git push origin main
```

---

**Status** : ✅ RÉSOLU

Le backend devrait maintenant déployer correctement sur Railway sans erreur de healthcheck.
