#!/bin/bash
# Server komplett neu starten und prüfen

echo "=========================================="
echo "  Server komplett neu starten"
echo "=========================================="
echo ""

cd /var/www/gutachtenruhr/public

echo "1. Stoppe PM2..."
pm2 stop gutachtenruhr
pm2 delete gutachtenruhr

echo ""
echo "2. Lade aktualisierte Dateien..."
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
curl -o index.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/index.html
curl -o template.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/template.html

echo ""
echo "3. Prüfe ob API-Route vorhanden ist..."
grep -n "/api/appointment" server.js || echo "⚠️ /api/appointment Route nicht gefunden!"

echo ""
echo "4. Starte Server neu..."
pm2 start server.js --name gutachtenruhr --update-env

echo ""
echo "5. PM2 Status:"
pm2 status

echo ""
echo "6. Prüfe Logs (letzte 30 Zeilen):"
pm2 logs gutachtenruhr --lines 30 --nostream

echo ""
echo "7. Teste API-Endpoint..."
curl -X POST http://localhost:3000/api/appointment \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.de","phone":"01601234567","date":"2025-11-26","time":"10:00"}' \
  2>/dev/null | head -5 || echo "⚠️ API-Endpoint nicht erreichbar!"

echo ""
echo "=========================================="
echo "  Neustart abgeschlossen!"
echo "=========================================="
echo ""

