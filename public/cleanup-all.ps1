# PowerShell Script zum Aufräumen: Server + GitHub
# Führt die Cleanup-Skripte auf dem Server aus und pusht zu GitHub

$VPS_IP = "82.165.219.105"
$VPS_USER = "root"
$VPS_PASSWORD = "omei2000"

Write-Host "🧹 Aufräumen: Server + GitHub" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# 1. Lade Cleanup-Skripte auf Server hoch
Write-Host "1️⃣ Lade Cleanup-Skripte auf Server hoch..." -ForegroundColor Yellow

$plinkPath = "C:\Program Files\PuTTY\plink.exe"

if (Test-Path $plinkPath) {
    Write-Host "   ✅ Verwende plink (PuTTY)..." -ForegroundColor Green
    
    # Lade delete-files-on-server.sh hoch
    echo y | & $plinkPath -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASSWORD "cat > /tmp/delete-files-on-server.sh" < "delete-files-on-server.sh"
    
    # Lade push-deletions-to-github.sh hoch
    echo y | & $plinkPath -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASSWORD "cat > /tmp/push-deletions-to-github.sh" < "push-deletions-to-github.sh"
    
    Write-Host "   ✅ Skripte hochgeladen" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  plink nicht gefunden. Bitte manuell hochladen:" -ForegroundColor Yellow
    Write-Host "      scp delete-files-on-server.sh root@$VPS_IP:/tmp/" -ForegroundColor White
    Write-Host "      scp push-deletions-to-github.sh root@$VPS_IP:/tmp/" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Drücke Enter, wenn die Skripte hochgeladen wurden"
}

Write-Host ""

# 2. Führe Cleanup auf Server aus
Write-Host "2️⃣ Lösche Dateien auf dem Server..." -ForegroundColor Yellow

if (Test-Path $plinkPath) {
    echo y | & $plinkPath -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASSWORD "chmod +x /tmp/delete-files-on-server.sh && /tmp/delete-files-on-server.sh"
} else {
    Write-Host "   Bitte manuell ausführen auf dem Server:" -ForegroundColor Yellow
    Write-Host "      chmod +x /tmp/delete-files-on-server.sh" -ForegroundColor White
    Write-Host "      /tmp/delete-files-on-server.sh" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Drücke Enter, wenn die Dateien gelöscht wurden"
}

Write-Host ""

# 3. Push zu GitHub
Write-Host "3️⃣ Pushe Änderungen zu GitHub..." -ForegroundColor Yellow

if (Test-Path $plinkPath) {
    echo y | & $plinkPath -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASSWORD "chmod +x /tmp/push-deletions-to-github.sh && /tmp/push-deletions-to-github.sh"
} else {
    Write-Host "   Bitte manuell ausführen auf dem Server:" -ForegroundColor Yellow
    Write-Host "      chmod +x /tmp/push-deletions-to-github.sh" -ForegroundColor White
    Write-Host "      /tmp/push-deletions-to-github.sh" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Aufräumen abgeschlossen!" -ForegroundColor Green

