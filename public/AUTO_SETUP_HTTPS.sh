#!/bin/bash
# Automatisches HTTPS-Setup für GutachtenRuhr.de

echo "🔒 Automatisches HTTPS-Setup"
echo "============================"
echo ""

DOMAIN="gutachtenruhr.de"
WWW_DOMAIN="www.gutachtenruhr.de"
EXPECTED_IP="82.165.219.105"
EMAIL="info@kfzgutachter-heiken.de"

# Funktion: Prüfe DNS
check_dns() {
    echo "🔍 Prüfe DNS-Propagierung..."
    CURRENT_IP=$(dig +short $DOMAIN A | head -1)
    WWW_IP=$(dig +short $WWW_DOMAIN A | head -1)
    
    echo "   $DOMAIN zeigt auf: $CURRENT_IP"
    echo "   $WWW_DOMAIN zeigt auf: $WWW_IP"
    echo ""
    
    if [ "$CURRENT_IP" = "$EXPECTED_IP" ] && [ "$WWW_IP" = "$EXPECTED_IP" ]; then
        echo "✅ DNS ist korrekt!"
        return 0
    else
        echo "❌ DNS zeigt noch nicht auf Server-IP ($EXPECTED_IP)"
        echo "   Aktuell: $CURRENT_IP / $WWW_IP"
        return 1
    fi
}

# Prüfe DNS
if ! check_dns; then
    echo ""
    echo "⏳ DNS-Propagierung noch nicht abgeschlossen."
    echo ""
    echo "💡 Lösungen:"
    echo "   1. Warte noch 10-30 Minuten"
    echo "   2. Prüfe in Strato, ob die DNS-Änderungen gespeichert wurden"
    echo "   3. Führe dieses Script später erneut aus:"
    echo "      ./AUTO_SETUP_HTTPS.sh"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Starte HTTPS-Setup..."
echo ""

# 1. Prüfe ob Certbot installiert ist
if ! command -v certbot &> /dev/null; then
    echo "📦 Installiere Certbot..."
    sudo apt update
    sudo apt install certbot python3-certbot-nginx -y
fi

# 2. Stoppe Nginx (Certbot braucht Port 80)
echo "⏸️  Stoppe Nginx temporär..."
sudo systemctl stop nginx

# 3. Certbot im Standalone-Modus
echo "🔐 Fordere SSL-Zertifikat an..."
if sudo certbot certonly --standalone -d $WWW_DOMAIN -d $DOMAIN --email $EMAIL --agree-tos --non-interactive; then
    echo "✅ SSL-Zertifikat erfolgreich erstellt!"
else
    echo "❌ Fehler beim Erstellen des SSL-Zertifikats"
    sudo systemctl start nginx
    exit 1
fi

# 4. Starte Nginx wieder
echo "▶️  Starte Nginx wieder..."
sudo systemctl start nginx

# 5. Certbot konfiguriert Nginx für HTTPS
echo "🔧 Konfiguriere Nginx für HTTPS..."
if sudo certbot --nginx -d $WWW_DOMAIN -d $DOMAIN --non-interactive; then
    echo "✅ HTTPS erfolgreich konfiguriert!"
else
    echo "⚠️  Certbot konnte Nginx nicht automatisch konfigurieren"
    echo "   HTTPS-Zertifikat ist erstellt, aber Nginx muss manuell konfiguriert werden"
    echo "   Siehe: /etc/letsencrypt/live/$WWW_DOMAIN/"
fi

# 6. Teste HTTPS
echo ""
echo "🧪 Teste HTTPS..."
sleep 2
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$WWW_DOMAIN --max-time 5 || echo "000")

if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ]; then
    echo "✅ HTTPS funktioniert! (HTTP Status: $HTTPS_CODE)"
else
    echo "⚠️  HTTPS-Test fehlgeschlagen (HTTP Status: $HTTPS_CODE)"
    echo "   Bitte prüfe die Nginx-Konfiguration manuell"
fi

# 7. Zeige Zusammenfassung
echo ""
echo "✅ HTTPS-Setup abgeschlossen!"
echo "=============================="
echo ""
echo "🌐 Ihre Seite ist jetzt erreichbar über:"
echo "   ✅ https://$WWW_DOMAIN"
echo "   ✅ https://$DOMAIN"
echo ""
echo "📋 Zertifikat-Informationen:"
echo "   Pfad: /etc/letsencrypt/live/$WWW_DOMAIN/"
echo "   Gültig bis: $(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/$WWW_DOMAIN/cert.pem | cut -d= -f2)"
echo ""
echo "🔄 Automatische Erneuerung:"
echo "   Certbot erneuert Zertifikate automatisch"
echo "   Prüfe mit: sudo certbot renew --dry-run"
echo ""
echo "📊 Nginx-Status:"
sudo systemctl status nginx --no-pager | head -3
echo ""

