#!/bin/bash
# Installiere fehlende Pakete

echo "=========================================="
echo "  Installiere fehlende Pakete"
echo "=========================================="
echo ""

echo "1. Installiere libasound2t64 (ersetzt libasound2)..."
apt-get install -y libasound2t64

echo ""
echo "2. Versuche libgconf-2-4 zu installieren..."
apt-get install -y libgconf-2-4 2>/dev/null || echo "   ⚠️ libgconf-2-4 nicht verfügbar (optional)"

echo ""
echo "3. Installiere libXcomposite1 falls noch nicht vorhanden..."
apt-get install -y libxcomposite1

echo ""
echo "4. Aktualisiere Bibliotheken..."
ldconfig

echo ""
echo "5. Prüfe wichtige Bibliotheken..."
echo "   libXcomposite.so.1:"
find /usr -name "libXcomposite.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"
echo "   libcups.so.2:"
find /usr -name "libcups.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"
echo "   libatk-1.0.so.0:"
find /usr -name "libatk-1.0.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"

echo ""
echo "=========================================="
echo "  Installation abgeschlossen!"
echo "=========================================="
echo ""

