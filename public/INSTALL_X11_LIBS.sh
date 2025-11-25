#!/bin/bash
# Installiere alle X11-Bibliotheken für Puppeteer

echo "=========================================="
echo "  Installiere X11-Bibliotheken"
echo "=========================================="
echo ""

echo "1. Installiere alle X11-Bibliotheken..."
apt-get update -y
apt-get install -y \
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
    libxshmfence1

echo ""
echo "2. Aktualisiere Bibliotheken..."
ldconfig

echo ""
echo "3. Prüfe wichtige Bibliotheken..."
echo "   libXdamage.so.1:"
find /usr -name "libXdamage.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"
echo "   libXcomposite.so.1:"
find /usr -name "libXcomposite.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"
echo "   libXrender.so.1:"
find /usr -name "libXrender.so*" 2>/dev/null | head -1 || echo "   ⚠️ Nicht gefunden"

echo ""
echo "=========================================="
echo "  Installation abgeschlossen!"
echo "=========================================="
echo ""

