#!/bin/bash

echo "🔄 Aktualisiere Server-Dateien..."
cd /var/www/gutachtenruhr/public

# Git Pull
echo "📥 Lade neueste Änderungen von GitHub..."
git pull

# Prüfe ob server.js aktualisiert wurde
if [ -f "server.js" ]; then
    echo "✅ server.js gefunden"
    
    # Prüfe ob test-tracking Endpoint vorhanden ist
    if grep -q "test-tracking" server.js; then
        echo "✅ /api/test-tracking Endpoint gefunden"
    else
        echo "❌ /api/test-tracking Endpoint NICHT gefunden!"
        echo "⚠️  Lade server.js direkt von GitHub..."
        curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
    fi
else
    echo "❌ server.js nicht gefunden!"
    exit 1
fi

# Prüfe ob script.js aktualisiert wurde
if [ -f "script.js" ]; then
    echo "✅ script.js gefunden"
else
    echo "❌ script.js nicht gefunden!"
    exit 1
fi

# PM2 neu starten
echo "🔄 Starte PM2 neu..."
pm2 restart gutachtenruhr

# Warte kurz
sleep 2

# Prüfe Status
echo "📊 PM2 Status:"
pm2 status

# Prüfe Logs
echo ""
echo "📋 Letzte Logs:"
pm2 logs gutachtenruhr --lines 10 --nostream

echo ""
echo "✅ Update abgeschlossen!"
echo ""
echo "🧪 Teste Endpoints:"
echo "   - Health: http://82.165.219.105/health"
echo "   - Test Tracking: http://82.165.219.105/api/test-tracking"
echo "   - Admin: http://82.165.219.105/admin"

