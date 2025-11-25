# 📦 Dateien für Strato VPS Upload

## ✅ Dateien die HOCHGELADEN werden müssen:

### Core-Dateien (Pflicht)
- `server.js` - Hauptserver-Datei
- `package.json` - Dependencies-Liste
- `package-lock.json` - Exakte Versions-Pinning
- `config.js` - Konfigurationsdatei
- `ecosystem.config.js` - PM2-Konfiguration
- `setup-server.sh` - Setup-Script (für erste Installation)

### Website-Dateien
- `index.html` - Haupt-HTML-Datei
- `template.html` - Template für dynamische Stadt-Seiten
- `script.js` - Frontend-JavaScript
- `styles.css` - CSS-Styles
- `icons.js` - Icon-Loader
- `hero-theme-switcher.js` - Hero-Theme-Switcher
- `robots.txt` - SEO-Robots-Datei
- `sitemap.xml` - Sitemap für SEO

### Daten & Konfiguration
- `cities.json` - Stadt-Daten für dynamische URLs
- `.env.example` - Template für Environment-Variablen
- `nginx-gutachtenruhr.conf` - Nginx-Konfiguration

### API & Backend
- `api/db.js` - Datenbank-Verbindung
- `api/routes/admin.js` - Admin-Routen

### Datenbank
- `database/init-database.js` - Datenbank-Initialisierung
- `database/schema-sqlite.sql` - SQLite-Schema

### Bilder & Assets
- `images/` - Kompletter Ordner mit allen Bildern
  - `images/Auto2.JPG`
  - `images/Auto3.jpeg`
  - `images/Auto4.jpeg`
  - `images/Auto5.JPG`
  - `images/Meisterbrief.jpg`
  - `images/accidents/` - Alle Unfallbilder
  - `images/hintergründe/SAM_3465.JPG`
  - `images/hintergründe/SAM_4369.JPG`

### Dokumentation (optional, aber empfohlen)
- `UPLOAD_STRATO.md` - Upload-Anleitung
- `DEPLOY_CHECKLIST.md` - Deployment-Checkliste

## ❌ Dateien die NICHT hochgeladen werden:

### Node.js
- `node_modules/` - Wird auf dem Server mit `npm install` erstellt
- `.env` - Wird auf dem Server neu erstellt (sicherheitsrelevant!)

### Lokale Daten
- `data/analytics.db` - Datenbank wird auf dem Server neu erstellt
- `logs/` - Logs werden auf dem Server generiert

### System-Dateien
- `.git/` - Git-Repository (falls vorhanden)
- `.DS_Store` - macOS System-Datei
- `Thumbs.db` - Windows System-Datei
- `.vscode/` - IDE-Einstellungen
- `.idea/` - IDE-Einstellungen

### Temporäre Dateien
- `*.log` - Log-Dateien
- `tmp/` - Temporäre Dateien
- `temp/` - Temporäre Dateien

## 📋 Upload-Reihenfolge (empfohlen):

### 1. Erste Upload-Welle (Core-Dateien)
```
server.js
package.json
package-lock.json
config.js
ecosystem.config.js
setup-server.sh
.env.example
nginx-gutachtenruhr.conf
```

### 2. Zweite Upload-Welle (Website-Dateien)
```
index.html
template.html
script.js
styles.css
icons.js
hero-theme-switcher.js
robots.txt
sitemap.xml
cities.json
```

### 3. Dritte Upload-Welle (Backend & Datenbank)
```
api/
database/
```

### 4. Vierte Upload-Welle (Bilder)
```
images/
```

### 5. Fünfte Upload-Welle (Dokumentation - optional)
```
UPLOAD_STRATO.md
DEPLOY_CHECKLIST.md
```

## 🚀 Schnell-Upload (alle auf einmal):

Wenn du alle Dateien auf einmal hochladen möchtest, lade einfach den kompletten `public`-Ordner hoch, aber **AUSSCHLIESSEN**:
- `node_modules/`
- `.env`
- `data/analytics.db` (falls vorhanden)
- `logs/` (falls vorhanden)

## ⚠️ WICHTIG nach dem Upload:

1. **Auf dem Server**: `.env` Datei erstellen
   ```bash
   cp .env.example .env
   nano .env
   # SESSION_SECRET ändern!
   ```

2. **Dependencies installieren**:
   ```bash
   npm install --production
   ```

3. **Datenbank initialisieren**:
   ```bash
   node -e "require('./database/init-database')()"
   ```

4. **Berechtigungen setzen**:
   ```bash
   chmod +x setup-server.sh
   chmod -R 755 .
   chmod -R 775 data/
   ```

## 📊 Dateigröße-Schätzung:

- Core-Dateien: ~500 KB
- Website-Dateien: ~2-3 MB
- Bilder: Abhängig von Anzahl/Größe (kann mehrere MB sein)
- **Gesamt**: Ca. 5-10 MB (ohne Bilder)

## 🔒 Sicherheit:

- **NIEMALS** `.env` hochladen (enthält Secrets)
- **NIEMALS** `node_modules/` hochladen (zu groß, wird auf Server installiert)
- Stelle sicher, dass `.env` auf dem Server nicht öffentlich zugänglich ist





