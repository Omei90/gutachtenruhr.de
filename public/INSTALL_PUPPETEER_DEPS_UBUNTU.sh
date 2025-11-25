#!/bin/bash
# Installiere System-Dependencies für Puppeteer/WhatsApp-Web.js auf Ubuntu

echo "=========================================="
echo "  Installiere Puppeteer Dependencies (Ubuntu)"
echo "=========================================="
echo ""

echo "1. Aktualisiere Paketliste..."
apt-get update

echo ""
echo "2. Installiere benötigte Bibliotheken..."
apt-get install -y \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
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
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0

echo ""
echo "3. Prüfe Installation..."
ldconfig

echo ""
echo "4. Prüfe ob libatk-1.0.so.0 vorhanden ist..."
find /usr -name "libatk-1.0.so*" 2>/dev/null || echo "⚠️ libatk-1.0.so nicht gefunden"

echo ""
echo "=========================================="
echo "  Installation abgeschlossen!"
echo "=========================================="
echo ""
echo "Jetzt kannst du WhatsApp initialisieren:"
echo "cd /var/www/gutachtenruhr/public"
echo "node -e \"require('./whatsapp-service').initialize()\""
echo ""

