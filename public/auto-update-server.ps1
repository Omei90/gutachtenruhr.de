# Automatisches Update-Script für den Server
# Lädt cities.json von GitHub und startet PM2 neu

$serverIP = "82.165.219.105"
$username = "root"
$password = "omei2000"

Write-Host "=== Server Update Script ===" -ForegroundColor Green
Write-Host ""

# Erstelle temporäre Datei mit Befehlen
$commands = @"
cd /var/www/gutachtenruhr/public
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json
ls -la cities.json
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
"@

$tempFile = "$env:TEMP\server-update-commands.txt"
$commands | Out-File -FilePath $tempFile -Encoding ASCII -NoNewline

Write-Host "Befehle wurden in temporäre Datei gespeichert: $tempFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "Führe diese Befehle auf dem Server aus:" -ForegroundColor Cyan
Write-Host ""
Write-Host $commands -ForegroundColor White
Write-Host ""

# Versuche mit ssh (benötigt manuelle Passwort-Eingabe)
Write-Host "Versuche automatische Ausführung..." -ForegroundColor Yellow
Write-Host "Hinweis: Du wirst nach dem Passwort gefragt: $password" -ForegroundColor Yellow
Write-Host ""

# Verwende Get-Content um die Befehle zu lesen und per SSH auszuführen
# Da Windows SSH kein Passwort direkt unterstützt, verwenden wir einen Workaround

# Prüfe ob sshpass verfügbar ist (normalerweise nicht auf Windows)
# Alternativ: Verwende Plink (PuTTY) falls installiert

$plinkPath = "C:\Program Files\PuTTY\plink.exe"
if (Test-Path $plinkPath) {
    Write-Host "Plink gefunden! Führe Befehle aus..." -ForegroundColor Green
    $commands | & $plinkPath -ssh $username@$serverIP -pw $password
} else {
    Write-Host "Plink nicht gefunden. Verwende Standard-SSH..." -ForegroundColor Yellow
    Write-Host "Bitte führe manuell aus:" -ForegroundColor Yellow
    Write-Host "ssh $username@$serverIP" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Dann diese Befehle:" -ForegroundColor Yellow
    Write-Host $commands -ForegroundColor White
}

Write-Host ""
Write-Host "=== Script beendet ===" -ForegroundColor Green

