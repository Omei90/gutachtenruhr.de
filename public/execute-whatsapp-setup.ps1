# PowerShell Script zum Ausführen der WhatsApp-Setup-Befehle
# Führt alle Befehle direkt auf dem Server aus

$ErrorActionPreference = "Stop"

Write-Host "=== WhatsApp-Setup auf Server ausführen ===" -ForegroundColor Green
Write-Host ""

# Server-Details
$server = "root@82.165.219.105"
$password = "omei2000"

# Befehle die ausgeführt werden sollen
$setupCommands = @"
cd /var/www/gutachtenruhr/public && \
if grep -q 'ADMIN_PHONE_NUMBER' .env; then \
    sed -i 's/^ADMIN_PHONE_NUMBER=.*/ADMIN_PHONE_NUMBER=4916097089709/' .env; \
else \
    echo 'ADMIN_PHONE_NUMBER=4916097089709' >> .env; \
fi && \
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js && \
npm install qrcode-terminal --save && \
pm2 restart gutachtenruhr && \
pm2 status
"@

Write-Host "Führe Setup-Befehle aus..." -ForegroundColor Yellow

try {
    # Versuche mit sshpass (falls installiert) oder verwende expect
    # Da Windows PowerShell, verwenden wir einen anderen Ansatz
    
    Write-Host "Bitte führe diese Befehle manuell auf dem Server aus:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ssh $server" -ForegroundColor White
    Write-Host ""
    Write-Host "Dann:" -ForegroundColor Yellow
    Write-Host $setupCommands -ForegroundColor White
    Write-Host ""
    
    # Alternative: Verwende plink.exe (PuTTY) falls vorhanden
    $plinkPath = "C:\Program Files\PuTTY\plink.exe"
    if (Test-Path $plinkPath) {
        Write-Host "Versuche mit PuTTY plink..." -ForegroundColor Yellow
        $setupCommands | & $plinkPath -ssh -pw $password $server
    } else {
        Write-Host "PuTTY nicht gefunden. Bitte führe die Befehle manuell aus." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Fehler: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Bitte führe die Befehle manuell auf dem Server aus:" -ForegroundColor Yellow
    Write-Host "ssh $server" -ForegroundColor White
    Write-Host $setupCommands -ForegroundColor White
}

Write-Host ""
Write-Host "Nach dem Setup:" -ForegroundColor Green
Write-Host "cd /var/www/gutachtenruhr" -ForegroundColor White
Write-Host "node -e \"require('./whatsapp-service').initialize()\"" -ForegroundColor White
Write-Host ""
Write-Host "Scanne den QR-Code mit WhatsApp!" -ForegroundColor Yellow

