#!/bin/bash
# Komplettes WhatsApp-Setup Script

echo "=== WhatsApp-Service Setup ==="
echo ""

# Schritt 1: ADMIN_PHONE_NUMBER in .env setzen
echo "1. Setze ADMIN_PHONE_NUMBER in .env..."
cd /var/www/gutachtenruhr/public

# Prüfe ob ADMIN_PHONE_NUMBER bereits existiert
if grep -q "ADMIN_PHONE_NUMBER" .env; then
    echo "   ADMIN_PHONE_NUMBER bereits vorhanden, aktualisiere..."
    sed -i 's/^ADMIN_PHONE_NUMBER=.*/ADMIN_PHONE_NUMBER=4916097089709/' .env
else
    echo "   Füge ADMIN_PHONE_NUMBER hinzu..."
    echo "ADMIN_PHONE_NUMBER=4916097089709" >> .env
fi

echo "   ✓ ADMIN_PHONE_NUMBER gesetzt"
echo ""

# Schritt 2: Aktualisiere server.js
echo "2. Lade aktualisierte server.js..."
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
echo "   ✓ server.js aktualisiert"
echo ""

# Schritt 3: Installiere fehlende Dependencies
echo "3. Installiere Dependencies..."
npm install qrcode-terminal --save
echo "   ✓ Dependencies installiert"
echo ""

# Schritt 4: PM2 neu starten
echo "4. Starte PM2 neu..."
pm2 restart gutachtenruhr
echo "   ✓ PM2 neu gestartet"
echo ""

# Schritt 5: Zeige Status
echo "5. PM2 Status:"
pm2 status
echo ""

echo "=== Setup abgeschlossen ==="
echo ""
echo "Nächste Schritte:"
echo "1. Initialisiere WhatsApp-Service:"
echo "   cd /var/www/gutachtenruhr"
echo "   node -e \"require('./whatsapp-service').initialize()\""
echo ""
echo "2. Scanne den QR-Code mit WhatsApp"
echo "3. Warte bis '✅ WhatsApp Client ist bereit!' erscheint"
echo "4. Drücke Ctrl+C"
echo ""
echo "5. PM2 neu starten:"
echo "   pm2 restart gutachtenruhr"
echo ""

