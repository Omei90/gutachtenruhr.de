#!/bin/bash
# Einfaches Script zum Abgleichen mit GitHub (automatisch)

echo "🔄 Abgleichen mit GitHub..."
echo ""

cd /var/www/gutachtenruhr/public

# Prüfe ob .git existiert
if [ -d ".git" ]; then
    echo "✅ Git-Repository gefunden"
    
    # Stash lokale Änderungen (falls vorhanden)
    if [ -n "$(git status --porcelain)" ]; then
        echo "💾 Speichere lokale Änderungen..."
        git stash
    fi
    
    # Hole neueste Änderungen
    echo "📥 Lade neueste Änderungen..."
    git pull origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Aktualisierung erfolgreich!"
    else
        echo "❌ Fehler beim git pull"
        exit 1
    fi
else
    echo "⚠️  Kein Git-Repository gefunden"
    echo "   Verwende SYNC_FROM_GITHUB.sh für vollständige Synchronisation"
    exit 1
fi

echo ""
echo "🔄 Starte PM2 neu..."
pm2 restart gutachtenruhr

echo ""
echo "✅ Fertig!"
echo ""

