#!/bin/bash
# Optimiert Bilder auf dem Server - erstellt WebP und verkleinert Bilder

echo "🖼️  OPTIMIERE BILDER FÜR BESSERE PERFORMANCE"
echo "============================================="
echo ""

cd /var/www/gutachtenruhr/public/images

# Prüfe ob Tools installiert sind
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp nicht gefunden. Installiere webp..."
    sudo apt update
    sudo apt install webp -y
fi

if ! command -v mogrify &> /dev/null; then
    echo "❌ mogrify nicht gefunden. Installiere imagemagick..."
    sudo apt update
    sudo apt install imagemagick -y
fi

echo "📊 Aktuelle Bildgrößen:"
du -sh .

echo ""
echo "1️⃣ Erstelle WebP-Versionen..."
find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -exec sh -c 'cwebp "$1" -q 80 -o "${1%.*}.webp" 2>/dev/null && echo "✅ $(basename "$1") → $(basename "${1%.*}.webp")"' _ {} \;

echo ""
echo "2️⃣ Verkleinere große Bilder für Mobile (max 1920px Breite)..."
find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -exec sh -c '
    file="$1"
    width=$(identify -format "%w" "$file" 2>/dev/null)
    if [ -n "$width" ] && [ "$width" -gt 1920 ]; then
        echo "   Verkleinere $(basename "$file") von ${width}px auf 1920px..."
        mogrify -resize 1920x\> -quality 85 -strip "$file"
    fi
' _ {} \;

echo ""
echo "3️⃣ Erstelle zusätzliche Mobile-Versionen (800px für kleine Bildschirme)..."
mkdir -p mobile
find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) ! -path "./mobile/*" -exec sh -c '
    file="$1"
    filename=$(basename "$file")
    mobile_file="mobile/${filename%.*}_mobile.jpg"
    webp_mobile_file="mobile/${filename%.*}_mobile.webp"
    
    # Erstelle Mobile-Version (800px Breite)
    convert "$file" -resize 800x\> -quality 85 -strip "$mobile_file" 2>/dev/null
    if [ -f "$mobile_file" ]; then
        # Erstelle WebP-Version
        cwebp "$mobile_file" -q 80 -o "$webp_mobile_file" 2>/dev/null
        echo "   ✅ Mobile-Version erstellt: $(basename "$mobile_file")"
    fi
' _ {} \;

echo ""
echo "📊 Neue Bildgrößen:"
du -sh .
echo ""
du -sh mobile/ 2>/dev/null || echo "   Keine Mobile-Versionen erstellt"

echo ""
echo "✅ Optimierung abgeschlossen!"
echo ""
echo "📋 Zusammenfassung:"
echo "   - WebP-Versionen erstellt (30-50% kleiner)"
echo "   - Große Bilder auf max 1920px verkleinert"
echo "   - Mobile-Versionen (800px) erstellt"
echo ""
echo "💡 Nächste Schritte:"
echo "   - HTML verwendet automatisch WebP wenn Browser es unterstützt"
echo "   - JPG bleibt als Fallback für alte Browser"

