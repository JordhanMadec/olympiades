#!/bin/bash

echo "🔄 Starting SQLite to PostgreSQL migration..."

# Step 1: Export SQLite data
echo "📤 Step 1: Exporting SQLite data..."
cd backend
node scripts/export-sqlite.js

if [ ! -f data-export.json ]; then
  echo "❌ Export failed - data-export.json not found"
  exit 1
fi

echo "✓ Data exported successfully"
echo ""
echo "📝 Next steps:"
echo "1. Create a PostgreSQL database on Railway"
echo "2. Note the connection details (DATABASE_URL)"
echo "3. Run the import script with: node scripts/import-postgres.js"
echo ""
echo "⚠️  Make sure to set these environment variables before importing:"
echo "   - DATABASE_HOST"
echo "   - DATABASE_PORT"
echo "   - DATABASE_USER"
echo "   - DATABASE_PASSWORD"
echo "   - DATABASE_NAME"
