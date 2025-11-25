# 🔄 Server neu starten

## PM2 Prozess nicht gefunden

Führe diese Befehle auf dem Server aus:

```bash
cd /var/www/gutachtenruhr/public

# Prüfe PM2 Status
pm2 list

# Falls Prozess nicht existiert, starte neu
pm2 start ecosystem.config.js

# Oder falls ecosystem.config.js nicht existiert:
pm2 start server.js --name gutachtenruhr --update-env

# PM2 beim Systemstart aktivieren
pm2 startup
# Führe den angezeigten Befehl aus

# Speichere PM2-Konfiguration
pm2 save

# Prüfe Status
pm2 status

# Prüfe Logs
pm2 logs gutachtenruhr --lines 20
```

## Falls es Fehler gibt

```bash
# Prüfe ob Server-Datei existiert
ls -la server.js

# Teste Server manuell
node server.js
# (Drücke Ctrl+C zum Beenden)

# Dann mit PM2 starten
pm2 start server.js --name gutachtenruhr --update-env
```

