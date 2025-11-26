#!/bin/bash
# HTTPS Setup für GutachtenRuhr.de mit Certbot

echo "🔒 HTTPS Setup für GutachtenRuhr.de"
echo "======================================"
echo ""

# E-Mail-Adresse für Let's Encrypt Benachrichtigungen
EMAIL="info@gutachtenruhr.de"

# Domain
DOMAIN="www.gutachtenruhr.de"
DOMAIN_ALT="gutachtenruhr.de"

echo "📧 E-Mail-Adresse: $EMAIL"
echo "🌐 Domain: $DOMAIN"
echo ""

# Certbot installieren (falls nicht vorhanden)
if ! command -v certbot &> /dev/null; then
    echo "📦 Installiere Certbot..."
    sudo apt update
    sudo apt install certbot python3-certbot-nginx -y
fi

# SSL-Zertifikat anfordern
echo "🔐 Fordere SSL-Zertifikat an..."
echo "⚠️  WICHTIG: Certbot wird Sie nach der E-Mail-Adresse fragen."
echo "   Verwenden Sie: $EMAIL"
echo ""

sudo certbot --nginx -d $DOMAIN -d $DOMAIN_ALT --email $EMAIL --agree-tos --non-interactive

# Prüfe ob Zertifikat erfolgreich erstellt wurde
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo ""
    echo "✅ SSL-Zertifikat erfolgreich installiert!"
    echo "🌐 Ihre Seite ist jetzt über https://$DOMAIN erreichbar"
    echo ""
    echo "🔄 Starte Nginx neu..."
    sudo systemctl reload nginx
    echo "✅ Fertig!"
else
    echo ""
    echo "❌ Fehler beim Erstellen des SSL-Zertifikats"
    echo "   Bitte führen Sie manuell aus:"
    echo "   sudo certbot --nginx -d $DOMAIN -d $DOMAIN_ALT"
fi



