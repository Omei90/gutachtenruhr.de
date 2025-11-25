#!/bin/bash

# Script zum Aktualisieren der Dateien direkt von GitHub
# Auf dem Server ausführen: bash UPDATE_FROM_GITHUB.sh

echo "🔄 Lade aktualisierte Dateien von GitHub..."

cd /var/www/gutachtenruhr/public

# Lade alle wichtigen Dateien
echo "📥 Lade server.js..."
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js

echo "📥 Lade template.html..."
curl -o template.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/template.html

echo "📥 Lade index.html..."
curl -o index.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/index.html

echo "📥 Lade cities.json..."
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json

echo "✅ Dateien aktualisiert!"

echo "🔄 Starte PM2 neu..."
pm2 restart gutachtenruhr

echo "✅ Fertig! Prüfe Logs mit: pm2 logs gutachtenruhr --lines 20"

