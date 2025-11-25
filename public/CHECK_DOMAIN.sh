#!/bin/bash
# Prüft Domain-Erreichbarkeit und DNS

echo "🔍 PRÜFE DOMAIN-ERREICHBARKEIT"
echo "=============================="
echo ""

DOMAIN="gutachtenruhr.de"
WWW_DOMAIN="www.gutachtenruhr.de"
SERVER_IP="82.165.219.105"

# 1. Prüfe DNS-Auflösung
echo "1️⃣ DNS-Auflösung prüfen..."
echo ""
echo "   $DOMAIN:"
DOMAIN_IP=$(dig +short $DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)
if [ -n "$DOMAIN_IP" ]; then
    echo "   ✅ Zeigt auf: $DOMAIN_IP"
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
        echo "   ✅ DNS ist korrekt"
    else
        echo "   ❌ DNS ist FALSCH! Muss auf $SERVER_IP zeigen"
    fi
else
    echo "   ❌ DNS-Auflösung fehlgeschlagen"
fi
echo ""

echo "   $WWW_DOMAIN:"
WWW_DOMAIN_IP=$(dig +short $WWW_DOMAIN A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -n 1)
if [ -n "$WWW_DOMAIN_IP" ]; then
    echo "   ✅ Zeigt auf: $WWW_DOMAIN_IP"
    if [ "$WWW_DOMAIN_IP" = "$SERVER_IP" ]; then
        echo "   ✅ DNS ist korrekt"
    else
        echo "   ❌ DNS ist FALSCH! Muss auf $SERVER_IP zeigen"
    fi
else
    echo "   ❌ DNS-Auflösung fehlgeschlagen"
fi
echo ""

# 2. Teste Erreichbarkeit über Domain
echo "2️⃣ Teste Erreichbarkeit über Domain..."
echo ""
echo "   $DOMAIN:"
HTTP_DOMAIN=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_DOMAIN" = "200" ] || [ "$HTTP_DOMAIN" = "301" ] || [ "$HTTP_DOMAIN" = "302" ]; then
    echo "   ✅ Erreichbar (HTTP $HTTP_DOMAIN)"
else
    echo "   ❌ NICHT erreichbar (HTTP $HTTP_DOMAIN)"
    echo "   Versuche mit verbose:"
    curl -v http://$DOMAIN --max-time 10 2>&1 | grep -E "(Connected|Connection refused|timeout|Could not resolve)" | head -3
fi
echo ""

echo "   $WWW_DOMAIN:"
HTTP_WWW=$(curl -s -o /dev/null -w "%{http_code}" http://$WWW_DOMAIN --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_WWW" = "200" ] || [ "$HTTP_WWW" = "301" ] || [ "$HTTP_WWW" = "302" ]; then
    echo "   ✅ Erreichbar (HTTP $HTTP_WWW)"
else
    echo "   ❌ NICHT erreichbar (HTTP $HTTP_WWW)"
    echo "   Versuche mit verbose:"
    curl -v http://$WWW_DOMAIN --max-time 10 2>&1 | grep -E "(Connected|Connection refused|timeout|Could not resolve)" | head -3
fi
echo ""

# 3. Teste mit Host-Header
echo "3️⃣ Teste mit Host-Header (simuliert Domain-Zugriff)..."
echo ""
echo "   Teste IP mit Host-Header $WWW_DOMAIN:"
HTTP_HOST=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $WWW_DOMAIN" http://$SERVER_IP --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_HOST" = "200" ] || [ "$HTTP_HOST" = "301" ] || [ "$HTTP_HOST" = "302" ]; then
    echo "   ✅ Server antwortet korrekt (HTTP $HTTP_HOST)"
    echo "   → Problem liegt bei DNS oder Firewall, nicht beim Server"
else
    echo "   ❌ Server antwortet nicht (HTTP $HTTP_HOST)"
fi
echo ""

# 4. Prüfe Nginx-Konfiguration
echo "4️⃣ Prüfe Nginx-Konfiguration..."
echo ""
if [ -f "/etc/nginx/sites-available/gutachtenruhr" ]; then
    echo "   Server-Name in Nginx:"
    grep "server_name" /etc/nginx/sites-available/gutachtenruhr | head -1
    if grep -q "gutachtenruhr.de" /etc/nginx/sites-available/gutachtenruhr; then
        echo "   ✅ Nginx ist für gutachtenruhr.de konfiguriert"
    else
        echo "   ❌ Nginx ist NICHT für gutachtenruhr.de konfiguriert!"
    fi
else
    echo "   ⚠️  Nginx-Konfiguration nicht gefunden"
fi
echo ""

# Zusammenfassung
echo "📊 ZUSAMMENFASSUNG:"
echo "==================="
echo ""
if [ "$DOMAIN_IP" != "$SERVER_IP" ] || [ "$WWW_DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "❌ DNS ist FALSCH konfiguriert!"
    echo ""
    echo "   Lösung:"
    echo "   1. Gehe zu Strato-Kundencenter"
    echo "   2. DNS-Einstellungen für $DOMAIN"
    echo "   3. Setze A-Record für $DOMAIN → $SERVER_IP"
    echo "   4. Setze A-Record für $WWW_DOMAIN → $SERVER_IP"
    echo "   5. Warte 10-30 Minuten auf DNS-Propagierung"
elif [ "$HTTP_HOST" = "200" ] || [ "$HTTP_HOST" = "301" ] || [ "$HTTP_HOST" = "302" ]; then
    echo "✅ Server funktioniert korrekt"
    echo "❌ Problem liegt bei DNS oder Strato VPS-Firewall"
    echo ""
    echo "   Mögliche Ursachen:"
    echo "   1. DNS-Propagierung noch nicht abgeschlossen (warte 10-30 Min)"
    echo "   2. Strato VPS-Firewall blockiert Domain-Zugriffe"
    echo "   3. Browser-Cache (leere Cache: Strg+Shift+Del)"
else
    echo "❌ Unbekanntes Problem"
fi
echo ""

