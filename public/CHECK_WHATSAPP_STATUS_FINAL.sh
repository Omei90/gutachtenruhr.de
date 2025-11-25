#!/bin/bash
# Prüfe WhatsApp-Status nach Installation

echo "=========================================="
echo "  WhatsApp-Status prüfen"
echo "=========================================="
echo ""

echo "1. Prüfe PM2 Logs (letzte 30 Zeilen)..."
pm2 logs gutachtenruhr --lines 30 --nostream

echo ""
echo "2. Prüfe ob WhatsApp-Fehler vorhanden sind..."
if pm2 logs gutachtenruhr --lines 50 --nostream | grep -q "Fehler beim Initialisieren von WhatsApp"; then
    echo "   ⚠️ WhatsApp-Initialisierung fehlgeschlagen"
    echo "   Fehlermeldung:"
    pm2 logs gutachtenruhr --lines 50 --nostream | grep -A 5 "Fehler beim Initialisieren"
else
    echo "   ✓ Keine WhatsApp-Fehler gefunden"
fi

echo ""
echo "3. Prüfe ob WhatsApp bereit ist..."
if pm2 logs gutachtenruhr --lines 50 --nostream | grep -q "WhatsApp Client ist bereit"; then
    echo "   ✅ WhatsApp ist bereit!"
else
    echo "   ⚠️ WhatsApp noch nicht bereit"
fi

echo ""
echo "=========================================="
echo "  Prüfung abgeschlossen!"
echo "=========================================="
echo ""

