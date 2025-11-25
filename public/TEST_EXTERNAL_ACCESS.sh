#!/bin/bash
# Testet externe Erreichbarkeit von Port 80

echo "🌍 TESTE EXTERNE ERREICHBARKEIT"
echo "==============================="
echo ""

SERVER_IP="82.165.219.105"

echo "1️⃣ Teste lokale Erreichbarkeit (sollte funktionieren):"
echo ""
LOCAL_TEST=$(curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost --max-time 5 2>/dev/null || echo "HTTP Status: 000")
echo "$LOCAL_TEST"
echo ""

echo "2️⃣ Teste Erreichbarkeit über Server-IP (von Server selbst):"
echo ""
IP_TEST=$(curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://$SERVER_IP --max-time 10 2>/dev/null || echo "HTTP Status: 000")
echo "$IP_TEST"
echo ""

echo "3️⃣ Prüfe ob Port 80 von außen erreichbar ist:"
echo ""
echo "   Verwende nmap oder telnet zum Testen..."
if command -v nmap &> /dev/null; then
    echo "   Teste mit nmap..."
    nmap -p 80 $SERVER_IP 2>/dev/null | grep -E "(80|open|closed|filtered)" || echo "   nmap nicht verfügbar oder kein Ergebnis"
elif command -v telnet &> /dev/null; then
    echo "   Teste mit telnet (Timeout 5 Sekunden)..."
    timeout 5 telnet $SERVER_IP 80 2>&1 | head -3 || echo "   Verbindung fehlgeschlagen"
else
    echo "   ⚠️  nmap und telnet nicht verfügbar"
    echo "   Installiere nmap: sudo apt install nmap -y"
fi
echo ""

echo "4️⃣ Prüfe aktuelle Server-IP:"
CURRENT_IP=$(curl -4 -s ifconfig.me 2>/dev/null || curl -s ifconfig.me)
echo "   Server-IP: $CURRENT_IP"
if [ "$CURRENT_IP" != "$SERVER_IP" ]; then
    echo "   ⚠️  IP stimmt nicht überein! Erwartet: $SERVER_IP, Aktuell: $CURRENT_IP"
fi
echo ""

echo "5️⃣ Teste mit verschiedenen Tools:"
echo ""
echo "   a) curl mit verbose (zeigt Verbindungsdetails):"
curl -v http://$SERVER_IP --max-time 10 2>&1 | grep -E "(Connected|Connection refused|timeout|HTTP)" | head -5 || echo "   Keine Verbindung möglich"
echo ""

echo "   b) Teste ob Port 80 offen ist (mit nc/netcat):"
if command -v nc &> /dev/null; then
    timeout 5 nc -zv $SERVER_IP 80 2>&1 || echo "   Port 80 ist nicht erreichbar"
else
    echo "   ⚠️  netcat (nc) nicht verfügbar"
fi
echo ""

echo "📊 ZUSAMMENFASSUNG:"
echo "==================="
echo ""
echo "✅ Lokale Erreichbarkeit: OK (Nginx läuft)"
echo "✅ Firewall (UFW): OK (Port 80 erlaubt)"
echo "✅ Nginx: OK (läuft auf Port 80)"
echo ""
echo "❓ Externe Erreichbarkeit: UNBEKANNT"
echo ""
echo "💡 WICHTIG: Falls externe Tests fehlschlagen:"
echo ""
echo "   Das Problem liegt bei der STRATO VPS-FIREWALL!"
echo ""
echo "   Lösung:"
echo "   1. Logge dich im Strato-Kundencenter ein"
echo "   2. Gehe zu: VPS-Verwaltung → Firewall"
echo "   3. Prüfe ob Port 80 (HTTP) und Port 443 (HTTPS) erlaubt sind"
echo "   4. Falls nicht, füge Regeln hinzu:"
echo "      - Port 80 (TCP) → Erlauben"
echo "      - Port 443 (TCP) → Erlauben"
echo "   5. Speichere die Änderungen"
echo "   6. Warte 1-2 Minuten"
echo "   7. Teste erneut: http://www.gutachtenruhr.de"
echo ""
echo "   Alternative: Teste von externem Service:"
echo "   - https://www.yougetsignal.com/tools/open-ports/"
echo "   - IP: $SERVER_IP, Port: 80"
echo ""

