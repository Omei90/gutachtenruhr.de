#!/bin/bash
# Löscht unnötige Dateien auf dem Server

echo "🗑️  Lösche unnötige Dateien auf dem Server..."
echo ""

cd /var/www/gutachtenruhr/public

# Liste der zu löschenden Dateien
FILES_TO_DELETE=(
    # Test-Skripte
    "TEST_ACCESS.sh"
    "TEST_DOMAIN_ACCESS.sh"
    "TEST_EXTERNAL_ACCESS.sh"
    "TEST_WHATSAPP_LOAD.js"
    
    # Diagnose-Skripte
    "DIAGNOSE_CERTBOT.sh"
    "DIAGNOSE_SERVER.sh"
    "FULL_DIAGNOSE.sh"
    "FULL_DOMAIN_DIAGNOSE.sh"
    
    # Check-Skripte
    "CHECK_DNS_PROPAGATION.sh"
    "CHECK_DOMAIN.sh"
    "CHECK_IPTABLES.sh"
    "CHECK_WHATSAPP_STATUS.sh"
    "CHECK_WHATSAPP_STATUS_FINAL.sh"
    
    # Fix-Skripte
    "FIX_ACME_CHALLENGE.sh"
    "FIX_API_ENDPOINT.sh"
    "FIX_API_KOMPLETT.sh"
    "FIX_CERTBOT_STANDALONE.sh"
    "FIX_CONNECTION_REFUSED.sh"
    "FIX_DNS.sh"
    "FIX_DOPPELTE_SERVER.sh"
    "FIX_FIREWALL.sh"
    "FIX_IPTABLES.sh"
    "FIX_PUPPETEER_DEPS.sh"
    "FIX_REMAINING_DEPS.sh"
    "FIX_SERVER.sh"
    "FIX_WHATSAPP_COMPLETE.sh"
    "fix-appointment-api.sh"
    "EMERGENCY_FIX.sh"
    "COMPLETE_FIX.sh"
    "FINAL_CHECK.sh"
    
    # Install-Skripte
    "INSTALL_ALL_PUPPETEER_DEPS.sh"
    "INSTALL_MISSING_LIBS.sh"
    "INSTALL_PUPPETEER_ALL.sh"
    "INSTALL_PUPPETEER_DEPS_UBUNTU.sh"
    "INSTALL_PUPPETEER_DEPS.sh"
    "INSTALL_X11_LIBS.sh"
    
    # Setup/Update-Skripte
    "OPTIMIZE_IMAGES.sh"
    "FORCE_UPDATE.sh"
    "AUTO_SETUP_HTTPS.sh"
    "COMPLETE_WHATSAPP_SETUP.sh"
    "CHANGE_WHATSAPP_NUMBER.sh"
    "RESTART_WHATSAPP.sh"
    "SERVER_KOMPLETT_NEUSTART.sh"
    
    # Dokumentation
    "SSH_FIX.md"
    "SSH_KOMPLETT_FIX.md"
    "SSH_KONFIGURATION_HINZUFÜGEN.md"
    "SSH_PASSPHRASE_LÖSUNG.md"
    "SSH_PASSWORD_ENABLE.md"
    "SSH_TROUBLESHOOTING.md"
    "CMD_SSH_ANLEITUNG.md"
    "QUICK_UPLOAD.md"
    "UPLOAD_FILES_LIST.md"
    "UPLOAD_STRATO.md"
    "SCHNELL_SETUP.md"
    "SERVER_BEFEHLE_AUSFUEHREN.md"
    "SERVER_RESTART_BEFEHLE.md"
    "SERVER_SETUP_COMMANDS.md"
    "SERVER_UPDATE_BEFEHLE.md"
    "SERVER_UPDATE_SCHNELL.md"
    "SERVER_UPDATE_TERMINBUCHUNG.md"
    "GITHUB_CLONE_SERVER.md"
    "GITHUB_QUICKSTART.md"
    "GITHUB_UPLOAD_ANLEITUNG.md"
    "GOOGLE_ADS_CHECKLIST.md"
    "GOOGLE_ADS_SETUP_ANLEITUNG.md"
    "WHATSAPP_INITIALISIERUNG.md"
    "WHATSAPP_SETUP.md"
    "DEPLOY_CHECKLIST.md"
)

DELETED_COUNT=0
NOT_FOUND_COUNT=0

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "✅ Gelöscht: $file"
        ((DELETED_COUNT++))
    else
        echo "⚠️  Nicht gefunden: $file"
        ((NOT_FOUND_COUNT++))
    fi
done

echo ""
echo "📊 Zusammenfassung:"
echo "   ✅ Gelöscht: $DELETED_COUNT Dateien"
echo "   ⚠️  Nicht gefunden: $NOT_FOUND_COUNT Dateien"
echo ""
echo "✅ Fertig!"

