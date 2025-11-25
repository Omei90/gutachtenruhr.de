#!/bin/bash
# Diagnose-Script für Certbot-Problem

echo "🔍 Certbot Diagnose"
echo "==================="
echo ""

# 1. Prüfe Server-IP
echo "📡 Server-IP-Adressen:"
echo "   IPv4:"
curl -s -4 ifconfig.me
echo ""
echo "   IPv6:"
curl -s -6 ifconfig.me 2>/dev/null || echo "   (IPv6 nicht verfügbar)"
echo ""

# 2. Prüfe DNS-Einstellungen
echo "🌐 DNS-Einstellungen:"
echo "   gutachtenruhr.de zeigt auf:"
dig +short gutachtenruhr.de A
echo "   www.gutachtenruhr.de zeigt auf:"
dig +short www.gutachtenruhr.de A
echo ""

# 3. Prüfe Firewall
echo "🔥 Firewall-Status:"
sudo ufw status
echo ""

# 4. Prüfe ob Port 80 offen ist
echo "🔌 Port 80 Status:"
if sudo netstat -tuln | grep -q ":80 "; then
    echo "   ✅ Port 80 ist in Verwendung"
    sudo netstat -tuln | grep ":80 "
else
    echo "   ⚠️  Port 80 ist NICHT in Verwendung"
fi
echo ""

# 5. Prüfe ob Nginx läuft
echo "🌐 Nginx-Status:"
sudo systemctl status nginx --no-pager | head -5
echo ""

# 6. Teste lokalen Zugriff auf Port 80
echo "🧪 Teste lokalen Zugriff auf Port 80:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
echo "   HTTP Status: $HTTP_CODE"
echo ""

# 7. Prüfe externe Erreichbarkeit
echo "🌍 Teste externe Erreichbarkeit:"
echo "   Von außen erreichbar?"
EXTERNAL_IP=$(curl -s ifconfig.me)
echo "   Server-IP: $EXTERNAL_IP"
echo "   Teste: curl http://$EXTERNAL_IP"
HTTP_CODE_EXT=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://$EXTERNAL_IP 2>/dev/null || echo "timeout")
echo "   HTTP Status: $HTTP_CODE_EXT"
echo ""

# 8. Prüfe ob Domain auf diese IP zeigt
DOMAIN_IP=$(dig +short gutachtenruhr.de A | head -1)
if [ "$DOMAIN_IP" = "$EXTERNAL_IP" ]; then
    echo "✅ Domain zeigt auf diese Server-IP"
else
    echo "❌ Domain zeigt NICHT auf diese Server-IP!"
    echo "   Domain-IP: $DOMAIN_IP"
    echo "   Server-IP: $EXTERNAL_IP"
    echo "   ⚠️  Bitte aktualisiere die DNS-Einstellungen!"
fi
echo ""

# 9. Prüfe IPv6 (falls vorhanden)
echo "🔍 IPv6-Prüfung:"
if ip -6 addr show | grep -q "inet6"; then
    echo "   IPv6 ist aktiv"
    IPv6_ADDR=$(ip -6 addr show | grep "inet6" | grep -v "::1" | head -1 | awk '{print $2}' | cut -d'/' -f1)
    echo "   IPv6-Adresse: $IPv6_ADDR"
    echo "   ⚠️  Let's Encrypt versucht über IPv6 zu verbinden"
    echo "   Mögliche Lösung: IPv6 in DNS deaktivieren oder IPv6 richtig konfigurieren"
else
    echo "   IPv6 ist nicht aktiv"
fi
echo ""

echo "✅ Diagnose abgeschlossen!"
echo ""
echo "💡 Mögliche Lösungen:"
echo "   1. Prüfe DNS-Einstellungen bei Strato"
echo "   2. Stelle sicher, dass Port 80 offen ist: sudo ufw allow 80/tcp"
echo "   3. Falls IPv6-Problem: Deaktiviere IPv6 in DNS oder konfiguriere es richtig"
echo "   4. Prüfe ob die Domain wirklich auf diese IP zeigt"

