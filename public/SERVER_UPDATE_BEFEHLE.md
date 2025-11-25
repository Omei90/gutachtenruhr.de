# 🚀 Server-Update Befehle

## cities.json vom Repository holen

Da `cities.json` jetzt im GitHub Repository ist, führe auf dem Server aus:

```bash
# Verbinde dich mit dem Server
ssh root@82.165.219.105

# Wechsle zum Projekt
cd /var/www/gutachtenruhr/public

# Hole die neuesten Dateien vom Repository
git pull

# Prüfe ob cities.json jetzt da ist
ls -la cities.json

# PM2 neu starten
pm2 restart gutachtenruhr

# Prüfe Logs
pm2 logs gutachtenruhr --lines 20
```

## Falls git pull nicht funktioniert

Falls es Probleme gibt, führe aus:

```bash
cd /var/www/gutachtenruhr/public

# Prüfe Git-Status
git status

# Falls nötig, hole cities.json direkt
git checkout HEAD -- cities.json

# Oder lade die Datei direkt von GitHub:
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json

# Dann PM2 neu starten
pm2 restart gutachtenruhr
```

