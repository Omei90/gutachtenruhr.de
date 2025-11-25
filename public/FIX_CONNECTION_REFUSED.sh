#!/bin/bash
# Behebt ERR_CONNECTION_REFUSED Problem

echo "🔧 BEHEBE ERR_CONNECTION_REFUSED"
echo "================================="
echo ""

# 1. Prüfe ob Nginx läuft
echo "1️⃣ Prüfe Nginx Status..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx läuft"
else
    echo "❌ Nginx läuft NICHT - starte jetzt..."
    sudo systemctl start nginx
    sleep 2
fi
echo ""

# 2. Prüfe ob Nginx auf Port 80 lauscht
echo "2️⃣ Prüfe ob Nginx auf Port 80 lauscht..."
if command -v netstat &> /dev/null; then
    PORT_80=$(sudo netstat -tuln 2>/dev/null | grep ":80 " || echo "")
else
    PORT_80=$(sudo ss -tuln 2>/dev/null | grep ":80 " || echo "")
fi

if [ -n "$PORT_80" ]; then
    echo "✅ Port 80 ist aktiv:"
    echo "$PORT_80"
else
    echo "❌ Port 80 ist NICHT aktiv!"
    echo "   Nginx lauscht nicht auf Port 80"
    echo "   Prüfe Nginx-Konfiguration..."
    sudo nginx -t
    echo ""
    echo "   Starte Nginx neu..."
    sudo systemctl restart nginx
    sleep 2
fi
echo ""

# 3. Prüfe Firewall
echo "3️⃣ Prüfe Firewall..."
UFW_STATUS=$(sudo ufw status | grep "Status" | awk '{print $2}')
if [ "$UFW_STATUS" = "active" ]; then
    echo "✅ Firewall ist aktiv"
    echo ""
    echo "   Aktuelle Regeln:"
    sudo ufw status numbered | grep -E "(80|443|22)" || echo "   Keine Regeln für Port 80/443 gefunden!"
    
    # Stelle sicher, dass Port 80/443 erlaubt sind
    echo ""
    echo "   Öffne Port 80/443..."
    sudo ufw allow 80/tcp 2>/dev/null
    sudo ufw allow 443/tcp 2>/dev/null
    sudo ufw reload 2>/dev/null
    echo "✅ Port 80/443 sind jetzt erlaubt"
else
    echo "⚠️  Firewall ist nicht aktiv"
    echo "   Aktiviere Firewall und öffne Ports..."
    sudo ufw --force enable
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw reload
    echo "✅ Firewall aktiviert und Ports geöffnet"
fi
echo ""

# 4. Prüfe Nginx-Konfiguration
echo "4️⃣ Prüfe Nginx-Konfiguration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx-Konfiguration ist gültig"
else
    echo "❌ Nginx-Konfiguration hat Fehler:"
    sudo nginx -t
    echo ""
    echo "   Versuche Konfiguration zu reparieren..."
    cd /var/www/gutachtenruhr/public
    curl -o nginx-gutachtenruhr.conf https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/nginx-gutachtenruhr.conf
    sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr
    sudo ln -sf /etc/nginx/sites-available/gutachtenruhr /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "✅ Nginx-Konfiguration repariert"
    fi
fi
echo ""

# 5. Prüfe ob Nginx wirklich auf Port 80 lauscht
echo "5️⃣ Prüfe Nginx-Prozesse..."
NGINX_PROCESSES=$(ps aux | grep nginx | grep -v grep | wc -l)
if [ "$NGINX_PROCESSES" -gt 0 ]; then
    echo "✅ Nginx-Prozesse laufen: $NGINX_PROCESSES"
    echo ""
    echo "   Nginx-Prozesse:"
    ps aux | grep nginx | grep -v grep | head -5
else
    echo "❌ Keine Nginx-Prozesse gefunden!"
    echo "   Starte Nginx..."
    sudo systemctl start nginx
    sleep 2
fi
echo ""

# 6. Teste lokale Erreichbarkeit
echo "6️⃣ Teste lokale Erreichbarkeit..."
LOCAL_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --max-time 5 2>/dev/null || echo "000")
if [ "$LOCAL_TEST" = "200" ] || [ "$LOCAL_TEST" = "301" ] || [ "$LOCAL_TEST" = "302" ]; then
    echo "✅ Nginx antwortet lokal (HTTP $LOCAL_TEST)"
else
    echo "❌ Nginx antwortet NICHT lokal (HTTP $LOCAL_TEST)"
    echo "   Prüfe Nginx-Logs:"
    sudo tail -20 /var/log/nginx/error.log
fi
echo ""

# 7. Prüfe ob andere Services Port 80 blockieren
echo "7️⃣ Prüfe ob andere Services Port 80 verwenden..."
if command -v netstat &> /dev/null; then
    PORT_80_USAGE=$(sudo netstat -tulpn 2>/dev/null | grep ":80 " || echo "")
else
    PORT_80_USAGE=$(sudo ss -tulpn 2>/dev/null | grep ":80 " || echo "")
fi

if [ -n "$PORT_80_USAGE" ]; then
    echo "   Port 80 wird verwendet von:"
    echo "$PORT_80_USAGE"
    
    # Prüfe ob es Nginx ist
    if echo "$PORT_80_USAGE" | grep -q "nginx"; then
        echo "✅ Port 80 wird von Nginx verwendet (korrekt)"
    else
        echo "⚠️  Port 80 wird von einem anderen Service verwendet!"
        echo "   Das könnte das Problem sein."
    fi
else
    echo "❌ Port 80 wird von KEINEM Service verwendet!"
    echo "   Nginx lauscht nicht auf Port 80!"
fi
echo ""

# 8. Prüfe Nginx-Error-Log für Verbindungsprobleme
echo "8️⃣ Prüfe Nginx-Error-Log..."
if [ -f "/var/log/nginx/error.log" ]; then
    echo "   Letzte Fehler:"
    sudo tail -10 /var/log/nginx/error.log | grep -i "error\|refused\|bind" || echo "   Keine relevanten Fehler gefunden"
fi
echo ""

# 9. Starte Nginx komplett neu
echo "9️⃣ Starte Nginx komplett neu..."
sudo systemctl stop nginx
sleep 1
sudo systemctl start nginx
sleep 2

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx läuft jetzt"
else
    echo "❌ Nginx startet nicht!"
    echo "   Prüfe System-Logs:"
    sudo journalctl -u nginx --no-pager -n 20
fi
echo ""

# 10. Finale Prüfung
echo "🔟 Finale Prüfung..."
echo ""
echo "   Nginx Status:"
sudo systemctl status nginx --no-pager | head -7
echo ""
echo "   Port 80 Status:"
if command -v netstat &> /dev/null; then
    sudo netstat -tuln | grep ":80 " || echo "   ❌ Port 80 nicht aktiv"
else
    sudo ss -tuln | grep ":80 " || echo "   ❌ Port 80 nicht aktiv"
fi
echo ""
echo "   Firewall Status:"
sudo ufw status | head -10
echo ""

echo "✅ REPARATUR ABGESCHLOSSEN!"
echo ""
echo "💡 WICHTIG: Falls die Seite immer noch nicht erreichbar ist:"
echo ""
echo "   1. Prüfe Strato VPS-Firewall-Einstellungen:"
echo "      - Logge dich im Strato-Kundencenter ein"
echo "      - Gehe zu VPS-Verwaltung"
echo "      - Prüfe Firewall-Einstellungen"
echo "      - Stelle sicher, dass Port 80 und 443 erlaubt sind"
echo ""
echo "   2. Prüfe ob Port 80 von außen erreichbar ist:"
echo "      curl -I http://82.165.219.105"
echo "      (Von einem anderen Server/PC aus)"
echo ""
echo "   3. Kontaktiere Strato-Support falls nötig"
echo ""

