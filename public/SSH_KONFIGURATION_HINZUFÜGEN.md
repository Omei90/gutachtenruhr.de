# ➕ SSH-Konfiguration hinzufügen

## Problem: PermitRootLogin nicht gefunden

Die Zeile existiert nicht oder ist auskommentiert. Füge sie hinzu!

## Lösung:

### 1. Öffne SSH-Konfiguration:
```bash
sudo nano /etc/ssh/sshd_config
```

### 2. Gehe ans Ende der Datei (mit `Ctrl+V` oder `Page Down`)

### 3. Füge diese Zeilen am Ende hinzu:

```
# Root-Login erlauben
PermitRootLogin yes

# Passwort-Authentifizierung erlauben
PasswordAuthentication yes

# Public-Key-Authentifizierung erlauben
PubkeyAuthentication yes
```

### 4. ODER suche nach "#PermitRootLogin" (mit #)

Falls du `#PermitRootLogin prohibit-password` findest:
- Entferne das `#` am Anfang
- Ändere `prohibit-password` zu `yes`

**Von:**
```
#PermitRootLogin prohibit-password
```

**Zu:**
```
PermitRootLogin yes
```

### 5. Suche nach PasswordAuthentication

Falls du `#PasswordAuthentication no` findest:
- Entferne das `#`
- Ändere `no` zu `yes`

**Von:**
```
#PasswordAuthentication no
```

**Zu:**
```
PasswordAuthentication yes
```

### 6. Speichere:
- `Ctrl+X`
- `Y` (ja)
- `Enter`

### 7. SSH neu starten:
```bash
sudo systemctl restart ssh
```

### 8. Prüfe ob es funktioniert:
```bash
sudo grep -E "PermitRootLogin|PasswordAuthentication" /etc/ssh/sshd_config
```

**Sollte zeigen:**
```
PermitRootLogin yes
PasswordAuthentication yes
```

## Schnell-Lösung: Alle Zeilen am Ende hinzufügen

Falls du nichts findest, füge einfach am Ende der Datei hinzu:

```bash
sudo nano /etc/ssh/sshd_config
```

**Gehe ans Ende (Ctrl+End oder einfach runterscrollen) und füge hinzu:**

```
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
```

**Speichern:** Ctrl+X, Y, Enter

```bash
sudo systemctl restart ssh
```




