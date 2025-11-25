#!/bin/bash
# Installiere ALLE Puppeteer Dependencies auf einmal
# Basierend auf: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

echo "=========================================="
echo "  Installiere ALLE Puppeteer Dependencies"
echo "=========================================="
echo ""

echo "1. Aktualisiere Paketliste..."
apt-get update -y

echo ""
echo "2. Installiere alle benötigten Bibliotheken..."
apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libasound2t64 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    libatspi2.0-0 \
    libxshmfence1 \
    libgconf-2-4 \
    libdrm2 \
    libxkbcommon0

echo ""
echo "3. Aktualisiere Bibliotheken..."
ldconfig

echo ""
echo "4. Prüfe wichtige Bibliotheken..."
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
echo "Jetzt PM2 neu starten:"
echo "pm2 restart gutachtenruhr"
echo "pm2 logs gutachtenruhr --lines 20"
echo ""

