# 🚀 GitHub Upload - Schnellstart

## 1. GitHub Repository erstellen

1. Gehe zu github.com → "New repository"
2. Name: `gutachtenruhr-website`
3. Wähle "Private"
4. Klicke "Create repository"

## 2. Auf deinem PC (im public-Ordner):

```cmd
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/gutachtenruhr-website.git
git push -u origin main
```

**Falls nach Login gefragt:**
- Benutzername: Dein GitHub-Username
- Passwort: Personal Access Token (nicht dein Passwort!)
- Token erstellen: github.com → Settings → Developer settings → Personal access tokens

## 3. Auf dem Server (Remote-Console):

```bash
# Git installieren
sudo apt-get update
sudo apt-get install git -y

# Repository klonen
cd /var/www
sudo mkdir -p gutachtenruhr
cd gutachtenruhr
git clone https://github.com/DEIN-USERNAME/gutachtenruhr-website.git .

# .env erstellen
cp .env.example .env
nano .env
# Ändere SESSION_SECRET!

# Setup
npm install --production
node -e "require('./database/init-database')()"
chmod +x setup-server.sh
sudo ./setup-server.sh
pm2 start ecosystem.config.js
```

## Fertig! ✅

Die Dateien sind jetzt auf dem Server!





