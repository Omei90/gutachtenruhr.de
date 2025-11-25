#!/bin/bash
# Vollständige Diagnose für Domain-Erreichbarkeit

echo "🔍 VOLLSTÄNDIGE DOMAIN-DIAGNOSE"
echo "================================="
echo ""

DOMAIN="gutachtenruhr.de"
WWW_DOMAIN="www.gutachtenruhr.de"
SERVER_IP="82.165.219.105"

# 1. Prüfe DNS
echo "1️⃣ DNS-Auflösung:"
DOMAIN_IP=$(dig +short $DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)
WWW_DOMAIN_IP=$(dig +short $WWW_DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)

echo "   $DOMAIN → $DOMAIN_IP"
echo "   $WWW_DOMAIN → $WWW_DOMAIN_IP"
echo "   Server-IP: $SERVER_IP"
echo ""

if [ "$DOMAIN_IP" = "$SERVER_IP" ] && [ "$WWW_DOMAIN_IP" = "$SERVER_IP" ]; then
    echo "   ✅ DNS ist korrekt"
else
    echo "   ❌ DNS ist FALSCH!"
    echo "   Bitte aktualisiere DNS bei Strato"
    exit 1
fi
echo ""

# 2. Prüfe PM2
echo "2️⃣ PM2-Status:"
if pm2 list | grep -q "gutachtenruhr.*online"; then
    echo "   ✅ PM2 läuft"
else
    echo "   ❌ PM2 läuft NICHT!"
    echo "   Starte PM2: pm2 start server.js --name gutachtenruhr"
fi
echo ""

# 3. Prüfe Nginx
echo "3️⃣ Nginx-Status:"
if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx läuft"
else
    echo "   ❌ Nginx läuft NICHT!"
    echo "   Starte Nginx: sudo systemctl start nginx"
fi
echo ""

# 4. Prüfe Port 80
echo "4️⃣ Port 80 Status:"
PORT_80=$(sudo ss -tuln | grep ":80 " || echo "")
if [ -n "$PORT_80" ]; then
    echo "   ✅ Port 80 ist aktiv:"
    echo "$PORT_80"
    if echo "$PORT_80" | grep -q "0.0.0.0:80"; then
        echo "   ✅ Nginx lauscht auf allen Interfaces"
    else
        echo "   ⚠️  Nginx lauscht möglicherweise nicht auf allen Interfaces"
    fi
else
    echo "   ❌ Port 80 ist NICHT aktiv!"
fi
echo ""

# 5. Prüfe Nginx-Konfiguration
echo "5️⃣ Nginx-Konfiguration:"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Nginx-Konfiguration ist gültig"
    
    # Prüfe server_name
    if sudo nginx -T 2>/dev/null | grep -q "server_name.*gutachtenruhr"; then
        echo "   ✅ Nginx lauscht auf gutachtenruhr.de"
        echo "   Server-Name:"
        sudo nginx -T 2>/dev/null | grep "server_name" | grep gutachtenruhr | head -1
    else
        echo "   ❌ Nginx lauscht NICHT auf gutachtenruhr.de!"
    fi
else
    echo "   ❌ Nginx-Konfiguration hat Fehler:"
    sudo nginx -t
fi
echo ""

# 6. Teste lokale Erreichbarkeit
echo "6️⃣ Lokale Erreichbarkeit:"
LOCAL_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --max-time 5 2>/dev/null || echo "000")
if [ "$LOCAL_TEST" = "200" ] || [ "$LOCAL_TEST" = "301" ] || [ "$LOCAL_TEST" = "302" ]; then
    echo "   ✅ Nginx antwortet lokal (HTTP $LOCAL_TEST)"
else
    echo "   ❌ Nginx antwortet NICHT lokal (HTTP $LOCAL_TEST)"
fi
echo ""

# 7. Teste mit Host-Header
echo "7️⃣ Teste Server mit Domain-Host-Header:"
HTTP_HOST=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $WWW_DOMAIN" http://$SERVER_IP --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_HOST" = "200" ] || [ "$HTTP_HOST" = "301" ] || [ "$HTTP_HOST" = "302" ]; then
    echo "   ✅ Server antwortet korrekt mit Domain-Host-Header (HTTP $HTTP_HOST)"
    echo "   → Server funktioniert, Problem liegt bei DNS-Propagierung oder externer Firewall"
else
    echo "   ❌ Server antwortet NICHT mit Domain-Host-Header (HTTP $HTTP_HOST)"
    echo "   → Problem liegt beim Server"
fi
echo ""

# 8. Teste Domain direkt
echo "8️⃣ Teste Domain direkt:"
echo "   $WWW_DOMAIN:"
HTTP_WWW=$(curl -s -o /dev/null -w "%{http_code}" http://$WWW_DOMAIN --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_WWW" = "200" ] || [ "$HTTP_WWW" = "301" ] || [ "$HTTP_WWW" = "302" ]; then
    echo "   ✅ Domain ist erreichbar (HTTP $HTTP_WWW)"
else
    echo "   ❌ Domain ist NICHT erreichbar (HTTP $HTTP_WWW)"
    echo ""
    echo "   Verbindungsdetails:"
    curl -v http://$WWW_DOMAIN --max-time 10 2>&1 | grep -E "(Connected|Connection refused|timeout|Could not resolve|Trying|Failed)" | head -10
fi
echo ""

# 9. Teste von verschiedenen DNS-Servern
echo "9️⃣ DNS-Propagierung prüfen (verschiedene DNS-Server):"
echo ""
echo "   Google DNS (8.8.8.8):"
GOOGLE_IP=$(dig @8.8.8.8 +short $WWW_DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)
echo "   → $GOOGLE_IP"
if [ "$GOOGLE_IP" = "$SERVER_IP" ]; then
    echo "   ✅ Google DNS zeigt auf korrekte IP"
else
    echo "   ❌ Google DNS zeigt auf falsche IP"
fi
echo ""

echo "   Cloudflare DNS (1.1.1.1):"
CF_IP=$(dig @1.1.1.1 +short $WWW_DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)
echo "   → $CF_IP"
if [ "$CF_IP" = "$SERVER_IP" ]; then
    echo "   ✅ Cloudflare DNS zeigt auf korrekte IP"
else
    echo "   ❌ Cloudflare DNS zeigt auf falsche IP"
fi
echo ""

# 10. Prüfe Nginx-Logs
echo "🔟 Letzte Nginx-Access-Logs:"
sudo tail -10 /var/log/nginx/gutachtenruhr-access.log 2>/dev/null | tail -5 || echo "   Keine Logs gefunden"
echo ""

# Zusammenfassung
echo "📊 ZUSAMMENFASSUNG:"
echo "==================="
echo ""

if [ "$HTTP_HOST" = "200" ] || [ "$HTTP_HOST" = "301" ] || [ "$HTTP_HOST" = "302" ]; then
    if [ "$HTTP_WWW" != "200" ] && [ "$HTTP_WWW" != "301" ] && [ "$HTTP_WWW" != "302" ]; then
        echo "✅ Server funktioniert korrekt"
        echo "❌ Domain ist nicht erreichbar (aber DNS ist korrekt)"
        echo ""
        echo "💡 LÖSUNGEN:"
        echo ""
        echo "   1. DNS-Propagierung abwarten (10-30 Minuten)"
        echo "      → Teste von anderem Netzwerk/Device"
        echo "      → Verwende andere DNS-Server (8.8.8.8, 1.1.1.1)"
        echo ""
        echo "   2. Browser-Cache leeren"
        echo "      → Strg+Shift+Del → Cache leeren"
        echo "      → Inkognito-Modus verwenden"
        echo ""
        echo "   3. Lokalen DNS-Cache leeren"
        echo "      → Windows: ipconfig /flushdns"
        echo "      → Teste von anderem Netzwerk"
        echo ""
        echo "   4. Teste direkt über IP:"
        echo "      → http://82.165.219.105 (sollte funktionieren)"
        echo ""
        if [ "$GOOGLE_IP" != "$SERVER_IP" ] || [ "$CF_IP" != "$SERVER_IP" ]; then
            echo "   ⚠️  DNS-Propagierung noch nicht abgeschlossen!"
            echo "      Verschiedene DNS-Server zeigen auf unterschiedliche IPs"
            echo "      → Warte noch 10-30 Minuten"
        fi
    else
        echo "✅ Alles funktioniert!"
    fi
else
    echo "❌ Server-Problem erkannt"
    echo "   Prüfe PM2 und Nginx-Status"
fi
echo ""

