#!/bin/bash
# Notfall-Reparatur für Server-Erreichbarkeit

echo "🚨 NOTFALL-REPARATUR"
echo "===================="
echo ""

cd /var/www/gutachtenruhr/public

# 1. Stoppe alles
echo "1️⃣ Stoppe alle Services..."
pm2 stop all 2>/dev/null
sudo systemctl stop nginx 2>/dev/null
sleep 2
echo ""

# 2. Lade aktuelle Dateien von GitHub
echo "2️⃣ Lade aktuelle Dateien von GitHub..."
git pull origin main 2>/dev/null || {
    echo "   Git pull fehlgeschlagen, lade manuell..."
    curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
    curl -o nginx-gutachtenruhr.conf https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/nginx-gutachtenruhr.conf
}
echo ""

# 3. Prüfe ob server.js existiert
if [ ! -f "server.js" ]; then
    echo "❌ server.js fehlt! Erstelle neu..."
    exit 1
fi

# 4. Starte PM2 neu
echo "3️⃣ Starte PM2 neu..."
pm2 delete all 2>/dev/null
pm2 start server.js --name gutachtenruhr
pm2 save
sleep 3

if ! pm2 list | grep -q "gutachtenruhr.*online"; then
    echo "❌ PM2 startet nicht! Prüfe Logs:"
    pm2 logs gutachtenruhr --lines 20 --nostream
    exit 1
fi
echo "✅ PM2 läuft"
echo ""

# 5. Aktualisiere Nginx-Konfiguration
echo "4️⃣ Aktualisiere Nginx-Konfiguration..."
if [ -f "nginx-gutachtenruhr.conf" ]; then
    sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr
    sudo ln -sf /etc/nginx/sites-available/gutachtenruhr /etc/nginx/sites-enabled/
    
    # Entferne default site falls vorhanden
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Teste Konfiguration
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo "✅ Nginx-Konfiguration ist gültig"
    else
        echo "❌ Nginx-Konfiguration hat Fehler:"
        sudo nginx -t
        exit 1
    fi
else
    echo "⚠️  nginx-gutachtenruhr.conf nicht gefunden, verwende vorhandene Konfiguration"
fi
echo ""

# 6. Starte Nginx
echo "5️⃣ Starte Nginx..."
sudo systemctl start nginx
sleep 2

if ! systemctl is-active --quiet nginx; then
    echo "❌ Nginx startet nicht! Prüfe Logs:"
    sudo journalctl -u nginx --no-pager -n 20
    exit 1
fi
echo "✅ Nginx läuft"
echo ""

# 7. Firewall sicherstellen
echo "6️⃣ Konfiguriere Firewall..."
sudo ufw --force enable 2>/dev/null
sudo ufw allow 22/tcp 2>/dev/null
sudo ufw allow 80/tcp 2>/dev/null
sudo ufw allow 443/tcp 2>/dev/null
sudo ufw reload 2>/dev/null
echo "✅ Firewall konfiguriert"
echo ""

# 8. Teste lokale Erreichbarkeit
echo "7️⃣ Teste lokale Erreichbarkeit..."
NODE_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 5 2>/dev/null || echo "000")
NGINX_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --max-time 5 2>/dev/null || echo "000")

if [ "$NODE_TEST" = "200" ] || [ "$NODE_TEST" = "301" ] || [ "$NODE_TEST" = "302" ]; then
    echo "✅ Node.js antwortet (HTTP $NODE_TEST)"
else
    echo "❌ Node.js antwortet NICHT (HTTP $NODE_TEST)"
    echo "   Prüfe PM2-Logs:"
    pm2 logs gutachtenruhr --lines 10 --nostream
fi

if [ "$NGINX_TEST" = "200" ] || [ "$NGINX_TEST" = "301" ] || [ "$NGINX_TEST" = "302" ]; then
    echo "✅ Nginx antwortet (HTTP $NGINX_TEST)"
else
    echo "❌ Nginx antwortet NICHT (HTTP $NGINX_TEST)"
    echo "   Prüfe Nginx-Logs:"
    sudo tail -10 /var/log/nginx/gutachtenruhr-error.log
fi
echo ""

# 9. Teste externe Erreichbarkeit
echo "8️⃣ Teste externe Erreichbarkeit..."
CURRENT_IP=$(curl -4 -s ifconfig.me 2>/dev/null || curl -s ifconfig.me)
echo "   Server-IP: $CURRENT_IP"

EXTERNAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://$CURRENT_IP --max-time 10 2>/dev/null || echo "000")
if [ "$EXTERNAL_HTTP" = "200" ] || [ "$EXTERNAL_HTTP" = "301" ] || [ "$EXTERNAL_HTTP" = "302" ]; then
    echo "✅ Server ist extern über IP erreichbar (HTTP $EXTERNAL_HTTP)"
else
    echo "❌ Server ist NICHT extern über IP erreichbar (HTTP $EXTERNAL_HTTP)"
    echo "   Mögliche Ursachen:"
    echo "   - Provider-Firewall blockiert Port 80"
    echo "   - Strato VPS-Einstellungen blockieren eingehende Verbindungen"
    echo "   - Server ist nicht erreichbar"
fi
echo ""

# 10. Prüfe DNS
echo "9️⃣ Prüfe DNS..."
DOMAIN_IP=$(dig +short gutachtenruhr.de A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)
WWW_DOMAIN_IP=$(dig +short www.gutachtenruhr.de A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)

echo "   gutachtenruhr.de zeigt auf: $DOMAIN_IP"
echo "   www.gutachtenruhr.de zeigt auf: $WWW_DOMAIN_IP"

if [ "$DOMAIN_IP" = "$CURRENT_IP" ]; then
    echo "✅ DNS für gutachtenruhr.de ist korrekt"
else
    echo "❌ DNS für gutachtenruhr.de ist FALSCH!"
    echo "   Muss auf $CURRENT_IP zeigen, zeigt aber auf $DOMAIN_IP"
    echo "   Bitte aktualisiere DNS bei Strato!"
fi

if [ "$WWW_DOMAIN_IP" = "$CURRENT_IP" ]; then
    echo "✅ DNS für www.gutachtenruhr.de ist korrekt"
else
    echo "❌ DNS für www.gutachtenruhr.de ist FALSCH!"
    echo "   Muss auf $CURRENT_IP zeigen, zeigt aber auf $WWW_DOMAIN_IP"
    echo "   Bitte aktualisiere DNS bei Strato!"
fi
echo ""

# Finale Statusübersicht
echo "📊 FINALER STATUS:"
echo "=================="
pm2 status
echo ""
sudo systemctl status nginx --no-pager | head -7
echo ""

echo "✅ REPARATUR ABGESCHLOSSEN!"
echo ""
echo "💡 NÄCHSTE SCHRITTE:"
echo ""
echo "1. Teste die Seite:"
echo "   - http://$CURRENT_IP"
echo "   - http://gutachtenruhr.de"
echo "   - http://www.gutachtenruhr.de"
echo ""
echo "2. Falls DNS falsch ist, aktualisiere bei Strato:"
echo "   - A-Record für gutachtenruhr.de → $CURRENT_IP"
echo "   - A-Record für www.gutachtenruhr.de → $CURRENT_IP"
echo ""
echo "3. Falls die Seite immer noch nicht erreichbar ist:"
echo "   - Prüfe Strato VPS-Firewall-Einstellungen"
echo "   - Prüfe ob Port 80/443 in Strato-Kundencenter freigegeben sind"
echo "   - Kontaktiere Strato-Support"
echo ""

