# 🔧 SSH-Verbindung komplett beheben

## Schritt 1: Prüfe aktuelle SSH-Konfiguration

```bash
# Zeige alle relevanten Einstellungen
sudo grep -E "PermitRootLogin|PasswordAuthentication|PubkeyAuthentication|Port" /etc/ssh/sshd_config
```

## Schritt 2: Stelle sicher, dass alle Einstellungen korrekt sind

```bash
sudo nano /etc/ssh/sshd_config
```

**Stelle sicher, dass diese Zeilen SO sind (ohne # am Anfang):**
```
Port 22
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
ChallengeResponseAuthentication yes
UsePAM yes
```

**Falls Zeilen nicht existieren, füge sie am Ende hinzu!**

## Schritt 3: SSH komplett neu starten

```bash
# Stoppe SSH
sudo systemctl stop ssh

# Starte SSH neu
sudo systemctl start ssh

# Prüfe Status
sudo systemctl status ssh
```

## Schritt 4: Firewall prüfen

```bash
# Prüfe Firewall-Status
sudo ufw status

# Falls aktiv, öffne Port 22
sudo ufw allow 22/tcp
sudo ufw reload

# Prüfe ob Port offen ist
sudo netstat -tlnp | grep :22
```

## Schritt 5: Teste SSH lokal

```bash
# Teste ob SSH lokal funktioniert
ssh root@localhost
```

## Alternative Lösung: Dateien direkt auf Server erstellen

Falls FileZilla weiterhin nicht funktioniert, kannst du die Dateien auch direkt auf dem Server erstellen:

### Option 1: Nutze wget/curl um Dateien von einem temporären Server zu holen

### Option 2: Nutze die Remote-Console um Dateien direkt zu erstellen

### Option 3: Nutze SCP von einem anderen Gerät

## Schnell-Fix: SSH komplett neu konfigurieren

```bash
# Backup der alten Konfiguration
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Öffne Konfiguration
sudo nano /etc/ssh/sshd_config
```

**Füge am Ende hinzu:**
```
# Root-Login erlauben
PermitRootLogin yes

# Passwort-Authentifizierung
PasswordAuthentication yes
ChallengeResponseAuthentication yes

# Public-Key-Authentifizierung
PubkeyAuthentication yes

# PAM aktivieren
UsePAM yes
```

**Speichern:** Ctrl+X, Y, Enter

```bash
# SSH neu starten
sudo systemctl restart ssh

# Prüfe Logs
sudo tail -f /var/log/auth.log
```

## Prüfe ob SSH wirklich läuft

```bash
# Prüfe Prozess
ps aux | grep sshd

# Prüfe Port
sudo ss -tlnp | grep :22
sudo netstat -tlnp | grep :22
```

## Test-Verbindung

Nach allen Änderungen, teste von deinem PC:

```cmd
ssh -v root@82.165.219.105
```

Die `-v` Option zeigt detaillierte Informationen über den Verbindungsversuch.





