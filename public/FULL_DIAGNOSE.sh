#!/bin/bash
# Vollständige Diagnose und Reparatur

echo "🔍 VOLLSTÄNDIGE DIAGNOSE"
echo "========================"
echo ""

DOMAIN="gutachtenruhr.de"
WWW_DOMAIN="www.gutachtenruhr.de"
SERVER_IP="82.165.219.105"

# 1. Prüfe PM2
echo "1️⃣ PM2 Status:"
pm2 status
echo ""

# 2. Prüfe Nginx
echo "2️⃣ Nginx Status:"
sudo systemctl status nginx --no-pager | head -10
echo ""

# 3. Teste lokale Erreichbarkeit
echo "3️⃣ Lokale Erreichbarkeit:"
echo "   Node.js (Port 3000):"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost:3000 --max-time 5 || echo "   ❌ Nicht erreichbar"
echo ""
echo "   Nginx (Port 80):"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost --max-time 5 || echo "   ❌ Nicht erreichbar"
echo ""

# 4. Teste externe Erreichbarkeit über IP
echo "4️⃣ Externe Erreichbarkeit über IP ($SERVER_IP):"
echo "   HTTP:"
HTTP_IP=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP --max-time 10 2>/dev/null || echo "000")
echo "   HTTP Status: $HTTP_IP"
if [ "$HTTP_IP" != "200" ] && [ "$HTTP_IP" != "301" ] && [ "$HTTP_IP" != "302" ]; then
    echo "   ❌ Server ist NICHT über IP erreichbar!"
fi
echo ""

# 5. Teste externe Erreichbarkeit über Domain
echo "5️⃣ Externe Erreichbarkeit über Domain:"
echo "   $DOMAIN:"
HTTP_DOMAIN=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --max-time 10 2>/dev/null || echo "000")
echo "   HTTP Status: $HTTP_DOMAIN"
if [ "$HTTP_DOMAIN" != "200" ] && [ "$HTTP_DOMAIN" != "301" ] && [ "$HTTP_DOMAIN" != "302" ]; then
    echo "   ❌ Domain ist NICHT erreichbar!"
    echo "   Versuche mit -L (Follow Redirects):"
    curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" -L http://$DOMAIN --max-time 10 2>/dev/null || echo "   ❌ Auch mit Redirect nicht erreichbar"
fi
echo ""
echo "   $WWW_DOMAIN:"
HTTP_WWW=$(curl -s -o /dev/null -w "%{http_code}" http://$WWW_DOMAIN --max-time 10 2>/dev/null || echo "000")
echo "   HTTP Status: $HTTP_WWW"
if [ "$HTTP_WWW" != "200" ] && [ "$HTTP_WWW" != "301" ] && [ "$HTTP_WWW" != "302" ]; then
    echo "   ❌ www-Domain ist NICHT erreichbar!"
    echo "   Versuche mit -L (Follow Redirects):"
    curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" -L http://$WWW_DOMAIN --max-time 10 2>/dev/null || echo "   ❌ Auch mit Redirect nicht erreichbar"
fi
echo ""

# 6. Prüfe DNS
echo "6️⃣ DNS-Status:"
CURRENT_IP=$(curl -4 -s ifconfig.me 2>/dev/null || curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)
WWW_DOMAIN_IP=$(dig +short $WWW_DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)

echo "   Server-IP: $CURRENT_IP"
echo "   $DOMAIN zeigt auf: $DOMAIN_IP"
echo "   $WWW_DOMAIN zeigt auf: $WWW_DOMAIN_IP"
echo ""

if [ "$DOMAIN_IP" != "$CURRENT_IP" ] && [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "   ❌ DNS für $DOMAIN ist FALSCH!"
    echo "      Muss auf $CURRENT_IP zeigen, zeigt aber auf $DOMAIN_IP"
fi

if [ "$WWW_DOMAIN_IP" != "$CURRENT_IP" ] && [ "$WWW_DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "   ❌ DNS für $WWW_DOMAIN ist FALSCH!"
    echo "      Muss auf $CURRENT_IP zeigen, zeigt aber auf $WWW_DOMAIN_IP"
fi
echo ""

# 7. Prüfe Nginx-Konfiguration
echo "7️⃣ Nginx-Konfiguration:"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Nginx-Konfiguration ist gültig"
else
    echo "   ❌ Nginx-Konfiguration hat Fehler:"
    sudo nginx -t
fi
echo ""

# 8. Prüfe ob Nginx auf Port 80/443 lauscht
echo "8️⃣ Port-Status:"
if command -v netstat &> /dev/null; then
    PORT_80=$(sudo netstat -tuln 2>/dev/null | grep ":80 " || echo "")
    PORT_443=$(sudo netstat -tuln 2>/dev/null | grep ":443 " || echo "")
else
    PORT_80=$(sudo ss -tuln 2>/dev/null | grep ":80 " || echo "")
    PORT_443=$(sudo ss -tuln 2>/dev/null | grep ":443 " || echo "")
fi

[ -n "$PORT_80" ] && echo "   ✅ Port 80 ist aktiv" || echo "   ❌ Port 80 ist NICHT aktiv"
[ -n "$PORT_443" ] && echo "   ✅ Port 443 ist aktiv" || echo "   ⚠️  Port 443 ist NICHT aktiv (HTTPS)"
echo ""

# 9. Prüfe Firewall
echo "9️⃣ Firewall-Status:"
sudo ufw status | head -10
echo ""

# 10. Prüfe Nginx-Logs
echo "🔟 Nginx Error-Logs (letzte 20 Zeilen):"
sudo tail -20 /var/log/nginx/gutachtenruhr-error.log 2>/dev/null || echo "   Keine Error-Logs gefunden"
echo ""

# 11. Prüfe Nginx Access-Logs
echo "1️⃣1️⃣ Nginx Access-Logs (letzte 10 Zeilen):"
sudo tail -10 /var/log/nginx/gutachtenruhr-access.log 2>/dev/null || echo "   Keine Access-Logs gefunden"
echo ""

# 12. Prüfe PM2-Logs
echo "1️⃣2️⃣ PM2-Logs (letzte 10 Zeilen):"
pm2 logs gutachtenruhr --lines 10 --nostream 2>/dev/null | tail -10 || echo "   Keine PM2-Logs gefunden"
echo ""

# 13. Teste Nginx-Konfiguration direkt
echo "1️⃣3️⃣ Nginx-Konfiguration Details:"
echo "   Server-Blocks:"
sudo nginx -T 2>/dev/null | grep -A 5 "server_name" | head -20
echo ""

# 14. Prüfe ob Nginx auf die richtige Domain lauscht
echo "1️⃣4️⃣ Nginx Server-Name Konfiguration:"
if sudo nginx -T 2>/dev/null | grep -q "server_name.*gutachtenruhr"; then
    echo "   ✅ Nginx lauscht auf gutachtenruhr.de"
else
    echo "   ❌ Nginx lauscht NICHT auf gutachtenruhr.de!"
    echo "   Aktuelle Konfiguration:"
    sudo nginx -T 2>/dev/null | grep "server_name" | head -5
fi
echo ""

# Zusammenfassung
echo "📊 ZUSAMMENFASSUNG:"
echo "==================="
echo ""

PROBLEMS=0

if ! pm2 list | grep -q "gutachtenruhr.*online"; then
    echo "❌ PM2 läuft NICHT"
    PROBLEMS=$((PROBLEMS+1))
fi

if ! systemctl is-active --quiet nginx; then
    echo "❌ Nginx läuft NICHT"
    PROBLEMS=$((PROBLEMS+1))
fi

if [ "$HTTP_IP" != "200" ] && [ "$HTTP_IP" != "301" ] && [ "$HTTP_IP" != "302" ]; then
    echo "❌ Server ist NICHT über IP erreichbar"
    PROBLEMS=$((PROBLEMS+1))
fi

if [ "$HTTP_DOMAIN" != "200" ] && [ "$HTTP_DOMAIN" != "301" ] && [ "$HTTP_DOMAIN" != "302" ]; then
    echo "❌ Domain ist NICHT erreichbar"
    PROBLEMS=$((PROBLEMS+1))
fi

if [ "$DOMAIN_IP" != "$CURRENT_IP" ] && [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "❌ DNS zeigt auf falsche IP"
    PROBLEMS=$((PROBLEMS+1))
fi

if [ $PROBLEMS -eq 0 ]; then
    echo "✅ Alle Checks bestanden!"
    echo ""
    echo "💡 Falls die Seite trotzdem nicht erreichbar ist:"
    echo "   1. Prüfe Browser-Cache (Strg+Shift+R)"
    echo "   2. Prüfe von anderem Netzwerk/Device"
    echo "   3. Warte 5-10 Minuten auf DNS-Propagierung"
    echo "   4. Prüfe Strato VPS-Einstellungen (Firewall/Ports)"
else
    echo "❌ $PROBLEMS Problem(e) gefunden!"
    echo ""
    echo "💡 Nächste Schritte:"
    echo "   1. Führe COMPLETE_FIX.sh aus"
    echo "   2. Prüfe DNS-Einstellungen bei Strato"
    echo "   3. Prüfe Strato VPS-Firewall-Einstellungen"
fi
echo ""

