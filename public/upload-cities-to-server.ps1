# PowerShell Script zum Hochladen von cities.json auf den Server
# Verwendet sshpass-ähnliche Funktionalität

$serverIP = "82.165.219.105"
$username = "root"
$password = "omei2000"
$remotePath = "/var/www/gutachtenruhr/public"

Write-Host "Lade cities.json auf den Server..." -ForegroundColor Green

# Lade cities.json direkt von GitHub auf den Server
$commands = @"
cd $remotePath
curl -o cities.json https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/cities.json
ls -la cities.json
pm2 restart gutachtenruhr
pm2 logs gutachtenruhr --lines 10
"@

# Verwende Plink (PuTTY) oder ssh mit expect-ähnlichem Ansatz
# Da Windows SSH kein Passwort direkt unterstützt, verwenden wir einen anderen Ansatz

Write-Host "Führe Befehle auf dem Server aus..." -ForegroundColor Yellow

# Speichere Befehle in temporärer Datei
$tempScript = "$env:TEMP\server-commands.sh"
$commands | Out-File -FilePath $tempScript -Encoding ASCII

# Versuche mit sshpass (falls installiert) oder verwende expect
# Für Windows verwenden wir einen anderen Ansatz

Write-Host ""
Write-Host "Bitte führe manuell auf dem Server aus:" -ForegroundColor Yellow
Write-Host "ssh root@$serverIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dann diese Befehle:" -ForegroundColor Yellow
Write-Host $commands -ForegroundColor Cyan

