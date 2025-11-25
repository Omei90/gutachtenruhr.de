# PowerShell Script zum Upload auf Strato VPS
# Verwendung: .\upload-to-strato.ps1

$VPS_IP = "82.165.219.105"
$VPS_USER = "root"
$VPS_PATH = "/var/www/gutachtenruhr"

Write-Host "🚀 Strato VPS Upload Script" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""

# Prüfe ob SCP verfügbar ist
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SCP ist nicht verfügbar. Bitte installiere OpenSSH:" -ForegroundColor Red
    Write-Host "   Windows: Settings > Apps > Optional Features > OpenSSH Client" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Upload-Informationen:" -ForegroundColor Cyan
Write-Host "   VPS IP: $VPS_IP" -ForegroundColor White
Write-Host "   Benutzer: $VPS_USER" -ForegroundColor White
Write-Host "   Ziel-Pfad: $VPS_PATH" -ForegroundColor White
Write-Host ""

# Frage nach Bestätigung
$confirm = Read-Host "Möchtest du fortfahren? (j/n)"
if ($confirm -ne "j" -and $confirm -ne "J" -and $confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Upload abgebrochen" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📤 Lade Dateien hoch..." -ForegroundColor Yellow
Write-Host ""

# Erstelle temporäre Upload-Liste (ohne node_modules, .env, data/analytics.db)
$excludePatterns = @("node_modules", ".env$", "data\analytics.db", "logs", ".git")

# Dateien die hochgeladen werden sollen
$filesToUpload = @(
    "server.js",
    "package.json",
    "package-lock.json",
    "config.js",
    "ecosystem.config.js",
    "setup-server.sh",
    ".env.example",
    "nginx-gutachtenruhr.conf",
    "index.html",
    "template.html",
    "script.js",
    "styles.css",
    "icons.js",
    "hero-theme-switcher.js",
    "robots.txt",
    "sitemap.xml",
    "cities.json",
    "api",
    "database",
    "images",
    "UPLOAD_STRATO.md",
    "DEPLOY_CHECKLIST.md",
    "UPLOAD_FILES_LIST.md"
)

Write-Host "📦 Dateien werden hochgeladen..." -ForegroundColor Cyan
Write-Host "   (Du wirst nach dem Passwort gefragt)" -ForegroundColor Yellow
Write-Host ""

# Upload-Befehl
$uploadCommand = "scp -r $($filesToUpload -join ' ') ${VPS_USER}@${VPS_IP}:${VPS_PATH}"

try {
    # Wechsle ins aktuelle Verzeichnis
    Push-Location $PSScriptRoot
    
    # Führe SCP aus
    Invoke-Expression $uploadCommand
    
    Write-Host ""
    Write-Host "✅ Upload erfolgreich!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Nächste Schritte auf dem Server:" -ForegroundColor Cyan
    Write-Host "   1. SSH-Verbindung: ssh $VPS_USER@$VPS_IP" -ForegroundColor White
    Write-Host "   2. cd $VPS_PATH" -ForegroundColor White
    Write-Host "   3. chmod +x setup-server.sh" -ForegroundColor White
    Write-Host "   4. sudo ./setup-server.sh" -ForegroundColor White
    Write-Host "   5. npm install --production" -ForegroundColor White
    Write-Host "   6. cp .env.example .env && nano .env" -ForegroundColor White
    Write-Host "   7. node -e \"require('./database/init-database')()\"" -ForegroundColor White
    Write-Host "   8. pm2 start ecosystem.config.js" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "❌ Fehler beim Upload: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Nutze FileZilla oder WinSCP für den Upload" -ForegroundColor Yellow
} finally {
    Pop-Location
}




