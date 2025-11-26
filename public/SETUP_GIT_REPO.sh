#!/bin/bash
# Richtet Git-Repository auf dem Server ein

echo "🔧 RICHTE GIT-REPOSITORY EIN"
echo "============================="
echo ""

cd /var/www/gutachtenruhr

# Prüfe ob git installiert ist
if ! command -v git &> /dev/null; then
    echo "📦 Installiere Git..."
    sudo apt update
    sudo apt install git -y
fi

# Prüfe ob bereits ein Repository existiert
if [ -d ".git" ]; then
    echo "✅ Git-Repository bereits vorhanden"
    echo ""
    echo "   Aktueller Status:"
    git status --short
    echo ""
    read -p "   Repository bereits vorhanden. Trotzdem neu klonen? (j/n): " choice
    if [ "$choice" != "j" ] && [ "$choice" != "J" ]; then
        echo "   Abgebrochen"
        exit 0
    fi
    echo ""
    echo "   💾 Sichere aktuelle Dateien..."
    if [ -d "public" ]; then
        cp -r public public.backup.$(date +%Y%m%d_%H%M%S)
    fi
    echo "   🗑️  Entferne altes Repository..."
    rm -rf .git
fi

# Prüfe ob public-Ordner existiert
if [ ! -d "public" ]; then
    echo "📁 Erstelle public-Ordner..."
    mkdir -p public
fi

# Sichere wichtige Dateien (falls vorhanden)
echo "💾 Sichere wichtige Dateien..."
if [ -f "public/.env" ]; then
    cp public/.env public/.env.backup
    echo "   ✅ .env gesichert"
fi

if [ -f "public/data/analytics.db" ]; then
    mkdir -p public/data.backup
    cp public/data/analytics.db public/data.backup/analytics.db.backup 2>/dev/null || true
    echo "   ✅ analytics.db gesichert"
fi

# Klone Repository
echo ""
echo "📥 Klone Repository von GitHub..."
echo "   Repository: https://github.com/Omei90/gutachtenruhr.de.git"
echo ""

# Option 1: Klone in temporäres Verzeichnis und kopiere Dateien
echo "   Methode: Klone in temporäres Verzeichnis..."
cd /tmp
rm -rf gutachtenruhr-temp
git clone https://github.com/Omei90/gutachtenruhr.de.git gutachtenruhr-temp

if [ $? -eq 0 ]; then
    echo "   ✅ Repository erfolgreich geklont"
    
    # Kopiere Dateien nach /var/www/gutachtenruhr
    echo ""
    echo "📁 Kopiere Dateien nach /var/www/gutachtenruhr..."
    cd /var/www/gutachtenruhr
    
    # Kopiere .git-Ordner
    cp -r /tmp/gutachtenruhr-temp/.git .
    
    # Kopiere alle Dateien (außer .env und data/)
    rsync -av --exclude='.env' --exclude='data/' --exclude='node_modules/' /tmp/gutachtenruhr-temp/public/ public/
    
    # Stelle gesicherte Dateien wieder her
    if [ -f "public/.env.backup" ]; then
        cp public/.env.backup public/.env
        echo "   ✅ .env wiederhergestellt"
    fi
    
    if [ -f "public/data.backup/analytics.db.backup" ]; then
        mkdir -p public/data
        cp public/data.backup/analytics.db.backup public/data/analytics.db 2>/dev/null || true
        echo "   ✅ analytics.db wiederhergestellt"
    fi
    
    # Räume auf
    rm -rf /tmp/gutachtenruhr-temp
    
    echo ""
    echo "✅ Repository erfolgreich eingerichtet!"
    
else
    echo "   ❌ Fehler beim Klonen des Repositories"
    echo ""
    echo "   Versuche alternative Methode: Klone direkt..."
    cd /var/www/gutachtenruhr
    
    # Sichere public-Ordner
    if [ -d "public" ]; then
        mv public public.old.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Klone direkt
    git clone https://github.com/Omei90/gutachtenruhr.de.git temp_repo
    
    if [ $? -eq 0 ]; then
        # Verschiebe public-Ordner
        mv temp_repo/public public
        
        # Stelle .env wieder her (falls vorhanden)
        if [ -f "public.old.*/.env" ]; then
            cp public.old.*/.env public/.env 2>/dev/null || true
        fi
        
        # Räume auf
        rm -rf temp_repo
        
        echo "   ✅ Alternative Methode erfolgreich!"
    else
        echo "   ❌ Beide Methoden fehlgeschlagen"
        exit 1
    fi
fi

# Prüfe Git-Status
echo ""
echo "📊 Git-Status:"
cd /var/www/gutachtenruhr
git status --short

echo ""
echo "🔄 Starte PM2 neu..."
cd public
pm2 restart gutachtenruhr

echo ""
echo "✅ SETUP ABGESCHLOSSEN!"
echo ""
echo "💡 Nächste Schritte:"
echo "   - Verwende GIT_PULL.sh für zukünftige Updates:"
echo "     cd /var/www/gutachtenruhr/public && ./GIT_PULL.sh"
echo "   - Oder manuell: git pull origin main"
echo ""



