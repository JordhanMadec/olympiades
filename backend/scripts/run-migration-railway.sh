#!/bin/bash
# Script pour exécuter la migration sur Railway
# Usage: ./run-migration-railway.sh

echo "🚀 Exécution de la migration sur Railway..."
echo ""

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "   Installez-le avec: npm install -g @railway/cli"
    exit 1
fi

echo "📦 Projet Railway détecté"
echo ""

# Se connecter au projet
echo "🔗 Connexion au projet..."
railway link

echo ""
echo "⚙️  Exécution de la migration..."
railway run npm run migration:run

echo ""
echo "✅ Migration terminée !"
echo ""
echo "Pour vérifier, vous pouvez :"
echo "  1. Aller sur Railway Dashboard → PostgreSQL → Data"
echo "  2. Exécuter: SELECT column_name FROM information_schema.columns WHERE table_name = 'games';"
echo "  3. Vérifier que 'rules' n'apparaît pas"
