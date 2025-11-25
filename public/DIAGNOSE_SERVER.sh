#!/bin/bash
# Server-Diagnose bei Verbindungsproblemen

echo "🔍 Server-Diagnose"
echo "=================="
echo ""

# 1. Prüfe PM2-Status
echo "📊 PM2-Status:"
pm2 status
echo ""

# 2. Prüfe ob Node.js-Server läuft
echo "🌐 Node.js-Server prüfen:"
if pm2 list | grep -q "gutachtenruhr.*online"; then
    echo "✅ PM2 läuft"
    PORT_3000=$(netstat -tuln 2>/dev/null | grep ":3000 " || ss -tuln 2>/dev/null | grep ":3000 ")
    if [ -n "$PORT_3000" ]; then
        echo "✅ Port 3000 ist aktiv"
    else
        echo "❌ Port 3000 ist NICHT aktiv!"
    fi
else
    echo "❌ PM2 läuft NICHT!"
    echo "   Starte mit: pm2 start server.js --name gutachtenruhr"
fi
echo ""

# 3. Prüfe Nginx-Status
echo "🌐 Nginx-Status:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx läuft"
else
    echo "❌ Nginx läuft NICHT!"
    echo "   Starte mit: sudo systemctl start nginx"
fi
echo ""

# 4. Prüfe Port 80
echo "🔌 Port 80 prüfen:"
PORT_80=$(netstat -tuln 2>/dev/null | grep ":80 " || ss -tuln 2>/dev/null | grep ":80 ")
if [ -n "$PORT_80" ]; then
    echo "✅ Port 80 ist aktiv"
    echo "   $PORT_80"
else
    echo "❌ Port 80 ist NICHT aktiv!"
fi
echo ""

# 5. Prüfe Firewall
echo "🔥 Firewall-Status:"
sudo ufw status | head -5
echo ""

# 6. Teste lokalen Zugriff
echo "🧪 Teste lokalen Zugriff:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 5 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Node.js-Server antwortet (HTTP $HTTP_CODE)"
else
    echo "❌ Node.js-Server antwortet NICHT (HTTP $HTTP_CODE)"
fi

HTTP_CODE_NGINX=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --max-time 5 2>/dev/null || echo "000")
if [ "$HTTP_CODE_NGINX" = "200" ] || [ "$HTTP_CODE_NGINX" = "301" ] || [ "$HTTP_CODE_NGINX" = "302" ]; then
    echo "✅ Nginx antwortet (HTTP $HTTP_CODE_NGINX)"
else
    echo "❌ Nginx antwortet NICHT (HTTP $HTTP_CODE_NGINX)"
fi
echo ""

# 7. Prüfe Logs
echo "📋 Letzte PM2-Logs (Fehler):"
pm2 logs gutachtenruhr --lines 10 --nostream --err | tail -10
echo ""

# 8. Lösungsvorschläge
echo "💡 Lösungsvorschläge:"
echo "===================="
echo ""

if ! pm2 list | grep -q "gutachtenruhr.*online"; then
    echo "1. PM2 neu starten:"
    echo "   cd /var/www/gutachtenruhr/public"
    echo "   pm2 start server.js --name gutachtenruhr"
    echo ""
fi

if ! systemctl is-active --quiet nginx; then
    echo "2. Nginx starten:"
    echo "   sudo systemctl start nginx"
    echo ""
fi

echo "3. Beide neu starten:"
echo "   pm2 restart gutachtenruhr"
echo "   sudo systemctl restart nginx"
echo ""

echo "4. Prüfe Logs für Details:"
echo "   pm2 logs gutachtenruhr --lines 50"
echo "   sudo tail -50 /var/log/nginx/gutachtenruhr-error.log"
echo ""

