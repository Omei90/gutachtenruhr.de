#!/bin/bash
# Komplettes WhatsApp-Fix Script

echo "=========================================="
echo "  WhatsApp-Service komplett einrichten"
echo "=========================================="
echo ""

# Schritt 1: ADMIN_PHONE_NUMBER in .env setzen
echo "1. Setze ADMIN_PHONE_NUMBER..."
cd /var/www/gutachtenruhr/public

if grep -q "ADMIN_PHONE_NUMBER" .env; then
    echo "   ✓ ADMIN_PHONE_NUMBER bereits vorhanden, aktualisiere..."
    sed -i 's/^ADMIN_PHONE_NUMBER=.*/ADMIN_PHONE_NUMBER=4916097089709/' .env
else
    echo "   ✓ Füge ADMIN_PHONE_NUMBER hinzu..."
    echo "ADMIN_PHONE_NUMBER=4916097089709" >> .env
fi

echo "   ✓ ADMIN_PHONE_NUMBER gesetzt:"
cat .env | grep ADMIN_PHONE_NUMBER
echo ""

# Schritt 2: whatsapp-service.js herunterladen
echo "2. Lade whatsapp-service.js..."
curl -o whatsapp-service.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/whatsapp-service.js
echo "   ✓ whatsapp-service.js heruntergeladen"
echo ""

# Schritt 3: Aktualisiere server.js
echo "3. Lade aktualisierte server.js..."
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
echo "   ✓ server.js aktualisiert"
echo ""

# Schritt 4: Installiere Dependencies
echo "4. Installiere Dependencies..."
npm install whatsapp-web.js qrcode-terminal --save
echo "   ✓ Dependencies installiert"
echo ""

# Schritt 5: PM2 neu starten
echo "5. Starte PM2 neu..."
pm2 restart gutachtenruhr
echo "   ✓ PM2 neu gestartet"
echo ""

# Schritt 6: Zeige Status
echo "6. PM2 Status:"
pm2 status
echo ""

# Schritt 7: Prüfe Logs
echo "7. Letzte Logs:"
pm2 logs gutachtenruhr --lines 5 --nostream
echo ""

echo "=========================================="
echo "  Setup abgeschlossen!"
echo "=========================================="
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Initialisiere WhatsApp-Service:"
echo "   cd /var/www/gutachtenruhr/public"
echo "   node -e \"require('./whatsapp-service').initialize()\""
echo ""
echo "2. Ein QR-Code wird angezeigt!"
echo "   - Öffne WhatsApp auf deinem Handy"
echo "   - Gehe zu: Einstellungen > Verknüpfte Geräte > Gerät verknüpfen"
echo "   - Scanne den QR-Code"
echo "   - Warte bis '✅ WhatsApp Client ist bereit!' erscheint"
echo "   - Drücke Ctrl+C"
echo ""
echo "3. PM2 final neu starten:"
echo "   pm2 restart gutachtenruhr"
echo ""
echo "Fertig! ✅"
echo ""

