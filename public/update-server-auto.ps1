# Automatisches Server-Update Script
# Verwendet ssh mit automatischer Passwort-Eingabe

$serverIP = "82.165.219.105"
$username = "root"
$password = "omei2000"

Write-Host "=== Automatisches Server-Update ===" -ForegroundColor Green
Write-Host ""

# Befehle die auf dem Server ausgeführt werden sollen
$commands = @"
cd /var/www/gutachtenruhr/public
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json
ls -la cities.json
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
"@

# Speichere Befehle in temporärer Datei
$tempScript = "$env:TEMP\server-commands.sh"
$commands | Out-File -FilePath $tempScript -Encoding ASCII

Write-Host "Befehle werden auf dem Server ausgeführt..." -ForegroundColor Yellow
Write-Host ""

# Versuche mit sshpass (falls installiert) oder verwende Standard-SSH
# Für Windows: Verwende ssh mit automatischer Passwort-Eingabe über expect-ähnliches Tool

# Prüfe ob sshpass verfügbar ist
$sshpassAvailable = $false
try {
    $null = Get-Command sshpass -ErrorAction Stop
    $sshpassAvailable = $true
} catch {
    $sshpassAvailable = $false
}

if ($sshpassAvailable) {
    Write-Host "sshpass gefunden! Führe Befehle aus..." -ForegroundColor Green
    $commands -split "`n" | ForEach-Object {
        sshpass -p $password ssh -o StrictHostKeyChecking=no $username@$serverIP $_
    }
} else {
    Write-Host "sshpass nicht verfügbar. Verwende manuellen Ansatz..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Bitte führe diese Befehle manuell aus:" -ForegroundColor Cyan
    Write-Host "ssh $username@$serverIP" -ForegroundColor White
    Write-Host ""
    Write-Host "Dann diese Befehle:" -ForegroundColor Yellow
    Write-Host $commands -ForegroundColor White
}

Write-Host ""
Write-Host "=== Fertig ===" -ForegroundColor Green

