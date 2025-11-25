#!/bin/bash
# Server-Reparatur-Script

echo "🔧 Server-Reparatur"
echo "==================="
echo ""

# 1. Prüfe PM2
echo "1️⃣ Prüfe PM2..."
if pm2 list | grep -q "gutachtenruhr.*online"; then
    echo "✅ PM2 läuft"
else
    echo "❌ PM2 läuft NICHT - starte neu..."
    cd /var/www/gutachtenruhr/public
    pm2 stop gutachtenruhr 2>/dev/null
    pm2 delete gutachtenruhr 2>/dev/null
    pm2 start server.js --name gutachtenruhr
    pm2 save
    sleep 2
fi
echo ""

# 2. Prüfe Nginx
echo "2️⃣ Prüfe Nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx läuft"
else
    echo "❌ Nginx läuft NICHT - starte neu..."
    sudo systemctl start nginx
    sleep 2
fi
echo ""

# 3. Prüfe Port 3000
echo "3️⃣ Prüfe Port 3000..."
PORT_3000=$(netstat -tuln 2>/dev/null | grep ":3000 " || ss -tuln 2>/dev/null | grep ":3000 ")
if [ -n "$PORT_3000" ]; then
    echo "✅ Port 3000 ist aktiv"
else
    echo "❌ Port 3000 ist NICHT aktiv - starte PM2 neu..."
    pm2 restart gutachtenruhr
    sleep 3
fi
echo ""

# 4. Prüfe Port 80
echo "4️⃣ Prüfe Port 80..."
PORT_80=$(netstat -tuln 2>/dev/null | grep ":80 " || ss -tuln 2>/dev/null | grep ":80 ")
if [ -n "$PORT_80" ]; then
    echo "✅ Port 80 ist aktiv"
else
    echo "❌ Port 80 ist NICHT aktiv - starte Nginx neu..."
    sudo systemctl restart nginx
    sleep 2
fi
echo ""

# 5. Prüfe Firewall
echo "5️⃣ Prüfe Firewall..."
if sudo ufw status | grep -q "80/tcp.*ALLOW"; then
    echo "✅ Port 80 ist in Firewall erlaubt"
else
    echo "⚠️  Port 80 könnte blockiert sein - öffne jetzt..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
fi
echo ""

# 6. Teste lokalen Zugriff
echo "6️⃣ Teste lokalen Zugriff..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 5 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Node.js-Server antwortet (HTTP $HTTP_CODE)"
else
    echo "❌ Node.js-Server antwortet NICHT (HTTP $HTTP_CODE)"
    echo "   Prüfe Logs: pm2 logs gutachtenruhr --lines 20"
fi

HTTP_CODE_NGINX=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --max-time 5 2>/dev/null || echo "000")
if [ "$HTTP_CODE_NGINX" = "200" ] || [ "$HTTP_CODE_NGINX" = "301" ] || [ "$HTTP_CODE_NGINX" = "302" ]; then
    echo "✅ Nginx antwortet (HTTP $HTTP_CODE_NGINX)"
else
    echo "❌ Nginx antwortet NICHT (HTTP $HTTP_CODE_NGINX)"
    echo "   Prüfe Nginx-Logs: sudo tail -20 /var/log/nginx/gutachtenruhr-error.log"
fi
echo ""

# 7. Prüfe Nginx-Konfiguration
echo "7️⃣ Prüfe Nginx-Konfiguration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx-Konfiguration ist gültig"
    sudo systemctl reload nginx
else
    echo "❌ Nginx-Konfiguration hat Fehler!"
    sudo nginx -t
    echo "   Bitte behebe die Fehler in /etc/nginx/sites-available/gutachtenruhr"
fi
echo ""

# 8. Zeige Status
echo "📊 Finaler Status:"
echo "=================="
pm2 status
echo ""
sudo systemctl status nginx --no-pager | head -5
echo ""

# 9. Zeige Logs
echo "📋 Letzte Fehler-Logs:"
echo "PM2 (letzte 10 Zeilen):"
pm2 logs gutachtenruhr --lines 10 --nostream --err 2>/dev/null | tail -10 || echo "Keine PM2-Logs"
echo ""
echo "Nginx (letzte 10 Zeilen):"
sudo tail -10 /var/log/nginx/gutachtenruhr-error.log 2>/dev/null || echo "Keine Nginx-Logs"
echo ""

echo "✅ Reparatur abgeschlossen!"
echo ""
echo "💡 Falls die Seite immer noch nicht erreichbar ist:"
echo "   1. Prüfe DNS: dig +short gutachtenruhr.de A"
echo "   2. Prüfe externe Erreichbarkeit: curl -I http://$(curl -s ifconfig.me)"
echo "   3. Prüfe Firewall: sudo ufw status verbose"
echo ""

