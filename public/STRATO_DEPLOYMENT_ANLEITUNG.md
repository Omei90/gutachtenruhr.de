# 🚀 Deployment-Anleitung: gutachtenruhr.de auf Strato Linux-Server

## Übersicht
Diese Anleitung zeigt dir, wie du dein Projekt von GitHub auf deinen Strato Linux-Server hochlädst und mit der Domain **www.gutachtenruhr.de** verbindest.

---

## Voraussetzungen

- ✅ Strato Linux-Server mit SSH-Zugang
- ✅ Domain www.gutachtenruhr.de zeigt auf deine Server-IP
- ✅ Root- oder sudo-Zugriff auf dem Server
- ✅ GitHub Repository: https://github.com/Omei90/gutachtenruhr.de.git

---

## Schritt 1: SSH-Verbindung zum Server

Verbinde dich mit deinem Strato-Server:

```bash
ssh root@deine-server-ip
# oder
ssh dein-benutzername@deine-server-ip
```

---

## Schritt 2: Git installieren (falls nicht vorhanden)

```bash
# Prüfe ob Git installiert ist
git --version

# Falls nicht, installiere es:
sudo apt-get update
sudo apt-get install git -y
```

---

## Schritt 3: Projekt von GitHub klonen

```bash
# Erstelle Verzeichnis
sudo mkdir -p /var/www/gutachtenruhr
cd /var/www/gutachtenruhr

# Klone das Repository (öffentlich oder mit Token)
git clone https://github.com/Omei90/gutachtenruhr.de.git .

# Falls Repository privat ist, nutze:
# git clone https://DEIN-TOKEN@github.com/Omei90/gutachtenruhr.de.git .
```

**WICHTIG:** Wir klonen in den Hauptordner, aber die Website-Dateien sind im `public`-Unterordner!

---

## Schritt 4: In den public-Ordner wechseln

```bash
cd /var/www/gutachtenruhr/public
```

---

## Schritt 5: Setup-Script ausführen

```bash
# Setup-Script ausführbar machen
chmod +x setup-server.sh

# Setup ausführen (installiert Node.js, PM2, Nginx)
sudo ./setup-server.sh
```

Das Script installiert automatisch:
- Node.js 18.x
- PM2 (Process Manager)
- Nginx (Web-Server)
- Konfiguriert Firewall

---

## Schritt 6: Dependencies installieren

```bash
cd /var/www/gutachtenruhr/public

# Installiere alle Node.js-Pakete
npm install --production
```

---

## Schritt 7: .env Datei erstellen

```bash
# Kopiere Template
cp .env.example .env

# Bearbeite .env
nano .env
```

**WICHTIG - Ändere folgende Werte:**

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
SESSION_SECRET=DEIN-SICHERER-ZUFÄLLIGER-STRING-MINDESTENS-32-ZEICHEN
```

**SESSION_SECRET generieren:**
```bash
# Generiere einen sicheren Secret
openssl rand -hex 32
```

**Speichern:** `Ctrl+X`, dann `Y`, dann `Enter`

---

## Schritt 8: Datenbank initialisieren

```bash
cd /var/www/gutachtenruhr/public
node -e "require('./database/init-database')()"
```

---

## Schritt 9: Nginx-Konfiguration anpassen

```bash
cd /var/www/gutachtenruhr/public

# Kopiere Nginx-Konfiguration
sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr

# Bearbeite die Konfiguration
sudo nano /etc/nginx/sites-available/gutachtenruhr
```

**Ändere in der Datei:**
- Ersetze `deine-domain.de` mit `gutachtenruhr.de`
- Ersetze `www.deine-domain.de` mit `www.gutachtenruhr.de`
- Ändere `root /var/www/gutachtenruhr;` zu `root /var/www/gutachtenruhr/public;`

**Die Datei sollte so aussehen:**

```nginx
server {
    listen 80;
    server_name gutachtenruhr.de www.gutachtenruhr.de;

    # Logs
    access_log /var/log/nginx/gutachtenruhr-access.log;
    error_log /var/log/nginx/gutachtenruhr-error.log;

    # Max Upload Size
    client_max_body_size 10M;

    # Statische Dateien direkt servieren
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|json|xml|txt)$ {
        root /var/www/gutachtenruhr/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Alle anderen Requests an Node.js weiterleiten
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

**Speichern:** `Ctrl+X`, dann `Y`, dann `Enter`

---

## Schritt 10: Nginx-Konfiguration aktivieren

```bash
# Aktiviere die Konfiguration
sudo ln -s /etc/nginx/sites-available/gutachtenruhr /etc/nginx/sites-enabled/

# Entferne Standard-Konfiguration (falls vorhanden)
sudo rm -f /etc/nginx/sites-enabled/default

# Teste die Konfiguration
sudo nginx -t

# Falls Test erfolgreich, starte Nginx neu
sudo systemctl restart nginx
```

---

## Schritt 11: Berechtigungen setzen

```bash
cd /var/www/gutachtenruhr

# Setze Besitzer
sudo chown -R www-data:www-data /var/www/gutachtenruhr

# Setze Berechtigungen
sudo chmod -R 755 /var/www/gutachtenruhr
sudo chmod -R 775 /var/www/gutachtenruhr/public/data
sudo chmod -R 775 /var/www/gutachtenruhr/public/logs
```

---

## Schritt 12: PM2 starten

```bash
cd /var/www/gutachtenruhr/public

# Starte den Server
pm2 start ecosystem.config.js

# PM2 beim Systemstart aktivieren
pm2 startup
# Führe den angezeigten Befehl aus (z.B. sudo env PATH=...)

# Speichere PM2-Konfiguration
pm2 save

# Status prüfen
pm2 status
pm2 logs gutachtenruhr
```

---

## Schritt 13: SSL-Zertifikat einrichten (Let's Encrypt)

```bash
# Installiere Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# Erstelle SSL-Zertifikat
sudo certbot --nginx -d gutachtenruhr.de -d www.gutachtenruhr.de

# Folge den Anweisungen:
# - E-Mail-Adresse eingeben
# - AGB akzeptieren
# - Automatische Weiterleitung von HTTP zu HTTPS aktivieren (empfohlen)
```

Certbot aktualisiert automatisch die Nginx-Konfiguration für HTTPS!

---

## Schritt 14: Testen

```bash
# Prüfe ob Server läuft
curl http://localhost:3000/health

# Prüfe PM2
pm2 status

# Prüfe Nginx
sudo systemctl status nginx

# Prüfe Logs
pm2 logs gutachtenruhr
sudo tail -f /var/log/nginx/gutachtenruhr-error.log
```

**Im Browser testen:**
- http://www.gutachtenruhr.de (sollte zu HTTPS weiterleiten)
- https://www.gutachtenruhr.de
- https://www.gutachtenruhr.de/?stadt=essen

---

## Schritt 15: Firewall prüfen

```bash
# Prüfe Firewall-Status
sudo ufw status

# Falls nicht aktiviert:
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## ✅ Fertig!

Deine Website sollte jetzt unter **https://www.gutachtenruhr.de** erreichbar sein!

---

## Wichtige Befehle für später

### PM2 verwalten:
```bash
pm2 list                    # Prozesse anzeigen
pm2 logs gutachtenruhr      # Logs anzeigen
pm2 restart gutachtenruhr   # Neustart
pm2 stop gutachtenruhr      # Stoppen
pm2 reload gutachtenruhr    # Neuladen ohne Downtime
```

### Updates von GitHub:
```bash
cd /var/www/gutachtenruhr
git pull
cd public
npm install --production
pm2 restart gutachtenruhr
```

### Nginx verwalten:
```bash
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t                # Konfiguration testen
```

### Logs anzeigen:
```bash
pm2 logs gutachtenruhr
sudo tail -f /var/log/nginx/gutachtenruhr-access.log
sudo tail -f /var/log/nginx/gutachtenruhr-error.log
```

---

## Troubleshooting

### 502 Bad Gateway
```bash
# Prüfe ob Node.js läuft
pm2 status

# Prüfe Logs
pm2 logs gutachtenruhr

# Prüfe ob Port 3000 belegt ist
sudo netstat -tulpn | grep 3000
```

### Website nicht erreichbar
```bash
# Prüfe Nginx
sudo systemctl status nginx
sudo nginx -t

# Prüfe Firewall
sudo ufw status

# Prüfe DNS (von deinem PC)
nslookup www.gutachtenruhr.de
```

### SSL-Zertifikat erneuern
```bash
# Automatische Erneuerung testen
sudo certbot renew --dry-run

# Manuell erneuern
sudo certbot renew
```

---

## Sicherheit

- ✅ `.env` Datei ist nicht öffentlich zugänglich (durch .gitignore)
- ✅ `SESSION_SECRET` ist sicher und zufällig
- ✅ SSL-Zertifikat ist aktiv
- ✅ Firewall ist konfiguriert
- ✅ PM2 läuft als separater Benutzer

---

## Nächste Schritte

1. ✅ Website testen
2. ✅ Google Analytics einrichten (falls gewünscht)
3. ✅ Backup-Strategie einrichten
4. ✅ Monitoring einrichten (optional)

---

**Viel Erfolg! 🚀**

