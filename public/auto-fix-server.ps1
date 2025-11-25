# Automatisches Fix-Script für Terminbuchung-API
# Lädt die aktualisierten Dateien direkt von GitHub auf den Server

$serverIP = "82.165.219.105"
$username = "root"
$password = "omei2000"

Write-Host "=== Automatisches Server-Update ===" -ForegroundColor Green
Write-Host ""

# Befehle die auf dem Server ausgeführt werden sollen
$remoteCommands = @"
cd /var/www/gutachtenruhr/public
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
curl -o package.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/package.json
npm install
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
"@

Write-Host "Führe Befehle auf dem Server aus..." -ForegroundColor Yellow
Write-Host "Passwort: $password" -ForegroundColor Yellow
Write-Host ""

# Versuche mit ssh (benötigt manuelle Passwort-Eingabe)
Write-Host "Bitte führe diese Befehle auf dem Server aus:" -ForegroundColor Cyan
Write-Host "ssh $username@$serverIP" -ForegroundColor White
Write-Host ""
Write-Host "Dann diese Befehle:" -ForegroundColor Yellow
Write-Host $remoteCommands -ForegroundColor White

