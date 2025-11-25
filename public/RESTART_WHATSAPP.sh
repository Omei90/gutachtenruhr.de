#!/bin/bash
# WhatsApp-Server neu starten

echo "🔄 WhatsApp-Server neu starten"
echo "==============================="
echo ""

# 1. PM2 neu starten (startet WhatsApp-Service neu)
echo "🔄 Starte PM2 neu..."
pm2 restart gutachtenruhr

# 2. Warte kurz
sleep 3

# 3. Prüfe PM2-Status
echo ""
echo "📊 PM2-Status:"
pm2 status

# 4. Zeige WhatsApp-Logs
echo ""
echo "📋 WhatsApp-Logs (letzte 20 Zeilen):"
pm2 logs gutachtenruhr --lines 20 --nostream | grep -i "whatsapp\|qr\|connected\|ready" || echo "Keine WhatsApp-Logs gefunden"

echo ""
echo "✅ PM2 neu gestartet!"
echo ""
echo "💡 Tipps:"
echo "   - Prüfe WhatsApp-Status mit: pm2 logs gutachtenruhr --lines 50"
echo "   - Falls QR-Code benötigt wird, prüfe die Logs nach 'QR Code'"
echo "   - WhatsApp-Session löschen: rm -rf .wwebjs_auth"
echo ""

