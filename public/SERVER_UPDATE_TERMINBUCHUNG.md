# 🔧 Server-Update: Terminbuchung-API hinzugefügt

## Problem gelöst ✅

Die Terminbuchung-API wurde zum laufenden Server hinzugefügt. Führe diese Befehle auf dem Server aus:

## Befehle auf dem Server ausführen

```bash
# Verbinde dich mit dem Server
ssh root@82.165.219.105
# Passwort: omei2000

# Wechsle zum Projekt
cd /var/www/gutachtenruhr/public

# Hole die neuesten Dateien vom Repository
git pull

# Installiere neue Dependencies (WhatsApp, etc.)
npm install

# PM2 neu starten
pm2 restart gutachtenruhr

# Prüfe Logs
pm2 logs gutachtenruhr --lines 20
```

## Was wurde geändert?

1. ✅ Terminbuchung-API (`/api/appointment`) zum Server hinzugefügt
2. ✅ Verfügbare Zeitslots API (`/api/available-slots`) hinzugefügt
3. ✅ WhatsApp-Service-Integration hinzugefügt
4. ✅ Dependencies aktualisiert (fs-extra, nodemailer, whatsapp-web.js)

## WhatsApp-Service einrichten (optional)

Falls du WhatsApp-Benachrichtigungen möchtest:

1. **WhatsApp-Service initialisieren:**
   ```bash
   cd /var/www/gutachtenruhr
   node -e "require('./whatsapp-service').initialize()"
   ```
   
   Ein QR-Code wird angezeigt - scanne ihn mit WhatsApp.

2. **.env Datei anpassen:**
   ```bash
   cd /var/www/gutachtenruhr/public
   nano .env
   ```
   
   Füge hinzu:
   ```
   ADMIN_PHONE_NUMBER=4916097089709
   ```

3. **PM2 neu starten:**
   ```bash
   pm2 restart gutachtenruhr
   ```

## Testen

Nach dem Update sollte die Terminbuchung funktionieren:

```bash
# Teste API
curl -X POST http://localhost:3000/api/appointment \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.de","phone":"01601234567","date":"2025-11-26","time":"10:00"}'
```

## Falls es nicht funktioniert

```bash
# Prüfe Logs
pm2 logs gutachtenruhr

# Prüfe ob API erreichbar ist
curl http://localhost:3000/api/appointment

# Prüfe ob data-Ordner existiert
ls -la /var/www/gutachtenruhr/public/data/
```

