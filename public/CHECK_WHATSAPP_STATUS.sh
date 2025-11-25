#!/bin/bash
# Prüfe WhatsApp-Service Status

echo "=========================================="
echo "  WhatsApp-Service Status prüfen"
echo "=========================================="
echo ""

cd /var/www/gutachtenruhr/public

echo "1. Prüfe ob whatsapp-service.js existiert..."
if [ -f "whatsapp-service.js" ]; then
    echo "   ✓ whatsapp-service.js gefunden"
    ls -lh whatsapp-service.js
else
    echo "   ❌ whatsapp-service.js NICHT gefunden!"
    echo "   Lade von GitHub..."
    curl -o whatsapp-service.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/whatsapp-service.js
fi

echo ""
echo "2. Prüfe ob whatsapp-web.js installiert ist..."
if [ -d "node_modules/whatsapp-web.js" ]; then
    echo "   ✓ whatsapp-web.js installiert"
else
    echo "   ❌ whatsapp-web.js NICHT installiert!"
    echo "   Installiere..."
    npm install whatsapp-web.js --save
fi

echo ""
echo "3. Prüfe ob qrcode-terminal installiert ist..."
if [ -d "node_modules/qrcode-terminal" ]; then
    echo "   ✓ qrcode-terminal installiert"
else
    echo "   ❌ qrcode-terminal NICHT installiert!"
    echo "   Installiere..."
    npm install qrcode-terminal --save
fi

echo ""
echo "4. Prüfe .env für ADMIN_PHONE_NUMBER..."
if grep -q "ADMIN_PHONE_NUMBER" .env; then
    echo "   ✓ ADMIN_PHONE_NUMBER gesetzt:"
    grep ADMIN_PHONE_NUMBER .env
else
    echo "   ❌ ADMIN_PHONE_NUMBER NICHT gesetzt!"
    echo "   Setze ADMIN_PHONE_NUMBER..."
    echo "ADMIN_PHONE_NUMBER=4916097089709" >> .env
fi

echo ""
echo "5. Teste ob whatsapp-service.js geladen werden kann..."
node -e "try { const ws = require('./whatsapp-service'); console.log('✓ whatsapp-service.js kann geladen werden'); } catch(e) { console.log('❌ Fehler:', e.message); }"

echo ""
echo "=========================================="
echo "  Prüfung abgeschlossen!"
echo "=========================================="
echo ""

