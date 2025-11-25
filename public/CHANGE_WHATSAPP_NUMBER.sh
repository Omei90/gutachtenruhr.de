#!/bin/bash
# Ändere WhatsApp-Nummer und initialisiere WhatsApp neu

echo "=========================================="
echo "  WhatsApp-Nummer ändern"
echo "=========================================="
echo ""

cd /var/www/gutachtenruhr/public

echo "1. Ändere ADMIN_PHONE_NUMBER in .env..."
# Formatiere Nummer: 015253038316 -> 4915253038316 (Deutschland)
if grep -q "ADMIN_PHONE_NUMBER" .env; then
    sed -i 's/^ADMIN_PHONE_NUMBER=.*/ADMIN_PHONE_NUMBER=4915253038316/' .env
    echo "   ✓ ADMIN_PHONE_NUMBER aktualisiert"
else
    echo "ADMIN_PHONE_NUMBER=4915253038316" >> .env
    echo "   ✓ ADMIN_PHONE_NUMBER hinzugefügt"
fi

echo "   Neue Nummer:"
cat .env | grep ADMIN_PHONE_NUMBER

echo ""
echo "2. Lösche alte WhatsApp-Session (für neuen QR-Code)..."
cd /var/www/gutachtenruhr/public
rm -rf whatsapp-session
echo "   ✓ Alte Session gelöscht"

echo ""
echo "3. PM2 neu starten..."
pm2 restart gutachtenruhr
echo "   ✓ PM2 neu gestartet"

echo ""
echo "=========================================="
echo "  WhatsApp-Nummer geändert!"
echo "=========================================="
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Initialisiere WhatsApp-Service (QR-Code wird angezeigt):"
echo "   cd /var/www/gutachtenruhr/public"
echo "   node -e \"require('./whatsapp-service').initialize()\""
echo ""
echo "2. Scanne den QR-Code mit WhatsApp:"
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

