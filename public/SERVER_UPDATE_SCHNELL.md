# ⚡ Schnelles Server-Update

## cities.json auf den Server laden

Da `cities.json` jetzt im GitHub Repository ist, führe diese Befehle auf dem Server aus:

### Option 1: Mit git pull (empfohlen)

```bash
ssh root@82.165.219.105
# Passwort: omei2000

cd /var/www/gutachtenruhr/public
git pull
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
```

### Option 2: Direkt von GitHub herunterladen

```bash
ssh root@82.165.219.105
# Passwort: omei2000

cd /var/www/gutachtenruhr/public
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json
ls -la cities.json
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
```

### Option 3: Alles in einem Befehl

```bash
ssh root@82.165.219.105 "cd /var/www/gutachtenruhr/public && curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json && pm2 restart gutachtenruhr"
# Passwort eingeben wenn gefragt: omei2000
```

## Nach dem Update prüfen

```bash
# Prüfe ob Server läuft
pm2 status

# Prüfe Logs
pm2 logs gutachtenruhr --lines 20

# Teste Website
curl http://localhost:3000/health
```

