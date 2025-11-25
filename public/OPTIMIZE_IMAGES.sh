#!/bin/bash
# Bild-Performance-Optimierung auf dem Server

echo "🖼️  Bild-Performance-Optimierung"
echo "================================="
echo ""

# 1. Aktualisiere Nginx-Konfiguration
echo "📝 Aktualisiere Nginx-Konfiguration..."
cd /var/www/gutachtenruhr/public
curl -o nginx-gutachtenruhr.conf https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/nginx-gutachtenruhr.conf

# 2. Kopiere zur Nginx-Konfiguration
echo "📋 Kopiere Nginx-Konfiguration..."
sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr

# 3. Teste Nginx-Konfiguration
echo "🧪 Teste Nginx-Konfiguration..."
if sudo nginx -t; then
    echo "✅ Nginx-Konfiguration ist gültig"
    
    # 4. Lade Nginx neu
    echo "🔄 Lade Nginx neu..."
    sudo systemctl reload nginx
    echo "✅ Nginx neu geladen!"
else
    echo "❌ Nginx-Konfiguration hat Fehler!"
    echo "   Bitte prüfe die Konfiguration manuell"
    exit 1
fi

# 5. Prüfe Bildgrößen
echo ""
echo "📊 Bildgrößen prüfen:"
echo "   Hero-Bild (Auto2.JPG):"
ls -lh images/Auto2.JPG 2>/dev/null | awk '{print "   " $5}'
echo "   Meisterbrief.jpg:"
ls -lh images/Meisterbrief.jpg 2>/dev/null | awk '{print "   " $5}'
echo "   Unfallbilder:"
ls -lh images/accidents/*.JPG images/accidents/*.jpg 2>/dev/null | awk '{print "   " $5}' | head -5

echo ""
echo "💡 Tipps für weitere Optimierung:"
echo "   - Bilder sollten max. 500KB groß sein"
echo "   - Verwende WebP-Format für bessere Kompression"
echo "   - Komprimiere Bilder mit: jpegoptim oder optipng"
echo ""

echo "✅ Optimierung abgeschlossen!"

