# 🔐 GitHub Repository auf Server klonen - Lösungen

## Problem: "Authentication failed"

Das Repository ist privat oder benötigt Authentifizierung.

---

## Lösung 1: Repository öffentlich machen (Einfachste Lösung)

1. Gehe zu: https://github.com/Omei90/gutachtenruhr.de/settings
2. Scrolle nach unten zu "Danger Zone"
3. Klicke "Change visibility" → "Make public"
4. Bestätige

**Dann auf dem Server:**
```bash
cd /var/www/gutachtenruhr
rm -rf .git  # Falls bereits versucht wurde
git clone https://github.com/Omei90/gutachtenruhr.de.git .
cd public
```

---

## Lösung 2: Personal Access Token verwenden

### Schritt 1: Token erstellen

1. Gehe zu: https://github.com/settings/tokens
2. Klicke "Generate new token" → "Generate new token (classic)"
3. Name: `gutachtenruhr-server`
4. Scopes: Aktiviere `repo` (vollständiger Zugriff)
5. Klicke "Generate token"
6. **Kopiere den Token** (wird nur einmal angezeigt!)

### Schritt 2: Auf Server klonen

```bash
cd /var/www/gutachtenruhr
rm -rf .git  # Falls bereits versucht wurde

# Klone mit Token (ersetze DEIN-TOKEN)
git clone https://DEIN-TOKEN@github.com/Omei90/gutachtenruhr.de.git .

cd public
```

**Beispiel:**
```bash
git clone https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/Omei90/gutachtenruhr.de.git .
```

---

## Lösung 3: SSH-Key einrichten (Für dauerhafte Lösung)

### Schritt 1: SSH-Key auf Server erstellen

```bash
# Erstelle SSH-Key
ssh-keygen -t ed25519 -C "server@gutachtenruhr.de"

# Drücke Enter für alle Fragen (Standard-Speicherort)

# Zeige öffentlichen Key an
cat ~/.ssh/id_ed25519.pub
```

### Schritt 2: Key zu GitHub hinzufügen

1. Kopiere den gesamten Output von `cat ~/.ssh/id_ed25519.pub`
2. Gehe zu: https://github.com/settings/keys
3. Klicke "New SSH key"
4. Titel: `Strato Server`
5. Key: Füge den kopierten Key ein
6. Klicke "Add SSH key"

### Schritt 3: Mit SSH klonen

```bash
cd /var/www/gutachtenruhr
rm -rf .git

# Klone mit SSH
git clone git@github.com:Omei90/gutachtenruhr.de.git .

cd public
```

---

## Aktueller Status prüfen

```bash
# Prüfe ob Verzeichnis existiert
ls -la /var/www/gutachtenruhr

# Prüfe ob .git existiert
ls -la /var/www/gutachtenruhr/.git
```

---

## Falls bereits Dateien vorhanden sind

```bash
cd /var/www/gutachtenruhr

# Prüfe was vorhanden ist
ls -la

# Falls .git existiert aber fehlerhaft:
rm -rf .git

# Dann neu klonen (mit einer der Lösungen oben)
```

---

## Empfehlung

**Für schnelle Lösung:** Option 1 (Repository öffentlich machen)
**Für Sicherheit:** Option 3 (SSH-Key)

