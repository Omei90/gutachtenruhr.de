# 📦 Dateien über GitHub auf Server laden

## Schritt 1: GitHub Repository erstellen

1. Gehe zu [github.com](https://github.com) und logge dich ein
2. Klicke auf "New repository" (grüner Button)
3. Repository-Name: z.B. `gutachtenruhr-website`
4. Wähle "Private" (empfohlen) oder "Public"
5. **WICHTIG:** Füge `.gitignore` hinzu (siehe unten)
6. Klicke "Create repository"

## Schritt 2: Lokales Git-Repository initialisieren

**Auf deinem PC im `public`-Ordner:**

```cmd
# Prüfe ob Git installiert ist
git --version

# Falls nicht: Installiere Git von git-scm.com
```

**Initialisiere Git:**
```cmd
cd C:\Users\Carstens PC\Desktop\webneu\public
git init
git add .
git commit -m "Initial commit"
```

## Schritt 3: .gitignore erstellen (wichtig!)

Erstelle eine `.gitignore` Datei im `public`-Ordner:

```
node_modules/
.env
data/analytics.db
logs/
*.log
.DS_Store
Thumbs.db
```

## Schritt 4: Dateien zu GitHub hochladen

```cmd
# Füge Remote-Repository hinzu (ersetze USERNAME mit deinem GitHub-Username)
git remote add origin https://github.com/USERNAME/gutachtenruhr-website.git

# Lade Dateien hoch
git branch -M main
git push -u origin main
```

**Falls nach Login gefragt wird:**
- Nutze deinen GitHub-Benutzernamen und ein Personal Access Token (nicht Passwort!)
- Token erstellen: GitHub → Settings → Developer settings → Personal access tokens → Generate new token

## Schritt 5: Auf dem Server herunterladen

**In der Remote-Console:**

```bash
# Installiere Git (falls nicht vorhanden)
sudo apt-get update
sudo apt-get install git -y

# Erstelle Verzeichnis
sudo mkdir -p /var/www/gutachtenruhr
cd /var/www/gutachtenruhr

# Klone Repository (ersetze URL mit deiner)
git clone https://github.com/USERNAME/gutachtenruhr-website.git .

# Oder falls Repository privat ist, nutze SSH-Key oder Token
git clone https://TOKEN@github.com/USERNAME/gutachtenruhr-website.git .
```

## Schritt 6: .env Datei erstellen

```bash
cp .env.example .env
nano .env
# Ändere SESSION_SECRET!
```

## Schritt 7: Setup fortsetzen

```bash
# Dependencies installieren
npm install --production

# Datenbank initialisieren
node -e "require('./database/init-database')()"

# Setup-Script ausführen
chmod +x setup-server.sh
sudo ./setup-server.sh
```

## Alternative: Ohne Git - Direkter Download

Falls du kein GitHub nutzen möchtest, kannst du auch einen temporären Upload-Service nutzen:

### Option 1: Dateien als ZIP hochladen

1. Erstelle ZIP von allen Dateien (außer node_modules, .env)
2. Lade ZIP zu einem temporären Service hoch (z.B. WeTransfer, Dropbox, Google Drive)
3. Auf Server herunterladen:

```bash
cd /var/www/gutachtenruhr
wget https://link-zum-zip.zip
unzip link-zum-zip.zip
```

### Option 2: Base64-Encoding (für kleine Dateien)

Für einzelne wichtige Dateien kannst du sie auch direkt in der Remote-Console erstellen.

## Vorteile von GitHub:

✅ Kein SSH/FileZilla nötig
✅ Versionierung
✅ Backup automatisch
✅ Einfache Updates später: `git pull`

## Nach Updates auf GitHub:

```bash
cd /var/www/gutachtenruhr
git pull
pm2 restart gutachtenruhr
```




