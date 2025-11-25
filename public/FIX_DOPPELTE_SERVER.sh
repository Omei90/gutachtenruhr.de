#!/bin/bash
# Stoppe alle doppelten Server und starte nur einen

echo "=========================================="
echo "  Doppelte Server beheben"
echo "=========================================="
echo ""

echo "1. Zeige alle laufenden Prozesse..."
pm2 list

echo ""
echo "2. Stoppe ALLE gutachtenruhr Prozesse..."
pm2 stop all
pm2 delete all

echo ""
echo "3. Prüfe ob noch Prozesse laufen..."
pm2 list

echo ""
echo "4. Starte Server neu (nur EINEN)..."
cd /var/www/gutachtenruhr/public
pm2 start server.js --name gutachtenruhr --update-env

echo ""
echo "5. PM2 Status (sollte nur EINEN zeigen):"
pm2 status

echo ""
echo "6. Prüfe ob wirklich nur einer läuft..."
PROCESS_COUNT=$(pm2 list | grep -c "gutachtenruhr" || echo "0")
if [ "$PROCESS_COUNT" -eq "1" ]; then
    echo "   ✅ Nur ein Server läuft"
else
    echo "   ⚠️ Es laufen noch mehrere Server!"
    echo "   Prozess-Anzahl: $PROCESS_COUNT"
fi

echo ""
echo "7. Prüfe Port 3000..."
PORT_COUNT=$(sudo ss -tlnp | grep :3000 | wc -l)
if [ "$PORT_COUNT" -eq "1" ]; then
    echo "   ✅ Nur ein Prozess auf Port 3000"
else
    echo "   ⚠️ Mehrere Prozesse auf Port 3000!"
fi

echo ""
echo "8. PM2 beim Systemstart aktivieren..."
pm2 startup
echo "   Führe den angezeigten Befehl aus (wird oben angezeigt)"

echo ""
echo "9. Speichere PM2-Konfiguration..."
pm2 save

echo ""
echo "=========================================="
echo "  Fix abgeschlossen!"
echo "=========================================="
echo ""

