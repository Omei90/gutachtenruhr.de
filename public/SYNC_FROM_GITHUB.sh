#!/bin/bash
# Synchronisiert Server mit GitHub

echo "🔄 SYNCHRONISIERE MIT GITHUB"
echo "============================"
echo ""

cd /var/www/gutachtenruhr/public

# Prüfe ob .git existiert (Repository ist geklont)
if [ -d ".git" ]; then
    echo "✅ Git-Repository gefunden"
    echo ""
    
    # Prüfe ob git installiert ist
    if ! command -v git &> /dev/null; then
        echo "❌ Git ist nicht installiert!"
        echo "   Installiere Git..."
        sudo apt update
        sudo apt install git -y
    fi
    
    # Zeige aktuellen Status
    echo "📊 Aktueller Git-Status:"
    git status --short
    echo ""
    
    # Prüfe ob es lokale Änderungen gibt
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  Es gibt lokale Änderungen!"
        echo "   Möchtest du:"
        echo "   1) Lokale Änderungen behalten (stash)"
        echo "   2) Lokale Änderungen verwerfen (reset)"
        echo "   3) Abbrechen"
        echo ""
        read -p "   Wähle Option (1/2/3): " choice
        
        case $choice in
            1)
                echo "   💾 Speichere lokale Änderungen..."
                git stash
                ;;
            2)
                echo "   🗑️  Verwerfe lokale Änderungen..."
                git reset --hard HEAD
                ;;
            3)
                echo "   ❌ Abgebrochen"
                exit 1
                ;;
            *)
                echo "   ⚠️  Ungültige Eingabe, behalte lokale Änderungen (stash)"
                git stash
                ;;
        esac
    fi
    
    # Hole neueste Änderungen von GitHub
    echo ""
    echo "📥 Lade neueste Änderungen von GitHub..."
    git fetch origin main
    
    # Prüfe ob es Updates gibt
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo "   ✅ Bereits auf dem neuesten Stand!"
    else
        echo "   📥 Neue Änderungen verfügbar!"
        echo "   Lokal:  $LOCAL"
        echo "   Remote: $REMOTE"
        echo ""
        echo "   🔄 Führe git pull aus..."
        git pull origin main
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Git pull erfolgreich!"
        else
            echo "   ❌ Git pull fehlgeschlagen!"
            echo "   Versuche manuell: git pull origin main"
            exit 1
        fi
    fi
    
else
    echo "⚠️  Kein Git-Repository gefunden!"
    echo ""
    echo "   Optionen:"
    echo "   1) Repository klonen (empfohlen)"
    echo "   2) Dateien einzeln von GitHub laden (curl)"
    echo ""
    read -p "   Wähle Option (1/2): " choice
    
    case $choice in
        1)
            echo ""
            echo "   📥 Klone Repository..."
            
            # Prüfe ob git installiert ist
            if ! command -v git &> /dev/null; then
                echo "   Installiere Git..."
                sudo apt update
                sudo apt install git -y
            fi
            
            # Sichere aktuelle Dateien
            echo "   💾 Sichere aktuelle Dateien..."
            if [ -f "server.js" ]; then
                cp server.js server.js.backup
            fi
            
            # Klone Repository
            cd /var/www/gutachtenruhr
            if [ -d ".git" ]; then
                echo "   ✅ Repository bereits im Hauptverzeichnis vorhanden"
                cd public
                git pull origin main
            else
                echo "   📥 Klone Repository..."
                git clone https://github.com/Omei90/gutachtenruhr.de.git temp_repo
                if [ $? -eq 0 ]; then
                    cp -r temp_repo/public/* public/
                    rm -rf temp_repo
                    echo "   ✅ Dateien aktualisiert!"
                else
                    echo "   ❌ Repository konnte nicht geklont werden!"
                    exit 1
                fi
            fi
            ;;
        2)
            echo ""
            echo "   📥 Lade Dateien einzeln von GitHub..."
            curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
            curl -o template.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/template.html
            curl -o index.html https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/index.html
            curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json
            curl -o script.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/script.js
            curl -o styles.css https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/styles.css
            echo "   ✅ Dateien aktualisiert!"
            ;;
        *)
            echo "   ❌ Ungültige Eingabe"
            exit 1
            ;;
    esac
fi

echo ""
echo "🔄 Starte PM2 neu..."
pm2 restart gutachtenruhr

echo "⏳ Warte 3 Sekunden..."
sleep 3

echo "📊 Prüfe PM2-Status..."
pm2 status

echo ""
echo "✅ SYNCHRONISATION ABGESCHLOSSEN!"
echo ""
echo "💡 Nächste Schritte:"
echo "   - Prüfe Logs: pm2 logs gutachtenruhr --lines 20"
echo "   - Teste die Seite: http://www.gutachtenruhr.de"
echo "   - Leere Browser-Cache: Strg+Shift+R"
echo ""

