#!/bin/bash
# Prüft iptables und andere mögliche Blockaden

echo "🔍 PRÜFE IPTABLES UND NETZWERK"
echo "==============================="
echo ""

# 1. Prüfe iptables-Regeln
echo "1️⃣ Prüfe iptables-Regeln..."
echo ""
echo "   IPv4-Regeln:"
sudo iptables -L -n -v | grep -E "(80|443|INPUT|OUTPUT)" | head -20 || echo "   Keine relevanten iptables-Regeln gefunden"
echo ""

echo "   IPv6-Regeln:"
sudo ip6tables -L -n -v 2>/dev/null | grep -E "(80|443|INPUT|OUTPUT)" | head -20 || echo "   Keine relevanten ip6tables-Regeln gefunden"
echo ""

# 2. Prüfe ob Port 80 wirklich auf allen Interfaces lauscht
echo "2️⃣ Prüfe auf welchen Interfaces Nginx lauscht..."
echo ""
if command -v netstat &> /dev/null; then
    echo "   Port 80 Listen-Status:"
    sudo netstat -tuln | grep ":80 " || echo "   Port 80 nicht gefunden"
else
    echo "   Port 80 Listen-Status:"
    sudo ss -tuln | grep ":80 " || echo "   Port 80 nicht gefunden"
fi
echo ""

# 3. Prüfe Nginx-Konfiguration für listen-Direktive
echo "3️⃣ Prüfe Nginx listen-Konfiguration..."
echo ""
if [ -f "/etc/nginx/sites-available/gutachtenruhr" ]; then
    echo "   Listen-Direktiven in Nginx-Konfiguration:"
    grep -i "listen" /etc/nginx/sites-available/gutachtenruhr | head -5
else
    echo "   ⚠️  Nginx-Konfiguration nicht gefunden"
fi
echo ""

# 4. Teste ob Nginx auf 0.0.0.0 lauscht (nicht nur localhost)
echo "4️⃣ Prüfe ob Nginx auf 0.0.0.0 lauscht..."
echo ""
LISTEN_IP=$(sudo netstat -tuln 2>/dev/null | grep ":80 " | awk '{print $4}' || sudo ss -tuln 2>/dev/null | grep ":80 " | awk '{print $5}')
if echo "$LISTEN_IP" | grep -q "0.0.0.0:80"; then
    echo "   ✅ Nginx lauscht auf 0.0.0.0:80 (alle Interfaces)"
elif echo "$LISTEN_IP" | grep -q "127.0.0.1:80"; then
    echo "   ❌ Nginx lauscht nur auf 127.0.0.1:80 (nur localhost)!"
    echo "   Das ist das Problem! Nginx muss auf 0.0.0.0:80 lauschen."
else
    echo "   ⚠️  Unbekannter Listen-Status: $LISTEN_IP"
fi
echo ""

# 5. Prüfe ob es andere Firewall-Services gibt
echo "5️⃣ Prüfe andere Firewall-Services..."
echo ""
if systemctl list-units --type=service | grep -i firewall; then
    echo "   Gefundene Firewall-Services:"
    systemctl list-units --type=service | grep -i firewall
else
    echo "   Keine anderen Firewall-Services gefunden"
fi
echo ""

# 6. Prüfe Routing-Tabelle
echo "6️⃣ Prüfe Routing-Tabelle..."
echo ""
echo "   Standard-Route:"
ip route | grep default | head -3
echo ""

# 7. Prüfe Netzwerk-Interfaces
echo "7️⃣ Prüfe Netzwerk-Interfaces..."
echo ""
echo "   Aktive Interfaces:"
ip addr show | grep -E "^[0-9]+:|inet " | head -10
echo ""

# 8. Teste lokale Verbindung mit expliziter IP
echo "8️⃣ Teste lokale Verbindung mit Server-IP..."
echo ""
SERVER_IP=$(curl -4 -s ifconfig.me 2>/dev/null || curl -s ifconfig.me)
echo "   Server-IP: $SERVER_IP"
echo "   Teste http://$SERVER_IP..."
LOCAL_IP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP --max-time 5 2>/dev/null || echo "000")
if [ "$LOCAL_IP_TEST" = "200" ] || [ "$LOCAL_IP_TEST" = "301" ] || [ "$LOCAL_IP_TEST" = "302" ]; then
    echo "   ✅ Server antwortet über eigene IP (HTTP $LOCAL_IP_TEST)"
else
    echo "   ❌ Server antwortet NICHT über eigene IP (HTTP $LOCAL_IP_TEST)"
fi
echo ""

# 9. Prüfe ob Port 80 von außen erreichbar ist (mit nmap)
echo "9️⃣ Teste externe Erreichbarkeit von Port 80..."
echo ""
if command -v nmap &> /dev/null; then
    echo "   Scanne Port 80 von localhost..."
    nmap -p 80 localhost 2>/dev/null | grep -E "(80|open|closed|filtered)" || echo "   Kein Ergebnis"
else
    echo "   ⚠️  nmap nicht installiert"
    echo "   Installiere mit: sudo apt install nmap -y"
fi
echo ""

# 10. Prüfe Nginx-Error-Log für Verbindungsprobleme
echo "🔟 Prüfe Nginx-Logs für Verbindungsprobleme..."
echo ""
if [ -f "/var/log/nginx/error.log" ]; then
    echo "   Letzte Fehler in error.log:"
    sudo tail -20 /var/log/nginx/error.log | grep -iE "(bind|listen|permission|denied)" || echo "   Keine relevanten Fehler gefunden"
fi
echo ""

# Zusammenfassung
echo "📊 ZUSAMMENFASSUNG:"
echo "==================="
echo ""
echo "✅ UFW Firewall: Aktiv (Port 80 erlaubt)"
echo "✅ Strato VPS-Firewall: Inaktiv (sollte nichts blockieren)"
echo "✅ Nginx: Läuft"
echo ""
echo "❓ iptables: Prüfe oben"
echo "❓ Nginx listen-IP: Prüfe oben"
echo ""
echo "💡 NÄCHSTE SCHRITTE:"
echo ""
echo "1. Falls Nginx nur auf 127.0.0.1 lauscht:"
echo "   - Bearbeite /etc/nginx/sites-available/gutachtenruhr"
echo "   - Ändere 'listen 80;' zu 'listen 0.0.0.0:80;'"
echo "   - Oder stelle sicher, dass 'listen 80;' vorhanden ist (ohne IP = alle Interfaces)"
echo ""
echo "2. Falls iptables-Regeln Port 80 blockieren:"
echo "   sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT"
echo "   sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT"
echo "   sudo iptables-save | sudo tee /etc/iptables/rules.v4"
echo ""
echo "3. Teste erneut:"
echo "   curl -I http://82.165.219.105"
echo ""

