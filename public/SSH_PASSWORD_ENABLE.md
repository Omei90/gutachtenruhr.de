# 🔓 Passwort-Login für SSH aktivieren

## Problem: "Permission denied (publickey)"
SSH erlaubt nur Key-Authentifizierung, kein Passwort-Login.

## Lösung: In der Remote-Console (wo du bereits bist!)

### Schritt 1: Öffne SSH-Konfiguration
```bash
sudo nano /etc/ssh/sshd_config
```

### Schritt 2: Suche und ändere diese Zeilen

**Suche nach (mit Ctrl+W):**
- `PasswordAuthentication`
- `PermitRootLogin`
- `PubkeyAuthentication`

**Ändere sie zu:**
```
PasswordAuthentication yes
PermitRootLogin yes
PubkeyAuthentication yes
```

**WICHTIG:** 
- Entferne das `#` am Anfang der Zeilen (falls vorhanden)
- Falls die Zeilen nicht existieren, füge sie am Ende der Datei hinzu

### Schritt 3: Speichere
- `Ctrl+X`
- `Y` (ja)
- `Enter`

### Schritt 4: SSH neu starten
```bash
sudo systemctl restart ssh
```

### Schritt 5: Status prüfen
```bash
sudo systemctl status ssh
```

## Nach den Änderungen:

Jetzt sollte FileZilla funktionieren:
- Host: `82.165.219.105`
- Benutzername: `root`
- Passwort: Dein Root-Passwort
- Port: `22`
- Protokoll: `SFTP`

## Schnell-Check: Prüfe aktuelle Einstellungen

```bash
sudo grep -E "PasswordAuthentication|PermitRootLogin" /etc/ssh/sshd_config
```

**Sollte zeigen:**
```
PasswordAuthentication yes
PermitRootLogin yes
```

Falls es `no` oder `prohibit-password` zeigt, musst du es ändern!




