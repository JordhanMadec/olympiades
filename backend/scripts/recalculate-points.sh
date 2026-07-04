#!/bin/bash
# Script pour recalculer les points de tous les matchs

echo "🔄 Script de Recalcul des Points - Olympiades"
echo "=============================================="
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier backend/"
    exit 1
fi

# Afficher l'environnement
if [ -n "$DATABASE_HOST" ] && [ "$DATABASE_TYPE" = "postgres" ]; then
    echo "📍 Environnement: Production (PostgreSQL)"
    echo "🌐 Base de données: $DATABASE_HOST"
    echo ""
    echo "⚠️  ATTENTION: Vous êtes sur le point de modifier la base de production!"
    echo "   Assurez-vous d'avoir un backup avant de continuer."
else
    echo "📍 Environnement: Local (SQLite)"
    echo "🗄️  Base de données: olympiades.sqlite"
    if [ -f "olympiades.sqlite" ]; then
        echo "✅ Fichier trouvé"
    else
        echo "❌ Fichier olympiades.sqlite introuvable!"
        exit 1
    fi
fi

echo ""
echo "⚠️  Ce script va recalculer les points de TOUS les matchs complétés."
echo "   Les points seront mis à jour selon la nouvelle logique:"
echo "   - Round Robin → Système olympique (10, 8, 6, 5, 4, 3, 2, 1)"
echo "   - Elimination → Dépend du type de jeu"
echo ""

# Demander confirmation
read -p "➡️  Voulez-vous continuer ? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé par l'utilisateur"
    exit 0
fi

echo ""
echo "🚀 Démarrage du recalcul..."
echo ""

# Exécuter le script TypeScript
npx ts-node -r tsconfig-paths/register scripts/recalculate-points.ts

# Vérifier le code de sortie
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Recalcul terminé avec succès!"
else
    echo ""
    echo "❌ Erreur lors du recalcul"
    exit 1
fi
