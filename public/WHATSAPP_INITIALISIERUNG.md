# 📱 WhatsApp-Service initialisieren

## Schritt 1: Prüfe ob Dependencies installiert sind

```bash
cd /var/www/gutachtenruhr/public
npm list whatsapp-web.js qrcode-terminal
```

Falls nicht installiert:
```bash
npm install whatsapp-web.js qrcode-terminal --save
```

## Schritt 2: WhatsApp-Service initialisieren

```bash
cd /var/www/gutachtenruhr/public
node -e "require('./whatsapp-service').initialize()"
```

**Ein QR-Code wird angezeigt!**

1. Öffne WhatsApp auf deinem Handy
2. Gehe zu: **Einstellungen > Verknüpfte Geräte > Gerät verknüpfen**
3. Scanne den QR-Code im Terminal
4. Warte bis "✅ WhatsApp Client ist bereit!" erscheint
5. Drücke `Ctrl+C` zum Beenden

## Schritt 3: PM2 neu starten

```bash
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 20
```

## Schritt 4: Testen

1. Gehe zu deiner Website
2. Fülle das Terminbuchungsformular aus
3. Sende die Anfrage ab
4. Du solltest eine WhatsApp-Nachricht erhalten!

