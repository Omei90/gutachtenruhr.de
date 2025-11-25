#!/bin/bash
# Installiere System-Dependencies für Puppeteer/WhatsApp-Web.js

echo "=========================================="
echo "  Installiere Puppeteer Dependencies"
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
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libxshmfence1

echo ""
echo "3. Prüfe Installation..."
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

