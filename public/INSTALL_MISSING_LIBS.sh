#!/bin/bash
# Installiere fehlende Bibliotheken für Puppeteer

echo "=========================================="
echo "  Installiere fehlende Bibliotheken"
echo "=========================================="
echo ""

echo "1. Installiere libatk-bridge-2.0..."
apt-get update -y
apt-get install -y libatk-bridge2.0-0

echo ""
echo "2. Prüfe ob libatk-bridge-2.0.so.0 vorhanden ist..."
if find /usr -name "libatk-bridge-2.0.so*" 2>/dev/null | grep -q .; then
    echo "   ✓ libatk-bridge-2.0.so gefunden"
    find /usr -name "libatk-bridge-2.0.so*" 2>/dev/null | head -1
else
    echo "   ⚠️ libatk-bridge-2.0.so nicht gefunden"
fi

echo ""
echo "3. Installiere alle weiteren möglicherweise fehlenden Bibliotheken..."
apt-get install -y \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libxshmfence1 \
    libxss1 \
    libgconf-2-4 \
    libx11-xcb1 \
    libxcb1 \
    libx11-6 \
    libxcursor1 \
    libxext6 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0

echo ""
echo "4. Aktualisiere Bibliotheken..."
ldconfig

echo ""
echo "=========================================="
echo "  Installation abgeschlossen!"
echo "=========================================="
echo ""
echo "Jetzt kannst du WhatsApp initialisieren:"
echo "cd /var/www/gutachtenruhr/public"
echo "node -e \"require('./whatsapp-service').initialize()\""
echo ""

