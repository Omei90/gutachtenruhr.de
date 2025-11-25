#!/bin/bash
# Komplette Server-Reparatur und Diagnose

echo "🔧 KOMPLETTE SERVER-REPARATUR"
echo "=============================="
echo ""

# Konfiguration
SERVER_IP="82.165.219.105"
DOMAIN="gutachtenruhr.de"
WWW_DOMAIN="www.gutachtenruhr.de"

# 1. Prüfe und repariere PM2
echo "1️⃣ PM2-Status prüfen und reparieren..."
cd /var/www/gutachtenruhr/public

# Stoppe alle alten Prozesse
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null

# Prüfe ob server.js existiert
if [ ! -f "server.js" ]; then
    echo "❌ server.js nicht gefunden! Lade von GitHub..."
    git pull origin main || curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
fi

# Starte PM2 neu
pm2 start server.js --name gutachtenruhr
pm2 save
sleep 3

# Prüfe ob PM2 läuft
if pm2 list | grep -q "gutachtenruhr.*online"; then
    echo "✅ PM2 läuft jetzt"
else
    echo "❌ PM2 startet nicht! Prüfe Logs:"
    pm2 logs gutachtenruhr --lines 20 --nostream
    exit 1
fi
echo ""

# 2. Prüfe und repariere Nginx
echo "2️⃣ Nginx-Status prüfen und reparieren..."

# Stoppe Nginx
sudo systemctl stop nginx 2>/dev/null

# Prüfe Nginx-Konfiguration
if [ -f "/etc/nginx/sites-available/gutachtenruhr" ]; then
    echo "✅ Nginx-Konfiguration gefunden"
    sudo nginx -t
    if [ $? -ne 0 ]; then
        echo "❌ Nginx-Konfiguration hat Fehler! Lade von GitHub..."
        curl -o nginx-gutachtenruhr.conf https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/nginx-gutachtenruhr.conf
        sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr
        sudo nginx -t
    fi
else
    echo "❌ Nginx-Konfiguration fehlt! Lade von GitHub..."
    curl -o nginx-gutachtenruhr.conf https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/nginx-gutachtenruhr.conf
    sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr
    sudo ln -sf /etc/nginx/sites-available/gutachtenruhr /etc/nginx/sites-enabled/
    sudo nginx -t
fi

# Starte Nginx
sudo systemctl start nginx
sleep 2

# Prüfe ob Nginx läuft
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx läuft jetzt"
else
    echo "❌ Nginx startet nicht! Prüfe Logs:"
    sudo journalctl -u nginx --no-pager -n 20
    exit 1
fi
echo ""

# 3. Firewall konfigurieren
echo "3️⃣ Firewall konfigurieren..."
sudo ufw --force enable 2>/dev/null
sudo ufw allow 22/tcp 2>/dev/null
sudo ufw allow 80/tcp 2>/dev/null
sudo ufw allow 443/tcp 2>/dev/null
echo "✅ Firewall konfiguriert"
echo ""

# 4. Prüfe lokale Erreichbarkeit
echo "4️⃣ Lokale Erreichbarkeit testen..."

# Teste Node.js (Port 3000)
NODE_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 5 2>/dev/null || echo "000")
if [ "$NODE_TEST" = "200" ] || [ "$NODE_TEST" = "301" ] || [ "$NODE_TEST" = "302" ]; then
    echo "✅ Node.js antwortet auf Port 3000 (HTTP $NODE_TEST)"
else
    echo "❌ Node.js antwortet NICHT auf Port 3000 (HTTP $NODE_TEST)"
    echo "   Prüfe PM2-Logs:"
    pm2 logs gutachtenruhr --lines 10 --nostream
fi

# Teste Nginx (Port 80)
NGINX_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --max-time 5 2>/dev/null || echo "000")
if [ "$NGINX_TEST" = "200" ] || [ "$NGINX_TEST" = "301" ] || [ "$NGINX_TEST" = "302" ]; then
    echo "✅ Nginx antwortet auf Port 80 (HTTP $NGINX_TEST)"
else
    echo "❌ Nginx antwortet NICHT auf Port 80 (HTTP $NGINX_TEST)"
    echo "   Prüfe Nginx-Logs:"
    sudo tail -10 /var/log/nginx/gutachtenruhr-error.log
fi
echo ""

# 5. Prüfe Ports
echo "5️⃣ Port-Status prüfen..."
if command -v netstat &> /dev/null; then
    PORT_3000=$(netstat -tuln 2>/dev/null | grep ":3000 " || echo "")
    PORT_80=$(netstat -tuln 2>/dev/null | grep ":80 " || echo "")
    PORT_443=$(netstat -tuln 2>/dev/null | grep ":443 " || echo "")
else
    PORT_3000=$(ss -tuln 2>/dev/null | grep ":3000 " || echo "")
    PORT_80=$(ss -tuln 2>/dev/null | grep ":80 " || echo "")
    PORT_443=$(ss -tuln 2>/dev/null | grep ":443 " || echo "")
fi

[ -n "$PORT_3000" ] && echo "✅ Port 3000 ist aktiv" || echo "❌ Port 3000 ist NICHT aktiv"
[ -n "$PORT_80" ] && echo "✅ Port 80 ist aktiv" || echo "❌ Port 80 ist NICHT aktiv"
[ -n "$PORT_443" ] && echo "✅ Port 443 ist aktiv" || echo "⚠️  Port 443 ist NICHT aktiv (HTTPS)"
echo ""

# 6. Prüfe DNS
echo "6️⃣ DNS-Status prüfen..."
CURRENT_IP=$(curl -4 -s ifconfig.me 2>/dev/null || curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)
WWW_DOMAIN_IP=$(dig +short $WWW_DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)

echo "   Server-IP: $CURRENT_IP"
echo "   $DOMAIN zeigt auf: $DOMAIN_IP"
echo "   $WWW_DOMAIN zeigt auf: $WWW_DOMAIN_IP"

if [ "$DOMAIN_IP" = "$CURRENT_IP" ] || [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
    echo "✅ $DOMAIN DNS ist korrekt"
else
    echo "❌ $DOMAIN DNS ist FALSCH! Muss auf $CURRENT_IP zeigen"
    echo "   Bitte aktualisiere DNS bei Strato!"
fi

if [ "$WWW_DOMAIN_IP" = "$CURRENT_IP" ] || [ "$WWW_DOMAIN_IP" = "$SERVER_IP" ]; then
    echo "✅ $WWW_DOMAIN DNS ist korrekt"
else
    echo "❌ $WWW_DOMAIN DNS ist FALSCH! Muss auf $CURRENT_IP zeigen"
    echo "   Bitte aktualisiere DNS bei Strato!"
fi
echo ""

# 7. Teste externe Erreichbarkeit
echo "7️⃣ Externe Erreichbarkeit testen..."
EXTERNAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://$CURRENT_IP --max-time 10 2>/dev/null || echo "000")
if [ "$EXTERNAL_HTTP" = "200" ] || [ "$EXTERNAL_HTTP" = "301" ] || [ "$EXTERNAL_HTTP" = "302" ]; then
    echo "✅ Server ist extern über IP erreichbar (HTTP $EXTERNAL_HTTP)"
else
    echo "❌ Server ist NICHT extern über IP erreichbar (HTTP $EXTERNAL_HTTP)"
    echo "   Mögliche Ursachen:"
    echo "   - Firewall blockiert Port 80"
    echo "   - Provider blockiert eingehende Verbindungen"
    echo "   - Server ist nicht erreichbar"
fi
echo ""

# 8. Zeige finale Statusübersicht
echo "📊 FINALER STATUS:"
echo "=================="
echo ""
echo "PM2:"
pm2 status
echo ""
echo "Nginx:"
sudo systemctl status nginx --no-pager | head -7
echo ""
echo "Firewall:"
sudo ufw status | head -5
echo ""

# 9. Zeige wichtige Logs
echo "📋 WICHTIGE LOGS (letzte 5 Zeilen):"
echo ""
echo "PM2 Error-Logs:"
pm2 logs gutachtenruhr --lines 5 --nostream --err 2>/dev/null | tail -5 || echo "Keine PM2-Error-Logs"
echo ""
echo "Nginx Error-Logs:"
sudo tail -5 /var/log/nginx/gutachtenruhr-error.log 2>/dev/null || echo "Keine Nginx-Error-Logs"
echo ""

# 10. Zusammenfassung und nächste Schritte
echo "✅ REPARATUR ABGESCHLOSSEN!"
echo ""
echo "💡 NÄCHSTE SCHRITTE:"
echo ""

if [ "$DOMAIN_IP" != "$CURRENT_IP" ] && [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  WICHTIG: DNS ist falsch konfiguriert!"
    echo "   1. Gehe zu Strato Kundencenter"
    echo "   2. DNS-Einstellungen für $DOMAIN und $WWW_DOMAIN"
    echo "   3. Setze A-Record auf: $CURRENT_IP"
    echo "   4. Warte 10-30 Minuten auf DNS-Propagierung"
    echo ""
fi

if [ "$EXTERNAL_HTTP" != "200" ] && [ "$EXTERNAL_HTTP" != "301" ] && [ "$EXTERNAL_HTTP" != "302" ]; then
    echo "⚠️  Server ist nicht extern erreichbar!"
    echo "   1. Prüfe Firewall: sudo ufw status verbose"
    echo "   2. Prüfe Provider-Firewall (Strato VPS-Einstellungen)"
    echo "   3. Teste manuell: curl -I http://$CURRENT_IP"
    echo ""
fi

echo "🔍 Weitere Diagnose:"
echo "   - PM2-Logs: pm2 logs gutachtenruhr --lines 50"
echo "   - Nginx-Logs: sudo tail -50 /var/log/nginx/gutachtenruhr-error.log"
echo "   - System-Logs: sudo journalctl -u nginx --no-pager -n 50"
echo ""

