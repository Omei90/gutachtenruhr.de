# 🖥️ Server-Setup Befehle (für Remote-Console)

## Schritt 1: Prüfe ob Dateien hochgeladen wurden

```bash
# Prüfe ob das Verzeichnis existiert
ls -la /var/www/gutachtenruhr

# Falls nicht vorhanden, erstelle es
sudo mkdir -p /var/www/gutachtenruhr
sudo chown -R $USER:$USER /var/www/gutachtenruhr
cd /var/www/gutachtenruhr
```

## Schritt 2: Falls Dateien noch nicht hochgeladen - Hole sie

**Option A: Dateien sind bereits hochgeladen**
- Weiter zu Schritt 3

**Option B: Dateien müssen noch hochgeladen werden**
- Nutze FileZilla oder das PowerShell-Script von deinem lokalen PC
- Oder nutze SCP von einem anderen Terminal

## Schritt 3: Setup-Script ausführen

```bash
cd /var/www/gutachtenruhr

# Prüfe ob Dateien vorhanden sind
ls -la

# Setup-Script ausführbar machen
chmod +x setup-server.sh

# Setup ausführen (installiert Node.js, PM2, Nginx)
sudo ./setup-server.sh
```

## Schritt 4: Dependencies installieren

```bash
cd /var/www/gutachtenruhr
npm install --production
```

## Schritt 5: .env Datei erstellen

```bash
# Kopiere Template
cp .env.example .env

# Bearbeite .env
nano .env
```

**WICHTIG in .env ändern:**
- `SESSION_SECRET` zu einem sicheren, zufälligen Wert (mind. 32 Zeichen)
- `HOST=0.0.0.0` (sollte bereits so sein)
- `NODE_ENV=production` (sollte bereits so sein)

**Speichern:** `Ctrl+X`, dann `Y`, dann `Enter`

## Schritt 6: Datenbank initialisieren

```bash
node -e "require('./database/init-database')()"
```

## Schritt 7: Berechtigungen setzen

```bash
# Setze Berechtigungen
chmod -R 755 /var/www/gutachtenruhr
chmod -R 775 /var/www/gutachtenruhr/data

# Erstelle logs-Verzeichnis
mkdir -p logs
chmod 755 logs
```

## Schritt 8: Nginx konfigurieren

```bash
# Kopiere Nginx-Konfiguration
sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr

# Bearbeite die Domain (ersetze "deine-domain.de" mit deiner Domain)
sudo nano /etc/nginx/sites-available/gutachtenruhr

# Aktiviere die Konfiguration
sudo ln -s /etc/nginx/sites-available/gutachtenruhr /etc/nginx/sites-enabled/

# Teste die Konfiguration
sudo nginx -t

# Starte Nginx neu
sudo systemctl restart nginx
```

## Schritt 9: PM2 starten

```bash
cd /var/www/gutachtenruhr

# Starte den Server
pm2 start ecosystem.config.js

# PM2 beim Systemstart aktivieren
pm2 startup
pm2 save

# Status prüfen
pm2 status
pm2 logs gutachtenruhr
```

## Schritt 10: Testen

```bash
# Prüfe ob Server läuft
curl http://localhost:3000/health

# Prüfe PM2
pm2 status

# Prüfe Nginx
sudo systemctl status nginx
```

## Wichtige Befehle für später:

```bash
# PM2
pm2 list                    # Prozesse anzeigen
pm2 logs gutachtenruhr      # Logs anzeigen
pm2 restart gutachtenruhr   # Neustart
pm2 stop gutachtenruhr      # Stoppen

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# Logs
pm2 logs gutachtenruhr
sudo tail -f /var/log/nginx/gutachtenruhr-error.log
```

## Troubleshooting:

**502 Bad Gateway:**
```bash
pm2 status
pm2 logs gutachtenruhr
```

**Port nicht erreichbar:**
```bash
sudo ufw status
sudo ufw allow 3000/tcp
```

**Dateien nicht gefunden:**
```bash
ls -la /var/www/gutachtenruhr
pwd
```




