#!/bin/bash
# Finale Prüfung aller Komponenten

echo "🔍 FINALE PRÜFUNG"
echo "================="
echo ""

# 1. Prüfe ob Nginx auf 0.0.0.0:80 lauscht
echo "1️⃣ Prüfe Nginx Listen-Status..."
echo ""
PORT_80=$(sudo ss -tuln | grep ":80 " || echo "")
if [ -n "$PORT_80" ]; then
    echo "   Port 80 Status:"
    echo "$PORT_80"
    echo ""
    if echo "$PORT_80" | grep -q "0.0.0.0:80"; then
        echo "   ✅ Nginx lauscht auf 0.0.0.0:80 (alle Interfaces - KORREKT)"
    elif echo "$PORT_80" | grep -q "127.0.0.1:80"; then
        echo "   ❌ Nginx lauscht nur auf 127.0.0.1:80 (nur localhost - FALSCH!)"
        echo "   Lösung: Bearbeite /etc/nginx/sites-available/gutachtenruhr"
        echo "   Ändere 'listen 127.0.0.1:80;' zu 'listen 80;'"
    else
        echo "   ⚠️  Unbekannter Listen-Status"
    fi
else
    echo "   ❌ Port 80 ist nicht aktiv!"
fi
echo ""

# 2. Prüfe iptables-Regeln
echo "2️⃣ Prüfe iptables-Regeln für Port 80..."
echo ""
IPTABLES_80=$(sudo iptables -L INPUT -n -v | grep "dpt:80" || echo "")
if [ -n "$IPTABLES_80" ]; then
    echo "   ✅ Port 80 ist in iptables erlaubt:"
    echo "$IPTABLES_80"
else
    echo "   ❌ Port 80 ist NICHT in iptables erlaubt!"
    echo "   Führe FIX_IPTABLES.sh aus"
fi
echo ""

# 3. Prüfe UFW-Status
echo "3️⃣ Prüfe UFW-Status..."
echo ""
UFW_80=$(sudo ufw status | grep "80/tcp" || echo "")
if [ -n "$UFW_80" ]; then
    echo "   ✅ Port 80 ist in UFW erlaubt"
else
    echo "   ⚠️  Port 80 ist nicht in UFW erlaubt (aber das ist ok, wenn iptables es erlaubt)"
fi
echo ""

# 4. Teste lokale Erreichbarkeit
echo "4️⃣ Teste lokale Erreichbarkeit..."
echo ""
LOCAL_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --max-time 5 2>/dev/null || echo "000")
if [ "$LOCAL_TEST" = "200" ] || [ "$LOCAL_TEST" = "301" ] || [ "$LOCAL_TEST" = "302" ]; then
    echo "   ✅ Nginx antwortet lokal (HTTP $LOCAL_TEST)"
else
    echo "   ❌ Nginx antwortet NICHT lokal (HTTP $LOCAL_TEST)"
fi
echo ""

# 5. Teste Erreichbarkeit über Server-IP
echo "5️⃣ Teste Erreichbarkeit über Server-IP..."
echo ""
SERVER_IP=$(curl -4 -s ifconfig.me 2>/dev/null || curl -s ifconfig.me)
echo "   Server-IP: $SERVER_IP"
IP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP --max-time 10 2>/dev/null || echo "000")
if [ "$IP_TEST" = "200" ] || [ "$IP_TEST" = "301" ] || [ "$IP_TEST" = "302" ]; then
    echo "   ✅ Server antwortet über eigene IP (HTTP $IP_TEST)"
else
    echo "   ❌ Server antwortet NICHT über eigene IP (HTTP $IP_TEST)"
fi
echo ""

# 6. Prüfe Nginx-Konfiguration
echo "6️⃣ Prüfe Nginx listen-Konfiguration..."
echo ""
if [ -f "/etc/nginx/sites-available/gutachtenruhr" ]; then
    LISTEN_LINE=$(grep -i "listen" /etc/nginx/sites-available/gutachtenruhr | grep -v "#" | head -1)
    echo "   Aktuelle listen-Direktive: $LISTEN_LINE"
    
    if echo "$LISTEN_LINE" | grep -q "listen 80;"; then
        echo "   ✅ Nginx-Konfiguration ist korrekt (lauscht auf allen Interfaces)"
    elif echo "$LISTEN_LINE" | grep -q "listen 127.0.0.1:80"; then
        echo "   ❌ Nginx-Konfiguration ist FALSCH (lauscht nur auf localhost)!"
        echo "   Bearbeite /etc/nginx/sites-available/gutachtenruhr"
        echo "   Ändere zu: listen 80;"
    elif echo "$LISTEN_LINE" | grep -q "listen 0.0.0.0:80"; then
        echo "   ✅ Nginx-Konfiguration ist korrekt (explizit 0.0.0.0)"
    else
        echo "   ⚠️  Unbekannte listen-Konfiguration"
    fi
else
    echo "   ⚠️  Nginx-Konfiguration nicht gefunden"
fi
echo ""

# 7. Prüfe Nginx-Status
echo "7️⃣ Prüfe Nginx-Status..."
echo ""
if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx läuft"
else
    echo "   ❌ Nginx läuft NICHT!"
fi
echo ""

# 8. Prüfe PM2-Status
echo "8️⃣ Prüfe PM2-Status..."
echo ""
if pm2 list | grep -q "gutachtenruhr.*online"; then
    echo "   ✅ PM2 läuft"
else
    echo "   ❌ PM2 läuft NICHT!"
fi
echo ""

# Zusammenfassung
echo "📊 ZUSAMMENFASSUNG:"
echo "==================="
echo ""

ALL_OK=true

if ! echo "$PORT_80" | grep -q "0.0.0.0:80"; then
    echo "❌ Nginx lauscht nicht auf 0.0.0.0:80"
    ALL_OK=false
fi

if [ -z "$IPTABLES_80" ]; then
    echo "❌ iptables erlaubt Port 80 nicht"
    ALL_OK=false
fi

if [ "$LOCAL_TEST" != "200" ] && [ "$LOCAL_TEST" != "301" ] && [ "$LOCAL_TEST" != "302" ]; then
    echo "❌ Nginx antwortet nicht lokal"
    ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo "✅ Alle Komponenten sind korrekt konfiguriert!"
    echo ""
    echo "💡 Falls die Seite immer noch nicht erreichbar ist:"
    echo "   1. Warte 2-3 Minuten (DNS/Netzwerk-Propagierung)"
    echo "   2. Teste von anderem Netzwerk/Device"
    echo "   3. Prüfe Strato VPS-Netzwerk-Einstellungen"
    echo "   4. Teste direkt über IP: http://$SERVER_IP"
else
    echo "❌ Es gibt noch Konfigurationsprobleme!"
    echo "   Siehe Details oben"
fi
echo ""

