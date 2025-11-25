#!/bin/bash
# Testet Domain-Erreichbarkeit

echo "🧪 TESTE DOMAIN-ERREICHBARKEIT"
echo "=============================="
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
    exit 1
fi
echo ""

# 2. Teste mit Host-Header (simuliert Domain-Zugriff)
echo "2️⃣ Teste Server mit Domain-Host-Header:"
echo ""
echo "   Teste IP mit Host-Header '$WWW_DOMAIN':"
HTTP_HOST=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $WWW_DOMAIN" http://$SERVER_IP --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_HOST" = "200" ] || [ "$HTTP_HOST" = "301" ] || [ "$HTTP_HOST" = "302" ]; then
    echo "   ✅ Server antwortet korrekt (HTTP $HTTP_HOST)"
    echo "   → Server funktioniert, Problem liegt bei DNS-Propagierung oder Firewall"
else
    echo "   ❌ Server antwortet nicht (HTTP $HTTP_HOST)"
    echo "   → Problem liegt beim Server"
fi
echo ""

# 3. Teste Domain direkt
echo "3️⃣ Teste Domain direkt:"
echo ""
echo "   $WWW_DOMAIN:"
HTTP_WWW=$(curl -s -o /dev/null -w "%{http_code}" http://$WWW_DOMAIN --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_WWW" = "200" ] || [ "$HTTP_WWW" = "301" ] || [ "$HTTP_WWW" = "302" ]; then
    echo "   ✅ Domain ist erreichbar (HTTP $HTTP_WWW)"
else
    echo "   ❌ Domain ist NICHT erreichbar (HTTP $HTTP_WWW)"
    echo ""
    echo "   Verbindungsdetails:"
    curl -v http://$WWW_DOMAIN --max-time 10 2>&1 | grep -E "(Connected|Connection refused|timeout|Could not resolve|Trying)" | head -5
fi
echo ""

# 4. Prüfe Nginx-Konfiguration
echo "4️⃣ Prüfe Nginx-Konfiguration:"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Nginx-Konfiguration ist gültig"
    
    # Prüfe ob Nginx auf die Domain lauscht
    if sudo nginx -T 2>/dev/null | grep -q "server_name.*gutachtenruhr"; then
        echo "   ✅ Nginx lauscht auf gutachtenruhr.de"
    else
        echo "   ❌ Nginx lauscht NICHT auf gutachtenruhr.de!"
    fi
else
    echo "   ❌ Nginx-Konfiguration hat Fehler:"
    sudo nginx -t
fi
echo ""

# 5. Prüfe Nginx-Logs
echo "5️⃣ Letzte Nginx-Access-Logs:"
sudo tail -5 /var/log/nginx/gutachtenruhr-access.log 2>/dev/null | grep -E "(gutachtenruhr|www)" || echo "   Keine Domain-Zugriffe in Logs"
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
        echo "💡 MÖGLICHE URSACHEN:"
        echo ""
        echo "   1. DNS-Propagierung noch nicht abgeschlossen"
        echo "      → Warte 10-30 Minuten"
        echo "      → Teste von anderem Netzwerk/Device"
        echo ""
        echo "   2. Browser-Cache"
        echo "      → Leere Browser-Cache (Strg+Shift+Del)"
        echo "      → Verwende Inkognito-Modus"
        echo ""
        echo "   3. Strato VPS-Firewall blockiert Domain-Zugriffe"
        echo "      → Prüfe Strato-Kundencenter → VPS → Firewall"
        echo "      → Stelle sicher, dass Port 80/443 erlaubt sind"
        echo ""
        echo "   4. Lokaler DNS-Cache"
        echo "      → Windows: ipconfig /flushdns"
        echo "      → Teste von anderem Netzwerk"
    else
        echo "✅ Alles funktioniert!"
    fi
else
    echo "❌ Server-Problem erkannt"
fi
echo ""

