#!/bin/bash
# Prüfe DNS-Propagierung von verschiedenen DNS-Servern

echo "🔍 DNS-Propagierung prüfen"
echo "=========================="
echo ""

DOMAIN="gutachtenruhr.de"
EXPECTED_IP="82.165.219.105"
OLD_IP="217.160.0.173"

echo "Erwartete IP: $EXPECTED_IP"
echo "Alte IP: $OLD_IP"
echo ""

# Prüfe von verschiedenen DNS-Servern
echo "🌐 Prüfe DNS von verschiedenen Servern:"
echo ""

# Google DNS
GOOGLE_IP=$(dig @8.8.8.8 +short $DOMAIN A | head -1)
echo "Google DNS (8.8.8.8): $GOOGLE_IP"
if [ "$GOOGLE_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Korrekt!"
elif [ "$GOOGLE_IP" = "$OLD_IP" ]; then
    echo "   ❌ Noch alte IP"
else
    echo "   ⚠️  Andere IP: $GOOGLE_IP"
fi
echo ""

# Cloudflare DNS
CF_IP=$(dig @1.1.1.1 +short $DOMAIN A | head -1)
echo "Cloudflare DNS (1.1.1.1): $CF_IP"
if [ "$CF_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Korrekt!"
elif [ "$CF_IP" = "$OLD_IP" ]; then
    echo "   ❌ Noch alte IP"
else
    echo "   ⚠️  Andere IP: $CF_IP"
fi
echo ""

# Strato DNS (falls bekannt)
STRATO_IP=$(dig @85.13.129.1 +short $DOMAIN A | head -1)
echo "Strato DNS (85.13.129.1): $STRATO_IP"
if [ "$STRATO_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Korrekt!"
elif [ "$STRATO_IP" = "$OLD_IP" ]; then
    echo "   ❌ Noch alte IP"
else
    echo "   ⚠️  Andere IP: $STRATO_IP"
fi
echo ""

# Lokaler DNS-Cache
LOCAL_IP=$(dig +short $DOMAIN A | head -1)
echo "Lokaler DNS: $LOCAL_IP"
if [ "$LOCAL_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Korrekt!"
elif [ "$LOCAL_IP" = "$OLD_IP" ]; then
    echo "   ❌ Noch alte IP (Cache?)"
else
    echo "   ⚠️  Andere IP: $LOCAL_IP"
fi
echo ""

# Prüfe www-Subdomain
echo "🌐 Prüfe www.gutachtenruhr.de:"
WWW_IP=$(dig +short www.gutachtenruhr.de A | head -1)
echo "   IP: $WWW_IP"
if [ "$WWW_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Korrekt!"
else
    echo "   ❌ Falsch oder noch nicht propagiert"
fi
echo ""

echo "💡 Lösungen:"
echo "============"
echo ""
echo "1. Warte noch 10-30 Minuten (DNS-Propagierung kann dauern)"
echo ""
echo "2. Prüfe in Strato, ob die Änderungen wirklich gespeichert wurden:"
echo "   - Gehe zu A-Record → verwalten"
echo "   - Prüfe ob beide Einträge (@ und www) auf $EXPECTED_IP zeigen"
echo "   - Klicke 'Einstellungen übernehmen'"
echo ""
echo "3. Leere DNS-Cache (falls möglich):"
echo "   sudo systemd-resolve --flush-caches"
echo ""
echo "4. Falls es dringend ist, verwende temporär die alte IP für Certbot:"
echo "   (Nur wenn die neue IP wirklich in Strato gesetzt ist)"
echo "   sudo certbot certonly --standalone -d www.gutachtenruhr.de -d gutachtenruhr.de --email info@kfzgutachter-heiken.de --agree-tos --preferred-challenges http"
echo ""

