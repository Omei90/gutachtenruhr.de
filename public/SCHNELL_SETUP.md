# 🚀 Schnell-Setup: WhatsApp-Service

## Einfach diese Befehle auf dem Server ausführen:

```bash
# Verbinde dich mit dem Server
ssh root@82.165.219.105
# Passwort: omei2000

# Führe das Setup-Script aus (lädt alles automatisch)
cd /var/www/gutachtenruhr/public
bash <(curl -s https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/COMPLETE_WHATSAPP_SETUP.sh)
```

## Oder manuell (falls Script nicht funktioniert):

```bash
cd /var/www/gutachtenruhr/public

# 1. ADMIN_PHONE_NUMBER setzen
if grep -q "ADMIN_PHONE_NUMBER" .env; then
    sed -i 's/^ADMIN_PHONE_NUMBER=.*/ADMIN_PHONE_NUMBER=4916097089709/' .env
else
    echo "ADMIN_PHONE_NUMBER=4916097089709" >> .env
fi

# 2. Server aktualisieren
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js

# 3. Dependencies installieren
npm install qrcode-terminal --save

# 4. PM2 neu starten
pm2 restart gutachtenruhr
pm2 status
```

## WhatsApp initialisieren:

```bash
cd /var/www/gutachtenruhr
node -e "require('./whatsapp-service').initialize()"
```

**QR-Code scannen:**
1. WhatsApp öffnen
2. Einstellungen > Verknüpfte Geräte > Gerät verknüpfen
3. QR-Code scannen
4. Warten bis "✅ WhatsApp Client ist bereit!"
5. Ctrl+C drücken

## Final:

```bash
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr
```

**Fertig! ✅**

