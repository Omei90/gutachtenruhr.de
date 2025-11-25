#!/bin/bash
# Script zum Aktualisieren des Servers mit Terminbuchung-API

echo "=== Server Update - Terminbuchung-API ==="
echo ""

cd /var/www/gutachtenruhr/public

echo "1. Lade neueste Dateien von GitHub..."
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
curl -o package.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/package.json

echo "2. Installiere Dependencies..."
npm install

echo "3. PM2 neu starten..."
pm2 restart gutachtenruhr

echo "4. Prüfe Logs..."
pm2 logs gutachtenruhr --lines 10

echo ""
echo "=== Fertig ==="

