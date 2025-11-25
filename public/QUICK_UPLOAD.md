# 🚀 Schnell-Upload zu Strato VPS

## Deine Server-Daten:
- **IP**: `82.165.219.105`
- **Benutzer**: `root`
- **Ziel-Pfad**: `/var/www/gutachtenruhr`

## Option 1: PowerShell-Script (Windows)

1. Öffne PowerShell im `public`-Ordner
2. Führe aus:
   ```powershell
   .\upload-to-strato.ps1
   ```
3. Gib dein Root-Passwort ein, wenn danach gefragt wird

## Option 2: FileZilla (Empfohlen - Grafisch)

1. Öffne FileZilla
2. Verbinde mit:
   - **Host**: `82.165.219.105`
   - **Benutzername**: `root`
   - **Passwort**: Dein Root-Passwort
   - **Port**: `22` (SFTP)
3. Navigiere zu `/var/www/gutachtenruhr` (oder erstelle den Ordner)
4. Lade alle Dateien hoch (außer `node_modules/`, `.env`, `data/analytics.db`)

## Option 3: SCP (Command Line)

```bash
# Alle Dateien hochladen (aus dem public-Ordner)
scp -r * root@82.165.219.105:/var/www/gutachtenruhr
```

## Nach dem Upload - SSH-Befehle:

```bash
# 1. Verbinde dich mit dem Server
ssh root@82.165.219.105

# 2. Gehe ins Projekt-Verzeichnis
cd /var/www/gutachtenruhr

# 3. Setup-Script ausführen (installiert Node.js, PM2, Nginx)
chmod +x setup-server.sh
sudo ./setup-server.sh

# 4. Dependencies installieren
npm install --production

# 5. .env Datei erstellen
cp .env.example .env
nano .env
# Ändere SESSION_SECRET zu einem sicheren Wert!
# Speichere mit: Ctrl+X, dann Y, dann Enter

# 6. Datenbank initialisieren
node -e "require('./database/init-database')()"

# 7. Berechtigungen setzen
chmod -R 755 .
chmod -R 775 data/

# 8. Nginx konfigurieren
sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr
# Bearbeite die Domain in der Datei:
sudo nano /etc/nginx/sites-available/gutachtenruhr
# Ersetze "deine-domain.de" mit deiner tatsächlichen Domain

# 9. Nginx aktivieren
sudo ln -s /etc/nginx/sites-available/gutachtenruhr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. PM2 starten
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# 11. Status prüfen
pm2 status
pm2 logs gutachtenruhr
```

## SSL-Zertifikat einrichten (später):

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d deine-domain.de -d www.deine-domain.de
```

## Wichtige Befehle:

```bash
# PM2
pm2 list              # Prozesse anzeigen
pm2 logs gutachtenruhr # Logs anzeigen
pm2 restart gutachtenruhr # Neustart

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# Logs
pm2 logs gutachtenruhr
sudo tail -f /var/log/nginx/gutachtenruhr-error.log
```

## Troubleshooting:

**502 Bad Gateway**: 
- Prüfe ob PM2 läuft: `pm2 status`
- Prüfe Logs: `pm2 logs gutachtenruhr`

**Dateien nicht gefunden**:
- Prüfe Pfade: `ls -la /var/www/gutachtenruhr`
- Setze Berechtigungen: `chmod -R 755 /var/www/gutachtenruhr`

**Port nicht erreichbar**:
- Firewall prüfen: `sudo ufw status`
- Port öffnen: `sudo ufw allow 3000/tcp`




