#!/bin/bash
# Fix API-Endpoint Problem

echo "=========================================="
echo "  API-Endpoint Fix"
echo "=========================================="
echo ""

cd /var/www/gutachtenruhr/public

echo "1. Lade aktualisierte script.js..."
curl -o script.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/script.js

echo ""
echo "2. Prüfe ob API-Route in server.js vorhanden ist..."
if grep -q "app.post('/api/appointment'" server.js; then
    echo "   ✓ /api/appointment Route gefunden"
else
    echo "   ❌ /api/appointment Route NICHT gefunden!"
    echo "   Lade server.js neu..."
    curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
fi

echo ""
echo "3. Prüfe script.js für API-URL..."
if grep -q "/api/appointment" script.js && ! grep -q "appointment.php" script.js; then
    echo "   ✓ script.js verwendet korrekte API-URL"
else
    echo "   ⚠️ script.js verwendet noch .php Endpoint"
fi

echo ""
echo "4. PM2 neu starten..."
pm2 restart gutachtenruhr

echo ""
echo "5. Teste API-Endpoint..."
sleep 2
curl -X POST http://localhost:3000/api/appointment \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.de","phone":"01601234567","date":"2025-11-26","time":"10:00"}' \
  2>/dev/null | head -10

echo ""
echo "6. Prüfe Logs..."
pm2 logs gutachtenruhr --lines 10 --nostream

echo ""
echo "=========================================="
echo "  Fix abgeschlossen!"
echo "=========================================="
echo ""

