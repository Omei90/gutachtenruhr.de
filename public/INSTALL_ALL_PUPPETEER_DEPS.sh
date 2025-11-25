#!/bin/bash
# Installiere ALLE benötigten Bibliotheken für Puppeteer/WhatsApp-Web.js

echo "=========================================="
echo "  Installiere ALLE Puppeteer Dependencies"
echo "=========================================="
echo ""

echo "1. Aktualisiere Paketliste..."
apt-get update -y

echo ""
echo "2. Installiere alle benötigten Bibliotheken..."
apt-get install -y \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libcups2-dev \
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
    libgdk-pixbuf2.0-0 \
    libasound2t64 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils

echo ""
echo "3. Aktualisiere Bibliotheken..."
ldconfig

echo ""
echo "4. Prüfe wichtige Bibliotheken..."
echo "   libcups.so.2:"
find /usr -name "libcups.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"
echo "   libatk-1.0.so.0:"
find /usr -name "libatk-1.0.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"
echo "   libatk-bridge-2.0.so.0:"
find /usr -name "libatk-bridge-2.0.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"

echo ""
echo "=========================================="
echo "  Installation abgeschlossen!"
echo "=========================================="
echo ""
echo "Jetzt PM2 neu starten:"
echo "pm2 restart gutachtenruhr"
echo "pm2 logs gutachtenruhr --lines 20"
echo ""

