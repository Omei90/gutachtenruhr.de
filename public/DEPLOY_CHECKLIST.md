# ✅ Deployment-Checkliste für Strato VPS

## Vor dem Upload

- [ ] Alle Dateien im `public`-Ordner sind vorhanden
- [ ] `.env.example` wurde zu `.env` kopiert
- [ ] `SESSION_SECRET` in `.env` wurde zu einem sicheren Wert geändert (mind. 32 Zeichen)
- [ ] `HOST` in `.env` ist auf `0.0.0.0` gesetzt
- [ ] `NODE_ENV` ist auf `production` gesetzt

## Auf dem Server

- [ ] Alle Dateien wurden hochgeladen (außer `node_modules/`)
- [ ] `setup-server.sh` wurde ausgeführt
- [ ] `npm install --production` wurde ausgeführt
- [ ] `.env` Datei wurde erstellt und konfiguriert
- [ ] Datenbank wurde initialisiert: `node -e "require('./database/init-database')()"`
- [ ] Nginx-Konfiguration wurde kopiert und angepasst
- [ ] Nginx-Konfiguration wurde aktiviert
- [ ] PM2 wurde gestartet: `pm2 start ecosystem.config.js`
- [ ] PM2 wurde für Auto-Start konfiguriert: `pm2 startup && pm2 save`
- [ ] SSL-Zertifikat wurde eingerichtet (Let's Encrypt)
- [ ] Firewall wurde konfiguriert
- [ ] Berechtigungen wurden gesetzt

## Nach dem Upload

- [ ] Website ist erreichbar: `https://deine-domain.de`
- [ ] Stadt-spezifische URLs funktionieren: `https://deine-domain.de/?stadt=essen`
- [ ] Health-Check funktioniert: `https://deine-domain.de/health`
- [ ] PM2 läuft: `pm2 status`
- [ ] Nginx läuft: `sudo systemctl status nginx`
- [ ] Logs werden geschrieben: `pm2 logs gutachtenruhr`

## Sicherheit

- [ ] `.env` Datei ist nicht öffentlich zugänglich
- [ ] `SESSION_SECRET` ist sicher und zufällig
- [ ] SSH-Zugang ist gesichert (Key-basiert empfohlen)
- [ ] Firewall ist aktiviert
- [ ] SSL-Zertifikat ist aktiv und erneuert sich automatisch

## Performance

- [ ] PM2 läuft stabil
- [ ] Nginx serviert statische Dateien direkt
- [ ] Template-Caching ist aktiv
- [ ] Keine Fehler in den Logs





