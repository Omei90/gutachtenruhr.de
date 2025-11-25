#!/bin/bash

# FORCE UPDATE - Leert ALLE Caches und lädt Dateien neu

echo "🗑️ Lösche alle Caches..."

cd /var/www/gutachtenruhr/public

# Stoppe PM2 komplett
echo "🛑 Stoppe PM2..."
pm2 stop gutachtenruhr
pm2 delete gutachtenruhr

# Lösche Node-Cache
echo "🗑️ Lösche Node-Cache..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .cache 2>/dev/null

# Lade Dateien NEU von GitHub
echo "📥 Lade Dateien von GitHub..."
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
curl -o template.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/template.html
curl -o index.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/index.html
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json

# Prüfe ob Text noch drin ist
echo "🔍 Prüfe template.html..."
if grep -q "60.*90.*Minuten" template.html 2>/dev/null; then
    echo "❌ Text noch in template.html gefunden!"
else
    echo "✅ Text NICHT in template.html gefunden"
fi

# Starte PM2 neu
echo "🚀 Starte PM2 neu..."
pm2 start server.js --name gutachtenruhr
pm2 save

echo "✅ Fertig! Prüfe jetzt die Seite mit Hard Refresh (Strg+F5)"

