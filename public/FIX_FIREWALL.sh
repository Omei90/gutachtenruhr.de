#!/bin/bash
# Firewall-Regeln explizit setzen

echo "🔥 Firewall-Regeln korrigieren..."
echo ""

# Aktiviere Firewall
sudo ufw --force enable

# Entferne alle Regeln (außer SSH) und setze neu
echo "📋 Aktuelle Firewall-Regeln:"
sudo ufw status numbered
echo ""

# Setze explizit die benötigten Regeln
echo "🔧 Setze Firewall-Regeln..."
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Reload Firewall
sudo ufw reload

echo ""
echo "✅ Firewall-Regeln gesetzt!"
echo ""
echo "📋 Neue Firewall-Regeln:"
sudo ufw status verbose
echo ""

