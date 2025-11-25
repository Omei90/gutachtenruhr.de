# Server Update Script
# Führt Befehle auf dem Server aus

$serverIP = "82.165.219.105"
$username = "root"
$password = "omei2000"

Write-Host "=== Server Update ===" -ForegroundColor Green
Write-Host ""

# Befehle die auf dem Server ausgeführt werden sollen
$remoteCommands = @"
cd /var/www/gutachtenruhr/public && curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json && ls -la cities.json && pm2 restart gutachtenruhr && pm2 logs gutachtenruhr --lines 10
"@

Write-Host "Führe Befehle auf dem Server aus..." -ForegroundColor Yellow
Write-Host "Passwort: $password" -ForegroundColor Yellow
Write-Host ""

# Versuche SSH-Befehl auszuführen
# Hinweis: Windows SSH unterstützt keine Passwort-Übergabe direkt
# Du musst das Passwort manuell eingeben

Write-Host "Bitte führe diesen Befehl aus und gib das Passwort ein:" -ForegroundColor Cyan
Write-Host "ssh $username@$serverIP `"$remoteCommands`"" -ForegroundColor White
Write-Host ""

# Oder führe es interaktiv aus
Write-Host "Oder verbinde dich manuell:" -ForegroundColor Yellow
Write-Host "ssh $username@$serverIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dann führe diese Befehle aus:" -ForegroundColor Yellow
Write-Host $remoteCommands -ForegroundColor White

