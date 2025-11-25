# Automatisches WhatsApp-Setup auf dem Server
$serverIP = "82.165.219.105"
$username = "root"
$password = "omei2000"

Write-Host "=== Automatisches WhatsApp-Setup ===" -ForegroundColor Green
Write-Host ""

# Befehle die auf dem Server ausgeführt werden
$commands = @"
cd /var/www/gutachtenruhr/public
if grep -q 'ADMIN_PHONE_NUMBER' .env; then
    sed -i 's/^ADMIN_PHONE_NUMBER=.*/ADMIN_PHONE_NUMBER=4916097089709/' .env
else
    echo 'ADMIN_PHONE_NUMBER=4916097089709' >> .env
fi
curl -o server.js https://raw.githubusercontent.com/Omei90/gutachtenruhr.de/main/public/server.js
npm install qrcode-terminal --save
pm2 restart gutachtenruhr
pm2 status
"@

Write-Host "Führe Setup-Befehle auf dem Server aus..." -ForegroundColor Yellow
Write-Host ""

# Verwende plink (PuTTY) oder sshpass falls verfügbar
# Alternativ: Manuelle Ausführung
Write-Host "Bitte führe diese Befehle auf dem Server aus:" -ForegroundColor Cyan
Write-Host "ssh $username@$serverIP" -ForegroundColor White
Write-Host ""
Write-Host "Dann diese Befehle:" -ForegroundColor Yellow
Write-Host $commands -ForegroundColor White
Write-Host ""
Write-Host "Nach dem Setup:" -ForegroundColor Green
Write-Host "cd /var/www/gutachtenruhr" -ForegroundColor White
Write-Host "node -e \"require('./whatsapp-service').initialize()\"" -ForegroundColor White
Write-Host ""
Write-Host "Scanne den QR-Code mit WhatsApp!" -ForegroundColor Yellow

