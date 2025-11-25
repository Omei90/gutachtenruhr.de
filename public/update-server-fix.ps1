# Script zum Aktualisieren des Servers mit Terminbuchung-API
# Führt alle notwendigen Befehle auf dem Server aus

$serverIP = "82.165.219.105"
$username = "root"
$password = "omei2000"

Write-Host "=== Server Update - Terminbuchung-API ===" -ForegroundColor Green
Write-Host ""

$commands = @"
cd /var/www/gutachtenruhr/public
git pull
npm install
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
"@

Write-Host "Befehle die auf dem Server ausgeführt werden:" -ForegroundColor Yellow
Write-Host $commands -ForegroundColor Cyan
Write-Host ""
Write-Host "Bitte führe diese Befehle auf dem Server aus:" -ForegroundColor Yellow
Write-Host "ssh $username@$serverIP" -ForegroundColor White
Write-Host ""
Write-Host "Dann diese Befehle:" -ForegroundColor Yellow
Write-Host $commands -ForegroundColor White

