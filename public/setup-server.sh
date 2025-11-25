#!/bin/bash

echo "🚀 GutachtenRuhr.de - Server Setup Script"
echo "=========================================="

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Prüfe ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root oder mit sudo ausführen${NC}"
    exit 1
fi

# 1. Node.js installieren
echo -e "${YELLOW}📦 Installiere Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js installiert: $(node --version)${NC}"
else
    echo -e "${GREEN}✅ Node.js bereits installiert: $(node --version)${NC}"
fi

# 2. PM2 installieren
echo -e "${YELLOW}📦 Installiere PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 installiert${NC}"
else
    echo -e "${GREEN}✅ PM2 bereits installiert${NC}"
fi

# 3. Nginx installieren
echo -e "${YELLOW}📦 Installiere Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx installiert${NC}"
else
    echo -e "${GREEN}✅ Nginx bereits installiert${NC}"
fi

# 4. Firewall konfigurieren
echo -e "${YELLOW}🔥 Konfiguriere Firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}✅ Firewall konfiguriert${NC}"

# 5. Logs-Verzeichnis erstellen
echo -e "${YELLOW}📁 Erstelle Logs-Verzeichnis...${NC}"
mkdir -p /var/www/gutachtenruhr/logs
chown -R www-data:www-data /var/www/gutachtenruhr/logs
echo -e "${GREEN}✅ Logs-Verzeichnis erstellt${NC}"

echo ""
echo -e "${GREEN}✅ Setup abgeschlossen!${NC}"
echo ""
echo "Nächste Schritte:"
echo "1. Lade deine Dateien nach /var/www/gutachtenruhr hoch"
echo "2. Führe 'npm install --production' aus"
echo "3. Erstelle .env Datei (siehe .env.example)"
echo "4. Kopiere nginx-gutachtenruhr.conf nach /etc/nginx/sites-available/"
echo "5. Aktiviere Nginx-Konfiguration: sudo ln -s /etc/nginx/sites-available/gutachtenruhr /etc/nginx/sites-enabled/"
echo "6. Starte PM2: pm2 start ecosystem.config.js"
echo "7. SSL einrichten: sudo certbot --nginx -d deine-domain.de"




