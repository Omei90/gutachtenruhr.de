#!/bin/bash
# Committed und pusht die gelöschten Dateien zu GitHub

echo "📤 Pushe gelöschte Dateien zu GitHub..."
echo ""

cd /var/www/gutachtenruhr/public

# Prüfe ob .git existiert
if [ ! -d ".git" ]; then
    echo "❌ Kein Git-Repository gefunden!"
    echo "   Bitte zuerst Git-Repository initialisieren oder klonen"
    exit 1
fi

# Prüfe ob git installiert ist
if ! command -v git &> /dev/null; then
    echo "❌ Git ist nicht installiert!"
    exit 1
fi

# Zeige Status
echo "📊 Git-Status:"
git status --short
echo ""

# Frage nach Bestätigung
read -p "Möchtest du die Änderungen committen und pushen? (j/n): " confirm
if [ "$confirm" != "j" ] && [ "$confirm" != "J" ] && [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Abgebrochen"
    exit 0
fi

# Füge alle gelöschten Dateien hinzu
echo "📝 Füge gelöschte Dateien hinzu..."
git add -A

# Zeige was geändert wurde
echo ""
echo "📋 Änderungen:"
git status --short
echo ""

# Commit
echo "💾 Erstelle Commit..."
git commit -m "🗑️ Entferne unnötige Test-, Fix- und Dokumentationsdateien

- Entfernt: Test-Skripte (TEST_*.sh, TEST_*.js)
- Entfernt: Diagnose-Skripte (DIAGNOSE_*.sh, FULL_*.sh)
- Entfernt: Check-Skripte (CHECK_*.sh)
- Entfernt: Fix-Skripte (FIX_*.sh, EMERGENCY_FIX.sh, etc.)
- Entfernt: Install-Skripte (INSTALL_*.sh)
- Entfernt: Veraltete Setup/Update-Skripte
- Entfernt: Redundante Dokumentationsdateien (SSH_*.md, etc.)
- Aufgeräumt: ~75+ unnötige Dateien entfernt"

if [ $? -ne 0 ]; then
    echo "⚠️  Keine Änderungen zum Committen"
else
    echo "✅ Commit erstellt"
    
    # Push zu GitHub
    echo ""
    echo "📤 Pushe zu GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Erfolgreich zu GitHub gepusht!"
    else
        echo ""
        echo "❌ Fehler beim Push zu GitHub"
        exit 1
    fi
fi

echo ""
echo "✅ Fertig!"

