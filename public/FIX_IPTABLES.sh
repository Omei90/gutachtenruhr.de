#!/bin/bash
# Setzt iptables-Regeln für Port 80/443

echo "🔧 KONFIGURIERE IPTABLES"
echo "========================"
echo ""

# 1. Prüfe aktuelle iptables-Regeln
echo "1️⃣ Aktuelle iptables-Regeln (INPUT):"
sudo iptables -L INPUT -n -v --line-numbers | head -20
echo ""

# 2. Füge Regeln für Port 80/443 hinzu (falls nicht vorhanden)
echo "2️⃣ Füge iptables-Regeln hinzu..."
echo ""

# Prüfe ob Regel für Port 80 bereits existiert
if sudo iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null; then
    echo "   ✅ Regel für Port 80 existiert bereits"
else
    echo "   ➕ Füge Regel für Port 80 hinzu..."
    sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
    echo "   ✅ Regel für Port 80 hinzugefügt"
fi

# Prüfe ob Regel für Port 443 bereits existiert
if sudo iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null; then
    echo "   ✅ Regel für Port 443 existiert bereits"
else
    echo "   ➕ Füge Regel für Port 443 hinzu..."
    sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
    echo "   ✅ Regel für Port 443 hinzugefügt"
fi
echo ""

# 3. Zeige neue Regeln
echo "3️⃣ Neue iptables-Regeln (INPUT):"
sudo iptables -L INPUT -n -v --line-numbers | head -20
echo ""

# 4. Speichere iptables-Regeln (falls iptables-persistent installiert ist)
echo "4️⃣ Speichere iptables-Regeln..."
if command -v iptables-save &> /dev/null; then
    # Versuche Regeln zu speichern
    if [ -d "/etc/iptables" ]; then
        sudo iptables-save | sudo tee /etc/iptables/rules.v4 > /dev/null
        echo "   ✅ Regeln gespeichert in /etc/iptables/rules.v4"
    elif command -v netfilter-persistent &> /dev/null; then
        sudo netfilter-persistent save 2>/dev/null && echo "   ✅ Regeln gespeichert mit netfilter-persistent" || echo "   ⚠️  Konnte Regeln nicht speichern (netfilter-persistent)"
    else
        echo "   ⚠️  iptables-persistent nicht installiert"
        echo "   Installiere mit: sudo apt install iptables-persistent -y"
        echo "   Dann speichere Regeln mit: sudo netfilter-persistent save"
    fi
else
    echo "   ⚠️  iptables-save nicht verfügbar"
fi
echo ""

# 5. Teste ob Port 80 jetzt erreichbar ist
echo "5️⃣ Teste Erreichbarkeit..."
LOCAL_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --max-time 5 2>/dev/null || echo "000")
if [ "$LOCAL_TEST" = "200" ] || [ "$LOCAL_TEST" = "301" ] || [ "$LOCAL_TEST" = "302" ]; then
    echo "   ✅ Lokale Erreichbarkeit: OK (HTTP $LOCAL_TEST)"
else
    echo "   ❌ Lokale Erreichbarkeit: FEHLER (HTTP $LOCAL_TEST)"
fi
echo ""

# 6. Prüfe Nginx listen-Konfiguration
echo "6️⃣ Prüfe Nginx listen-Konfiguration..."
if [ -f "/etc/nginx/sites-available/gutachtenruhr" ]; then
    LISTEN_CONFIG=$(grep -i "listen" /etc/nginx/sites-available/gutachtenruhr | head -1)
    echo "   Aktuelle listen-Direktive: $LISTEN_CONFIG"
    
    if echo "$LISTEN_CONFIG" | grep -q "listen 80"; then
        if echo "$LISTEN_CONFIG" | grep -q "127.0.0.1"; then
            echo "   ❌ Nginx lauscht nur auf 127.0.0.1!"
            echo "   ➕ Ändere zu 'listen 0.0.0.0:80;' oder 'listen 80;'"
            echo ""
            echo "   Bearbeite /etc/nginx/sites-available/gutachtenruhr:"
            echo "   Ändere 'listen 127.0.0.1:80;' zu 'listen 80;'"
            echo ""
            echo "   Dann: sudo nginx -t && sudo systemctl reload nginx"
        else
            echo "   ✅ Nginx lauscht auf allen Interfaces (korrekt)"
        fi
    else
        echo "   ⚠️  Keine listen-Direktive gefunden"
    fi
else
    echo "   ⚠️  Nginx-Konfiguration nicht gefunden"
fi
echo ""

echo "✅ IPTABLES-KONFIGURATION ABGESCHLOSSEN!"
echo ""
echo "💡 NÄCHSTE SCHRITTE:"
echo ""
echo "1. Teste die Seite:"
echo "   curl -I http://82.165.219.105"
echo "   (Von deinem PC aus)"
echo ""
echo "2. Falls es immer noch nicht funktioniert:"
echo "   - Prüfe ob Nginx auf 0.0.0.0:80 lauscht (nicht nur 127.0.0.1)"
echo "   - Führe CHECK_IPTABLES.sh aus für detaillierte Diagnose"
echo "   - Prüfe Strato VPS-Netzwerk-Einstellungen"
echo ""

