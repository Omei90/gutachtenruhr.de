# 🔧 SSH/SFTP Verbindungsprobleme beheben

## Problem: FileZilla kann nicht verbinden

## Lösung 1: Prüfe ob SSH läuft

In der Remote-Console ausführen:

```bash
# Prüfe ob SSH-Service läuft
sudo systemctl status ssh
# oder
sudo systemctl status sshd

# Falls nicht aktiv, starte SSH
sudo systemctl start ssh
sudo systemctl enable ssh
```

## Lösung 2: Prüfe Firewall

```bash
# Prüfe Firewall-Status
sudo ufw status

# Falls Port 22 blockiert ist, öffne ihn
sudo ufw allow 22/tcp
sudo ufw reload
```

## Lösung 3: Prüfe SSH-Konfiguration

```bash
# Prüfe SSH-Konfiguration
sudo nano /etc/ssh/sshd_config

# Stelle sicher, dass folgende Zeilen aktiviert sind:
# PermitRootLogin yes
# PasswordAuthentication yes
# PubkeyAuthentication yes

# Nach Änderungen SSH neu starten
sudo systemctl restart ssh
```

## Lösung 4: Alternative - Nutze SCP vom lokalen PC

Falls FileZilla nicht funktioniert, nutze SCP direkt:

**Windows PowerShell:**
```powershell
# Prüfe ob SCP verfügbar ist
scp --version

# Falls nicht, installiere OpenSSH:
# Settings > Apps > Optional Features > OpenSSH Client

# Upload einzelner Dateien
scp server.js root@82.165.219.105:/var/www/gutachtenruhr/

# Upload kompletter Ordner
scp -r * root@82.165.219.105:/var/www/gutachtenruhr/
```

## Lösung 5: Prüfe ob Server erreichbar ist

```bash
# Vom lokalen PC aus testen
ping 82.165.219.105

# SSH-Verbindung testen
ssh root@82.165.219.105
```

## Lösung 6: Strato VPS spezifisch

Manche Strato VPS haben spezielle Einstellungen:

1. **Prüfe Strato Control Panel:**
   - SSH-Zugang aktiviert?
   - Root-Login erlaubt?

2. **Alternative Benutzer:**
   - Vielleicht nicht "root" sondern ein anderer Benutzer?
   - Prüfe in der Remote-Console: `whoami`

3. **Port könnte anders sein:**
   - Manche Strato VPS nutzen einen anderen SSH-Port
   - Prüfe in `/etc/ssh/sshd_config`: `Port 22`

## Lösung 7: Dateien direkt in Remote-Console hochladen

Falls FileZilla nicht funktioniert, kannst du die Dateien auch direkt in der Remote-Console erstellen:

```bash
# Erstelle Verzeichnis
sudo mkdir -p /var/www/gutachtenruhr
cd /var/www/gutachtenruhr

# Nutze wget oder curl um Dateien von einem temporären Server zu holen
# Oder nutze einen anderen Upload-Weg
```

## Empfohlene Reihenfolge:

1. ✅ Prüfe SSH-Status: `sudo systemctl status ssh`
2. ✅ Prüfe Firewall: `sudo ufw status`
3. ✅ Teste SSH-Verbindung: `ssh root@82.165.219.105` (vom lokalen PC)
4. ✅ Falls SSH funktioniert, aber SFTP nicht: Prüfe SSH-Konfiguration
5. ✅ Alternative: Nutze SCP statt FileZilla





