# PowerShell Script zum Aktualisieren des Servers
# Lädt cities.json direkt von GitHub auf den Server

Write-Host "Lade cities.json auf den Server..." -ForegroundColor Green

# SSH-Befehl zum Herunterladen der Datei von GitHub
$sshCommand = @"
cd /var/www/gutachtenruhr/public && curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json && ls -la cities.json && pm2 restart gutachtenruhr && pm2 logs gutachtenruhr --lines 10
"@

Write-Host "Führe Befehle auf dem Server aus..." -ForegroundColor Yellow
Write-Host "Du wirst nach dem SSH-Passwort gefragt." -ForegroundColor Yellow
Write-Host ""

ssh root@82.165.219.105 $sshCommand

Write-Host ""
Write-Host "Fertig! Prüfe die Ausgabe oben." -ForegroundColor Green

