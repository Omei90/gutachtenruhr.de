# PowerShell Script zum Hochladen von cities.json auf den Server
$password = "omei2000"
$server = "82.165.219.105"
$user = "root"

Write-Host "Lade cities.json auf den Server..." -ForegroundColor Green

# Erstelle SSH-Befehl als String
$commands = @"
cd /var/www/gutachtenruhr/public
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json
ls -la cities.json
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
"@

# Verwende Plink (PuTTY) falls verfügbar, sonst SSH
$plinkPath = "C:\Program Files\PuTTY\plink.exe"
if (Test-Path $plinkPath) {
    Write-Host "Verwende Plink..." -ForegroundColor Yellow
    $commands | & $plinkPath -ssh $user@$server -pw $password
} else {
    Write-Host "Plink nicht gefunden. Verwende SSH..." -ForegroundColor Yellow
    Write-Host "Du musst das Passwort manuell eingeben: $password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Führe diese Befehle auf dem Server aus:" -ForegroundColor Cyan
    Write-Host $commands -ForegroundColor White
}

