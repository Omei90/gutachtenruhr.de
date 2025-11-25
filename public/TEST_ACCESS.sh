#!/bin/bash
# Teste Erreichbarkeit der Seite

echo "🧪 ERREICHBARKEITS-TEST"
echo "======================="
echo ""

DOMAIN="gutachtenruhr.de"
WWW_DOMAIN="www.gutachtenruhr.de"
SERVER_IP="82.165.219.105"

echo "1️⃣ Teste über IP ($SERVER_IP):"
echo ""
curl -I http://$SERVER_IP 2>&1 | head -10
echo ""

echo "2️⃣ Teste über Domain ($DOMAIN):"
echo ""
curl -I http://$DOMAIN 2>&1 | head -10
echo ""

echo "3️⃣ Teste über www-Domain ($WWW_DOMAIN):"
echo ""
curl -I http://$WWW_DOMAIN 2>&1 | head -10
echo ""

echo "4️⃣ Teste mit Follow Redirects ($WWW_DOMAIN):"
echo ""
curl -I -L http://$WWW_DOMAIN 2>&1 | head -15
echo ""

echo "5️⃣ Teste vollständigen Request ($WWW_DOMAIN):"
echo ""
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$WWW_DOMAIN --max-time 10)
echo "   HTTP Status Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "   ✅ Seite ist erreichbar!"
else
    echo "   ❌ Seite ist NICHT erreichbar (Status: $HTTP_CODE)"
fi
echo ""

echo "6️⃣ Prüfe DNS-Auflösung:"
echo ""
echo "   $DOMAIN:"
dig +short $DOMAIN A | head -1
echo ""
echo "   $WWW_DOMAIN:"
dig +short $WWW_DOMAIN A | head -1
echo ""

echo "✅ Test abgeschlossen!"
echo ""
echo "💡 TIPPS:"
echo "   - Falls die Seite im Browser nicht lädt:"
echo "     1. Leere Browser-Cache (Strg+Shift+Del)"
echo "     2. Verwende Inkognito-Modus"
echo "     3. Teste von anderem Netzwerk/Device"
echo "     4. Warte 5-10 Minuten auf DNS-Propagierung"
echo "   - Die 301 Redirects sind normal (HTTP zu HTTPS oder non-www zu www)"
echo ""

