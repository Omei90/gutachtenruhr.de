#!/bin/bash
# Prüft ob WebP-Dateien existieren und optimiert Bilder

echo "🔍 PRÜFE BILDER-OPTIMIERUNG"
echo "============================"
echo ""

cd /var/www/gutachtenruhr/public/images

echo "📊 Prüfe Hauptbilder:"
echo ""

# Prüfe Auto2
if [ -f "Auto2.webp" ]; then
    size_jpg=$(du -h "Auto2.JPG" 2>/dev/null | cut -f1)
    size_webp=$(du -h "Auto2.webp" 2>/dev/null | cut -f1)
    echo "✅ Auto2.webp existiert"
    echo "   JPG: $size_jpg"
    echo "   WebP: $size_webp"
else
    echo "❌ Auto2.webp fehlt!"
    echo "   Erstelle WebP-Version..."
    if command -v cwebp &> /dev/null; then
        cwebp -q 80 "Auto2.JPG" -o "Auto2.webp" 2>/dev/null && echo "   ✅ Erstellt!" || echo "   ❌ Fehler!"
    else
        echo "   ❌ cwebp nicht installiert!"
    fi
fi

echo ""

# Prüfe Meisterbrief
if [ -f "Meisterbrief.webp" ]; then
    size_jpg=$(du -h "Meisterbrief.jpg" 2>/dev/null | cut -f1)
    size_webp=$(du -h "Meisterbrief.webp" 2>/dev/null | cut -f1)
    echo "✅ Meisterbrief.webp existiert"
    echo "   JPG: $size_jpg"
    echo "   WebP: $size_webp"
else
    echo "❌ Meisterbrief.webp fehlt!"
    echo "   Erstelle WebP-Version..."
    if command -v cwebp &> /dev/null; then
        cwebp -q 80 "Meisterbrief.jpg" -o "Meisterbrief.webp" 2>/dev/null && echo "   ✅ Erstellt!" || echo "   ❌ Fehler!"
    else
        echo "   ❌ cwebp nicht installiert!"
    fi
fi

echo ""
echo "📊 Prüfe Unfallbilder:"
echo ""

cd accidents 2>/dev/null || { echo "❌ Verzeichnis 'accidents' nicht gefunden!"; exit 1; }

missing=0
for img in SAM_4377.JPG SAM_4370.JPG SAM_2292.JPG SAM_2808.JPG IMG-20250817-WA0012.jpg IMG-20250819-WA0017.jpg; do
    if [ -f "$img" ]; then
        webp_file="${img%.*}.webp"
        if [ -f "$webp_file" ]; then
            size_jpg=$(du -h "$img" 2>/dev/null | cut -f1)
            size_webp=$(du -h "$webp_file" 2>/dev/null | cut -f1)
            echo "✅ $webp_file existiert ($size_jpg → $size_webp)"
        else
            echo "❌ $webp_file fehlt!"
            if command -v cwebp &> /dev/null; then
                cwebp -q 80 "$img" -o "$webp_file" 2>/dev/null && echo "   ✅ Erstellt!" || echo "   ❌ Fehler!"
            else
                echo "   ❌ cwebp nicht installiert!"
                missing=$((missing + 1))
            fi
        fi
    else
        echo "⚠️  $img nicht gefunden"
    fi
done

echo ""
echo "📊 Gesamtübersicht:"
cd /var/www/gutachtenruhr/public/images
total_size=$(du -sh . 2>/dev/null | cut -f1)
echo "   Gesamtgröße: $total_size"

echo ""
if [ $missing -eq 0 ]; then
    echo "✅ Alle WebP-Dateien vorhanden!"
else
    echo "⚠️  $missing WebP-Dateien fehlen noch"
fi

echo ""
echo "💡 Tipp: Führe 'bash optimize-images-server.sh' aus für vollständige Optimierung"

