# 🚀 Server-Befehle ausführen

Führe diese Befehle auf dem Server aus (nachdem du dich per SSH verbunden hast):

```bash
cd /var/www/gutachtenruhr/public

# Lade cities.json direkt von GitHub
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json

# Prüfe ob es funktioniert hat
ls -la cities.json

# PM2 neu starten
pm2 restart gutachtenruhr

# Prüfe Logs
pm2 logs gutachtenruhr --lines 20
```

## Oder mit git pull (falls Repository korrekt eingerichtet):

```bash
cd /var/www/gutachtenruhr/public
git pull
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 20
```

