# Railway Deployment - Quick Reference

## 🚀 Quick Start Commands

### Initial Setup
```bash
# 1. Login to Railway
railway login

# 2. Initialize project
railway init

# 3. Link to PostgreSQL (create in Railway dashboard first)
# PostgreSQL is auto-linked when created in the same project
```

### Deploy Backend
```bash
# From project root - use --path-as-root flag
railway up backend --path-as-root --service backend

# Set environment variables
railway variables set NODE_ENV=production --service backend
railway variables set DATABASE_TYPE=postgres --service backend
railway variables set DATABASE_SSL=true --service backend
railway variables set FRONTEND_URL=https://olympiades.jordhanmadec.fr --service backend
```

### Deploy Frontend
```bash
# From project root - use --path-as-root flag
railway up frontend --path-as-root --service frontend

# Set environment variable
railway variables set VITE_API_URL=https://api.olympiades.jordhanmadec.fr --service frontend
```

### Migration des Données
```bash
# Export SQLite
cd backend
node scripts/export-sqlite.js
```

## 🌐 DNS Configuration (OVH)

Ajoutez ces enregistrements CNAME dans la zone DNS de `jordhanmadec.fr` :

```
olympiades     CNAME    [railway-frontend-url]
api.olympiades CNAME    [railway-backend-url]
```

## 📋 Configuration des Domaines Railway

1. Backend : `api.olympiades.jordhanmadec.fr`
2. Frontend : `olympiades.jordhanmadec.fr`

## 🔍 Vérification

```bash
# Backend
curl https://api.olympiades.jordhanmadec.fr/api

# Frontend  
curl https://olympiades.jordhanmadec.fr

# Logs
railway logs
```

Pour le guide complet, voir [DEPLOYMENT.md](./DEPLOYMENT.md)
