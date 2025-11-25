# 🚀 WhatsApp-Setup: Befehle zum Ausführen

## Automatisches Setup auf dem Server

Führe diese Befehle **auf dem Server** aus:

```bash
# Verbinde dich mit dem Server
ssh root@82.165.219.105
# Passwort: omei2000

# Führe das Setup-Script aus
cd /var/www/gutachtenruhr/public
bash <(curl -s https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/setup-whatsapp-complete.sh)
```

## Oder manuell Schritt für Schritt:

### Schritt 1: ADMIN_PHONE_NUMBER setzen
```bash
cd /var/www/gutachtenruhr/public

# Prüfe ob bereits vorhanden
if grep -q "ADMIN_PHONE_NUMBER" .env; then
    sed -i 's/^ADMIN_PHONE_NUMBER=.*/ADMIN_PHONE_NUMBER=4916097089709/' .env
else
    echo "ADMIN_PHONE_NUMBER=4916097089709" >> .env
fi

# Prüfe
cat .env | grep ADMIN_PHONE_NUMBER
```

### Schritt 2: Server aktualisieren
```bash
cd /var/www/gutachtenruhr/public
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
```

### Schritt 3: Dependencies installieren
```bash
cd /var/www/gutachtenruhr/public
npm install qrcode-terminal --save
```

### Schritt 4: PM2 neu starten
```bash
pm2 restart gutachtenruhr
pm2 status
```

### Schritt 5: WhatsApp-Service initialisieren
```bash
cd /var/www/gutachtenruhr
node -e "require('./whatsapp-service').initialize()"
```

**Ein QR-Code wird angezeigt!**

1. Öffne WhatsApp auf deinem Handy
2. Gehe zu: **Einstellungen > Verknüpfte Geräte > Gerät verknüpfen**
3. Scanne den QR-Code im Terminal
4. Warte bis "✅ WhatsApp Client ist bereit!" erscheint
5. Drücke `Ctrl+C` zum Beenden

### Schritt 6: PM2 final neu starten
```bash
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
```

## Fertig! ✅

Jetzt sollten WhatsApp-Benachrichtigungen bei neuen Terminanfragen funktionieren.
