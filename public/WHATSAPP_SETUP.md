# 📱 WhatsApp-Service einrichten

## Schritt 1: ADMIN_PHONE_NUMBER in .env setzen

```bash
cd /var/www/gutachtenruhr/public
nano .env
```

Füge diese Zeile hinzu (ersetze mit deiner WhatsApp-Nummer):
```
ADMIN_PHONE_NUMBER=4916097089709
```

**Wichtig:** Die Nummer muss im internationalen Format sein (49 = Deutschland, ohne + oder 0)

Beispiele:
- `4916097089709` (Deutschland, 0160 9708 9709)
- `491234567890` (Deutschland, 0123 4567890)

## Schritt 2: WhatsApp-Service initialisieren

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

## Schritt 3: Server neu starten

```bash
cd /var/www/gutachtenruhr/public
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr
```

## Schritt 4: Testen

1. Gehe zu deiner Website
2. Fülle das Terminbuchungsformular aus
3. Sende die Anfrage ab
4. Du solltest eine WhatsApp-Nachricht erhalten!

## Troubleshooting

### QR-Code wird nicht angezeigt
```bash
# Installiere qrcode-terminal
cd /var/www/gutachtenruhr
npm install qrcode-terminal
```

### WhatsApp-Service funktioniert nicht
```bash
# Prüfe Logs
pm2 logs gutachtenruhr

# Prüfe ob whatsapp-service.js existiert
ls -la /var/www/gutachtenruhr/whatsapp-service.js

# Prüfe .env
cat /var/www/gutachtenruhr/public/.env | grep ADMIN_PHONE_NUMBER
```

### Session verloren
```bash
# Lösche alte Session
rm -rf /var/www/gutachtenruhr/whatsapp-session

# Initialisiere neu
cd /var/www/gutachtenruhr
node -e "require('./whatsapp-service').initialize()"
```

