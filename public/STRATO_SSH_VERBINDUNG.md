# 🔐 SSH-Verbindung zu Strato VPS - Schritt für Schritt

## Übersicht
Diese Anleitung zeigt dir, wie du dich mit deinem Strato VPS per SSH verbindest.

---

## Voraussetzungen

- ✅ Strato VPS ist aktiviert
- ✅ Du hast deine Server-IP-Adresse (z.B. `82.165.219.105`)
- ✅ Du hast dein Root-Passwort oder Benutzername + Passwort
- ✅ Windows 10/11 (SSH ist standardmäßig enthalten)

---

## Schritt 1: SSH-Zugangsdaten finden

### Wo finde ich meine Zugangsdaten?

1. **Logge dich in dein Strato-Kundencenter ein:**
   - Gehe zu: https://www.strato.de/kundencenter/
   - Melde dich mit deinen Zugangsdaten an

2. **Navigiere zu deinem VPS:**
   - Klicke auf "Server" oder "VPS"
   - Wähle deinen VPS aus

3. **Finde diese Informationen:**
   - **Server-IP:** z.B. `82.165.219.105`
   - **Root-Passwort:** Wurde dir bei der Einrichtung per E-Mail zugesendet
   - **SSH-Port:** Meist `22` (Standard)

### Falls du das Passwort nicht hast:
- Prüfe deine E-Mails von Strato
- Im Strato-Kundencenter: VPS → Passwort zurücksetzen

---

## Schritt 2: SSH unter Windows öffnen

### Option A: PowerShell (empfohlen)

1. **PowerShell öffnen:**
   - Drücke `Windows-Taste + X`
   - Wähle "Windows PowerShell" oder "Terminal"

2. **Oder direkt:**
   - Drücke `Windows-Taste + R`
   - Tippe `powershell` ein
   - Drücke Enter

### Option B: CMD (Command Prompt)

1. **CMD öffnen:**
   - Drücke `Windows-Taste + R`
   - Tippe `cmd` ein
   - Drücke Enter

### Option C: Windows Terminal (Windows 11)

- Drücke `Windows-Taste` und tippe "Terminal"

---

## Schritt 3: SSH-Verbindung herstellen

### Standard-Verbindung (mit Root-Benutzer):

```powershell
ssh root@DEINE-SERVER-IP
```

**Beispiel:**
```powershell
ssh root@82.165.219.105
```

### Mit explizitem Port (falls nicht Standard-Port 22):

```powershell
ssh -p 22 root@82.165.219.105
```

### Mit anderem Benutzer (falls Root-Login deaktiviert):

```powershell
ssh benutzername@82.165.219.105
```

**Ersetze:**
- `DEINE-SERVER-IP` mit deiner tatsächlichen IP-Adresse
- `benutzername` mit deinem Server-Benutzernamen

---

## Schritt 4: Sicherheitswarnung bestätigen

Beim ersten Verbindungsversuch erscheint eine Warnung:

```
The authenticity of host '82.165.219.105' can't be established.
ECDSA key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Antworte mit:** `yes` und drücke Enter

Diese Warnung erscheint nur beim ersten Mal.

---

## Schritt 5: Passwort eingeben

Du wirst nach dem Passwort gefragt:

```
root@82.165.219.105's password:
```

**Wichtig:**
- Das Passwort wird **nicht angezeigt** (auch keine Sterne `***`)
- Tippe dein Passwort ein und drücke Enter
- Falls Fehler: Passwort nochmal eingeben (Tippfehler möglich)

---

## Schritt 6: Erfolgreich verbunden! ✅

Wenn alles geklappt hat, siehst du:

```
Welcome to Ubuntu 22.04 LTS (GNU/Linux ...)
...
root@server:~#
```

**Du bist jetzt mit deinem Server verbunden!**

---

## Häufige Probleme und Lösungen

### Problem 1: "ssh: command not found"

**Lösung:** SSH ist nicht installiert

**Windows 10/11:**
1. Öffne "Einstellungen" → "Apps" → "Optionale Features"
2. Klicke "Feature hinzufügen"
3. Suche nach "OpenSSH Client"
4. Installiere es
5. Starte PowerShell/CMD neu

**Oder per PowerShell (als Administrator):**
```powershell
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

---

### Problem 2: "Connection refused" oder "Connection timed out"

**Mögliche Ursachen:**

1. **Server-IP ist falsch**
   ```powershell
   # Prüfe ob Server erreichbar ist
   ping 82.165.219.105
   ```

2. **SSH-Port ist blockiert**
   - Prüfe Firewall-Einstellungen auf deinem PC
   - Prüfe ob Strato eine Firewall aktiviert hat

3. **SSH-Dienst läuft nicht auf dem Server**
   - Kontaktiere Strato-Support

4. **Falscher Port**
   - Manche Server nutzen einen anderen Port (z.B. 2222)
   ```powershell
   ssh -p 2222 root@82.165.219.105
   ```

---

### Problem 3: "Permission denied (publickey,password)"

**Mögliche Ursachen:**

1. **Falsches Passwort**
   - Prüfe dein Passwort nochmal
   - Nutze "Passwort zurücksetzen" im Strato-Kundencenter

2. **Root-Login ist deaktiviert**
   - Nutze einen anderen Benutzer:
   ```powershell
   ssh benutzername@82.165.219.105
   ```

3. **Password-Authentication ist deaktiviert**
   - Kontaktiere Strato-Support oder nutze SSH-Keys

---

### Problem 4: "Host key verification failed"

**Lösung:** Entferne den alten Eintrag

```powershell
# Öffne die known_hosts Datei
notepad C:\Users\%USERNAME%\.ssh\known_hosts

# Entferne die Zeile mit deiner Server-IP
# Oder lösche die gesamte Datei (wird beim nächsten Verbindungsversuch neu erstellt)
```

---

## Verbindung testen (mit Details)

Falls es Probleme gibt, nutze den Verbose-Modus:

```powershell
ssh -v root@82.165.219.105
```

Das zeigt detaillierte Informationen über den Verbindungsprozess.

---

## Alternative: Strato VPS-Console nutzen

Falls SSH nicht funktioniert, nutze die Web-Console:

1. **Logge dich ins Strato-Kundencenter ein**
2. **Gehe zu:** Server → VPS → Dein Server
3. **Klicke auf:** "VPS-Console" oder "Web-Console"
4. **Du kannst jetzt direkt im Browser arbeiten**

**Nachteil:** Keine Dateiübertragung möglich, nur Terminal-Zugriff

---

## Nach erfolgreicher Verbindung

### Erste Schritte:

```bash
# Prüfe System-Info
uname -a

# Prüfe aktuelle Verzeichnis
pwd

# Liste Dateien
ls -la

# Prüfe ob Git installiert ist
git --version

# Prüfe ob Node.js installiert ist
node --version
```

---

## Verbindung beenden

Um die SSH-Verbindung zu beenden:

```bash
exit
```

Oder drücke: `Ctrl+D`

---

## Nützliche SSH-Optionen

### Verbindung mit automatischem Neustart bei Unterbrechung:

```powershell
ssh -o ServerAliveInterval=60 root@82.165.219.105
```

### Dateien direkt hochladen (SCP):

```powershell
# Einzelne Datei
scp datei.txt root@82.165.219.105:/var/www/

# Kompletter Ordner
scp -r ordner/ root@82.165.219.105:/var/www/
```

### SSH-Key einrichten (für Passwort-freien Login):

1. **Erstelle SSH-Key auf deinem PC:**
   ```powershell
   ssh-keygen -t rsa -b 4096
   ```

2. **Kopiere Key auf Server:**
   ```powershell
   ssh-copy-id root@82.165.219.105
   ```

3. **Ab jetzt kein Passwort mehr nötig!**

---

## Sicherheitstipps

- ✅ Nutze starke Passwörter
- ✅ Ändere Standard-Ports (optional)
- ✅ Nutze SSH-Keys statt Passwörter (empfohlen)
- ✅ Deaktiviere Root-Login nach Einrichtung (optional)
- ✅ Nutze Firewall (UFW)

---

## Nächste Schritte

Nach erfolgreicher Verbindung kannst du:

1. ✅ Projekt von GitHub klonen
2. ✅ Server-Setup durchführen
3. ✅ Website einrichten

Siehe: `STRATO_DEPLOYMENT_ANLEITUNG.md`

---

## Hilfe

Falls nichts funktioniert:

1. **Prüfe Strato-Dokumentation:** https://www.strato.de/hilfe/
2. **Kontaktiere Strato-Support:** support@strato.de
3. **Nutze VPS-Console** als Alternative

---

**Viel Erfolg! 🚀**

