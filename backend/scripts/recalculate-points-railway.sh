#!/bin/bash
# Script pour recalculer les points sur Railway (production)

echo "🚂 Recalcul des Points - Railway Production"
echo "=============================================="
echo ""

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "   Installez-le avec: npm install -g @railway/cli"
    echo "   Puis: railway login"
    exit 1
fi

echo "📍 Environnement: Production Railway (PostgreSQL)"
echo ""
echo "⚠️  ATTENTION: Vous êtes sur le point de modifier la base de production!"
echo "   Assurez-vous d'avoir un backup avant de continuer."
echo ""
echo "ℹ️  Étapes :"
echo "   1. Connexion à Railway"
echo "   2. Sauvegarde recommandée (backup PostgreSQL)"
echo "   3. Exécution du script de recalcul"
echo "   4. Vérification des classements"
echo ""

# Demander confirmation
read -p "➡️  Voulez-vous continuer ? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé par l'utilisateur"
    exit 0
fi

echo ""
echo "🔗 Connexion au projet Railway..."
railway link

echo ""
echo "🚀 Exécution du script sur Railway..."
echo ""

# Exécuter le script sur Railway
railway run npm run recalculate:points

# Vérifier le code de sortie
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Recalcul terminé avec succès!"
    echo ""
    echo "💡 Prochaines étapes :"
    echo "   1. Vérifiez le classement général sur votre site"
    echo "   2. Vérifiez les classements par épreuve"
    echo "   3. Testez que l'application fonctionne correctement"
else
    echo ""
    echo "❌ Erreur lors du recalcul"
    exit 1
fi
