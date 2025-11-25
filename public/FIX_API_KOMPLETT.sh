#!/bin/bash
# Kompletter API-Fix

echo "=========================================="
echo "  Kompletter API-Endpoint Fix"
echo "=========================================="
echo ""

cd /var/www/gutachtenruhr/public

echo "1. Lade alle aktualisierten Dateien..."
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
curl -o script.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/script.js

echo ""
echo "2. Prüfe API-Routen in server.js..."
echo "   /api/appointment:"
grep -c "app.post('/api/appointment'" server.js && echo "   ✓ Gefunden" || echo "   ❌ Nicht gefunden"
echo "   /api/contact:"
grep -c "app.post('/api/contact'" server.js && echo "   ✓ Gefunden" || echo "   ❌ Nicht gefunden"

echo ""
echo "3. Prüfe API-URLs in script.js..."
echo "   appointment:"
grep "api/appointment" script.js | head -1
echo "   contact:"
grep "api/contact" script.js | head -1

echo ""
echo "4. PM2 komplett neu starten..."
pm2 delete gutachtenruhr
pm2 start server.js --name gutachtenruhr --update-env

echo ""
echo "5. Warte 3 Sekunden..."
sleep 3

echo ""
echo "6. Teste API-Endpoints direkt..."
echo "   Test /api/appointment:"
curl -X POST http://localhost:3000/api/appointment \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.de","phone":"01601234567","date":"2025-11-26","time":"10:00"}' \
  2>/dev/null | head -5

echo ""
echo "   Test /api/contact:"
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.de","phone":"01601234567","message":"Test"}' \
  2>/dev/null | head -5

echo ""
echo "7. Prüfe Nginx-Konfiguration..."
if [ -f /etc/nginx/sites-enabled/gutachtenruhr.de ]; then
    echo "   ✓ Nginx-Konfiguration aktiviert"
    echo "   Prüfe Proxy-Pass..."
    grep -A 5 "location /" /etc/nginx/sites-enabled/gutachtenruhr.de | head -10
else
    echo "   ⚠️ Nginx-Konfiguration nicht aktiviert"
    echo "   Aktiviere..."
    cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr.de
    ln -sf /etc/nginx/sites-available/gutachtenruhr.de /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
fi

echo ""
echo "8. PM2 Status:"
pm2 status

echo ""
echo "9. Letzte Logs:"
pm2 logs gutachtenruhr --lines 15 --nostream

echo ""
echo "=========================================="
echo "  Fix abgeschlossen!"
echo "=========================================="
echo ""
echo "WICHTIG: Browser-Cache leeren!"
echo "- Drücke Ctrl+Shift+R (Hard Reload)"
echo "- Oder: Strg+F5"
echo ""

