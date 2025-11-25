# 🔧 SSH-Verbindung beheben (SSH läuft bereits)

## Status: SSH läuft ✅
Die Logs zeigen, dass SSH aktiv ist. Das Problem liegt wahrscheinlich an der Konfiguration.

## Lösung: SSH-Konfiguration prüfen und anpassen

### 1. Öffne SSH-Konfiguration:
```bash
sudo nano /etc/ssh/sshd_config
```

### 2. Suche und ändere diese Zeilen:

**Finde diese Zeilen:**
```
#PermitRootLogin prohibit-password
#PasswordAuthentication no
```

**Ändere sie zu:**
```
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
```

**Wichtig:** Entferne das `#` am Anfang der Zeilen!

### 3. Speichere und beende:
- `Ctrl+X`
- `Y` (ja)
- `Enter`

### 4. SSH neu starten:
```bash
sudo systemctl restart ssh
```

### 5. Prüfe ob es funktioniert:
```bash
sudo systemctl status ssh
```

## Alternative: Prüfe ob Root-Login erlaubt ist

```bash
# Prüfe aktuelle SSH-Konfiguration
sudo grep -E "PermitRootLogin|PasswordAuthentication" /etc/ssh/sshd_config
```

**Sollte zeigen:**
```
PermitRootLogin yes
PasswordAuthentication yes
```

## Falls Root-Login nicht erlaubt ist:

Manche Server haben Root-Login deaktiviert. In diesem Fall:

### Option 1: Root-Login aktivieren (wie oben beschrieben)

### Option 2: Nutze einen anderen Benutzer
```bash
# Erstelle einen neuen Benutzer
sudo adduser deinbenutzername
sudo usermod -aG sudo deinbenutzername

# Dann in FileZilla nutzen:
# Benutzername: deinbenutzername
# Passwort: Das Passwort des neuen Benutzers
```

## Test der Verbindung:

Nach den Änderungen teste FileZilla erneut:
- Host: `82.165.219.105`
- Benutzername: `root`
- Passwort: Dein Root-Passwort
- Port: `22`
- Protokoll: `SFTP`

## Falls es immer noch nicht funktioniert:

**Prüfe Firewall:**
```bash
sudo ufw status
sudo ufw allow 22/tcp
```

**Prüfe ob Port 22 wirklich offen ist:**
```bash
sudo netstat -tlnp | grep :22
```

**Teste Verbindung lokal:**
```bash
ssh root@localhost
```




