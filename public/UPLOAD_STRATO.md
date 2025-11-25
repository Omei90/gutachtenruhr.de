# 📤 Upload-Anleitung für Strato VPS

## Vorbereitung (lokal)

1. ✅ Stelle sicher, dass alle Dateien im `public`-Ordner sind
2. ✅ Erstelle `.env` Datei basierend auf `.env.example`
3. ✅ Ändere `SESSION_SECRET` zu einem sicheren Wert (mind. 32 Zeichen)
   - Tipp: Nutze einen Passwort-Generator oder: `openssl rand -base64 32`

## Schritt 1: Dateien hochladen

### Option A: FTP/SFTP (FileZilla empfohlen)

1. Öffne FileZilla
2. Verbinde mit:
   - **Host**: `ftp.strato.de` oder deine VPS-IP
   - **Port**: `22` (SFTP) oder `21` (FTP)
   - **Benutzername**: Dein Strato-Benutzername
   - **Passwort**: Dein Strato-Passwort
3. Navigiere zu `/var/www/gutachtenruhr` (oder erstelle den Ordner)
4. Lade alle Dateien hoch (außer `node_modules/`)

### Option B: SSH + SCP

```bash
scp -r * username@deine-vps-ip:/var/www/gutachtenruhr
```

## Schritt 2: SSH-Verbindung

```bash
ssh username@deine-vps-ip
```

## Schritt 3: Setup-Script ausführen

```bash
cd /var/www/gutachtenruhr
chmod +x setup-server.sh
sudo ./setup-server.sh
```

Das Script installiert automatisch:
- Node.js 18.x
- PM2 (Prozess-Manager)
- Nginx (Web-Server)
- Konfiguriert die Firewall

## Schritt 4: Dependencies installieren

```bash
cd /var/www/gutachtenruhr
npm install --production
```

## Schritt 5: Environment-Variablen konfigurieren

```bash
cp .env.example .env
nano .env
```

**WICHTIG**: Ändere mindestens:
- `SESSION_SECRET` zu einem sicheren, zufälligen Wert (mind. 32 Zeichen)
- `HOST` sollte `0.0.0.0` sein für externe Zugriffe

Speichere mit: `Ctrl+X`, dann `Y`, dann `Enter`

## Schritt 6: Datenbank initialisieren

```bash
node -e "require('./database/init-database')()"
```

## Schritt 7: Nginx konfigurieren

```bash
# Kopiere Nginx-Konfiguration
sudo cp nginx-gutachtenruhr.conf /etc/nginx/sites-available/gutachtenruhr

# Bearbeite die Domain (ersetze "deine-domain.de" mit deiner tatsächlichen Domain)
sudo nano /etc/nginx/sites-available/gutachtenruhr

# Aktiviere die Konfiguration
sudo ln -s /etc/nginx/sites-available/gutachtenruhr /etc/nginx/sites-enabled/

# Teste die Konfiguration
sudo nginx -t

# Starte Nginx neu
sudo systemctl restart nginx
```

## Schritt 8: PM2 starten

```bash
cd /var/www/gutachtenruhr

# Starte den Server mit PM2
pm2 start ecosystem.config.js

# PM2 beim Systemstart aktivieren
pm2 startup
pm2 save

# Status prüfen
pm2 status
pm2 logs gutachtenruhr
```

## Schritt 9: SSL-Zertifikat einrichten (Let's Encrypt)

```bash
# Certbot installieren
sudo apt-get install certbot python3-certbot-nginx

# SSL-Zertifikat erstellen (ersetze deine-domain.de)
sudo certbot --nginx -d deine-domain.de -d www.deine-domain.de

# Automatische Erneuerung testen
sudo certbot renew --dry-run
```

## Schritt 10: Berechtigungen setzen

```bash
# Stelle sicher, dass der Node.js-User Schreibrechte hat
sudo chown -R $USER:$USER /var/www/gutachtenruhr
sudo chmod -R 755 /var/www/gutachtenruhr

# Datenbank-Verzeichnis
sudo chmod -R 775 /var/www/gutachtenruhr/data
```

## Wichtige Befehle

### PM2 (Prozess-Management)
```bash
pm2 list                    # Alle Prozesse anzeigen
pm2 logs gutachtenruhr      # Logs anzeigen
pm2 restart gutachtenruhr   # Neustart
pm2 stop gutachtenruhr      # Stoppen
pm2 delete gutachtenruhr    # Löschen
pm2 monit                   # Monitoring
```

### Nginx
```bash
sudo systemctl status nginx     # Status prüfen
sudo systemctl restart nginx    # Neustart
sudo systemctl reload nginx     # Konfiguration neu laden
sudo nginx -t                   # Konfiguration testen
```

### Logs
```bash
# PM2 Logs
pm2 logs gutachtenruhr

# Nginx Logs
sudo tail -f /var/log/nginx/gutachtenruhr-access.log
sudo tail -f /var/log/nginx/gutachtenruhr-error.log

# System Logs
journalctl -u nginx -f
```

## Troubleshooting

### Problem: 502 Bad Gateway
**Lösung**: Prüfe ob Node.js läuft
```bash
pm2 status
pm2 logs gutachtenruhr
```

### Problem: Port 3000 nicht erreichbar
**Lösung**: Firewall prüfen
```bash
sudo ufw status
sudo ufw allow 3000/tcp
```

### Problem: Dateien nicht gefunden
**Lösung**: Pfade in `server.js` prüfen, Berechtigungen setzen
```bash
ls -la /var/www/gutachtenruhr
sudo chown -R $USER:$USER /var/www/gutachtenruhr
```

### Problem: Datenbank-Fehler
**Lösung**: Berechtigungen für `data/` prüfen
```bash
sudo chmod -R 775 /var/www/gutachtenruhr/data
```

### Problem: SSL-Zertifikat funktioniert nicht
**Lösung**: Certbot erneut ausführen
```bash
sudo certbot --nginx -d deine-domain.de --force-renewal
```

## Sicherheit

✅ **WICHTIG**: Ändere `SESSION_SECRET` in `.env` zu einem sicheren Wert!
✅ **WICHTIG**: Stelle sicher, dass `.env` nicht öffentlich zugänglich ist
✅ **WICHTIG**: Aktualisiere regelmäßig: `sudo apt-get update && sudo apt-get upgrade`
✅ **WICHTIG**: Nutze starke Passwörter für SSH und Admin-Zugang

## Performance-Optimierung

- PM2 läuft bereits mit optimierten Einstellungen
- Nginx serviert statische Dateien direkt (schneller)
- Template-Caching ist aktiviert (schnellere Antwortzeiten)

## Backup

```bash
# Datenbank-Backup
cp /var/www/gutachtenruhr/data/analytics.db /var/www/gutachtenruhr/data/analytics.db.backup

# Vollständiges Backup
tar -czf gutachtenruhr-backup-$(date +%Y%m%d).tar.gz /var/www/gutachtenruhr
```

## Support

Bei Problemen:
1. Prüfe die Logs: `pm2 logs gutachtenruhr`
2. Prüfe Nginx: `sudo nginx -t`
3. Prüfe System: `journalctl -xe`





