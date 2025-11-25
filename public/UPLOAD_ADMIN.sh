#!/bin/bash

echo "📤 Lade Admin-Dashboard auf Server hoch..."
cd /var/www/gutachtenruhr/public

# Erstelle admin-Verzeichnis falls nicht vorhanden
mkdir -p admin

# Lade Admin-Dateien von GitHub
echo "📥 Lade admin/index.html..."
curl -o admin/index.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/admin/index.html

echo "📥 Lade admin/admin.css..."
curl -o admin/admin.css https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/admin/admin.css

echo "📥 Lade admin/admin.js..."
curl -o admin/admin.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/admin/admin.js

# Prüfe ob Dateien existieren
echo ""
echo "✅ Prüfe Dateien:"
ls -lh admin/

# PM2 neu starten
echo ""
echo "🔄 Starte PM2 neu..."
pm2 restart gutachtenruhr

sleep 2

echo ""
echo "✅ Admin-Dashboard hochgeladen!"
echo ""
echo "🧪 Teste:"
echo "   - Admin: http://82.165.219.105/admin"
echo "   - Test Tracking: http://82.165.219.105/api/test-tracking"

