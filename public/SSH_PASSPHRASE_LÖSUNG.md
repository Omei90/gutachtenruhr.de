# 🔑 SSH Passphrase-Problem lösen

## Problem: "Enter passphrase" statt Passwort

SSH versucht einen SSH-Key zu verwenden, der mit einer Passphrase geschützt ist.

## Lösung 1: Passphrase eingeben (falls du den Key kennst)

Wenn du die Passphrase des SSH-Keys kennst, gib sie einfach ein.

## Lösung 2: Passwort-Login erzwingen (empfohlen)

Umgehe den SSH-Key und nutze direkt Passwort-Login:

```cmd
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@82.165.219.105
```

## Lösung 3: SSH-Key entfernen (auf deinem PC)

Falls du den SSH-Key nicht brauchst, entferne ihn:

**Windows:**
```cmd
# Prüfe ob SSH-Keys vorhanden sind
dir %USERPROFILE%\.ssh

# Falls vorhanden, verschiebe oder lösche sie temporär
move %USERPROFILE%\.ssh\id_rsa %USERPROFILE%\.ssh\id_rsa.backup
```

## Lösung 4: Server-Konfiguration ändern (über Remote-Console)

Da du bereits in der Remote-Console bist, kannst du die SSH-Konfiguration direkt ändern:

```bash
# Öffne SSH-Konfiguration
sudo nano /etc/ssh/sshd_config
```

**Stelle sicher, dass diese Zeilen so sind:**
```
PasswordAuthentication yes
PubkeyAuthentication yes
PermitRootLogin yes
```

**Speichern:** Ctrl+X, Y, Enter

```bash
# SSH neu starten
sudo systemctl restart ssh
```

## Lösung 5: Neuen SSH-Key ohne Passphrase erstellen (optional)

Falls du SSH-Keys nutzen möchtest, aber ohne Passphrase:

```cmd
# Auf deinem PC (CMD)
ssh-keygen -t rsa -b 4096 -N "" -f %USERPROFILE%\.ssh\id_rsa

# Key auf Server kopieren
ssh-copy-id root@82.165.219.105
```

## Empfohlene Lösung:

**Nutze Lösung 2** - Erzwinge Passwort-Login:

```cmd
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@82.165.219.105
```

Dann kannst du dein Root-Passwort eingeben.





