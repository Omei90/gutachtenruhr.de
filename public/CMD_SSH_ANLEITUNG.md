# 💻 SSH-Verbindung über Windows CMD

## Schritt 1: Prüfe ob SSH installiert ist

Öffne CMD (Windows-Taste + R, dann `cmd` eingeben) und führe aus:

```cmd
ssh
```

**Falls Fehler:** SSH ist nicht installiert. Installiere OpenSSH:
- Windows 10/11: Settings > Apps > Optional Features > OpenSSH Client

## Schritt 2: Verbinde dich mit dem Server

```cmd
ssh root@82.165.105
```

**Oder mit explizitem Port:**
```cmd
ssh -p 22 root@82.165.219.105
```

## Schritt 3: Passwort eingeben

Wenn nach dem Passwort gefragt wird, tippe es ein (wird nicht angezeigt) und drücke Enter.

## Schritt 4: SSH-Konfiguration ändern

Nach erfolgreicher Verbindung:

```bash
# Öffne SSH-Konfiguration
sudo nano /etc/ssh/sshd_config
```

**Suche nach (mit Ctrl+W):**
- `PermitRootLogin`
- `PasswordAuthentication`

**Ändere zu:**
```
PermitRootLogin yes
PasswordAuthentication yes
```

**Speichern:** Ctrl+X, dann Y, dann Enter

```bash
# SSH neu starten
sudo systemctl restart ssh
```

## Alternative: PowerShell statt CMD

PowerShell funktioniert genauso:

```powershell
ssh root@82.165.219.105
```

## Falls Verbindung fehlschlägt:

**Prüfe ob Server erreichbar ist:**
```cmd
ping 82.165.219.105
```

**Teste mit verbose Output:**
```cmd
ssh -v root@82.165.219.105
```

## Dateien hochladen über CMD (SCP):

```cmd
# Einzelne Datei
scp server.js root@82.165.219.105:/var/www/gutachtenruhr/

# Kompletter Ordner
scp -r * root@82.165.219.105:/var/www/gutachtenruhr/
```




