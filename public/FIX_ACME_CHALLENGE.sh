#!/bin/bash
# Fix für ACME Challenge Problem

echo "🔧 Fixe ACME Challenge Problem..."
echo ""

# 1. Prüfe ob Port 80 offen ist
echo "📡 Prüfe Port 80..."
if sudo ufw status | grep -q "80/tcp.*ALLOW"; then
    echo "✅ Port 80 ist offen"
else
    echo "⚠️  Port 80 ist geschlossen - öffne jetzt..."
    sudo ufw allow 80/tcp
fi

# 2. Prüfe Nginx-Konfiguration
echo ""
echo "📋 Prüfe Nginx-Konfiguration..."
NGINX_CONF="/etc/nginx/sites-available/gutachtenruhr"

if [ -f "$NGINX_CONF" ]; then
    # Prüfe ob .well-known bereits konfiguriert ist
    if grep -q "\.well-known" "$NGINX_CONF"; then
        echo "✅ .well-known ist bereits in Nginx-Konfiguration"
    else
        echo "⚠️  .well-known fehlt - füge hinzu..."
        
        # Backup erstellen
        sudo cp "$NGINX_CONF" "$NGINX_CONF.backup"
        
        # Füge .well-known Location hinzu (vor dem location / Block)
        sudo sed -i '/location \/ {/i\
    # Let'\''s Encrypt ACME Challenge\
    location /.well-known/acme-challenge/ {\
        root /var/www/html;\
        allow all;\
    }\
' "$NGINX_CONF"
        
        echo "✅ .well-known Location hinzugefügt"
    fi
else
    echo "❌ Nginx-Konfiguration nicht gefunden: $NGINX_CONF"
    echo "   Bitte prüfe den Pfad zur Nginx-Konfiguration"
fi

# 3. Teste Nginx-Konfiguration
echo ""
echo "🧪 Teste Nginx-Konfiguration..."
if sudo nginx -t; then
    echo "✅ Nginx-Konfiguration ist gültig"
    echo "🔄 Lade Nginx neu..."
    sudo systemctl reload nginx
else
    echo "❌ Nginx-Konfiguration hat Fehler!"
    echo "   Bitte prüfe die Konfiguration manuell"
    exit 1
fi

# 4. Prüfe DNS
echo ""
echo "🌐 Prüfe DNS-Einstellungen..."
echo "   Domain sollte auf diese IP zeigen:"
curl -s ifconfig.me
echo ""
echo "   Prüfe mit: dig gutachtenruhr.de +short"
echo "   Prüfe mit: dig www.gutachtenruhr.de +short"

# 5. Teste ACME Challenge manuell
echo ""
echo "🧪 Teste ACME Challenge Zugriff..."
TEST_URL="http://gutachtenruhr.de/.well-known/acme-challenge/test"
echo "   Teste: $TEST_URL"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL")
echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Server ist erreichbar (404 ist OK für Test-URL)"
else
    echo "⚠️  Unerwarteter Status-Code: $HTTP_CODE"
fi

echo ""
echo "✅ Fix abgeschlossen!"
echo ""
echo "🔄 Versuche jetzt erneut:"
echo "   sudo certbot --nginx -d www.gutachtenruhr.de -d gutachtenruhr.de"

