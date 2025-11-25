#!/bin/bash
# DNS-Fix Anleitung

echo "🔍 Server-IP-Adressen ermitteln"
echo "================================"
echo ""

# IPv4-Adresse
echo "📡 IPv4-Adresse des Servers:"
IPv4=$(curl -s -4 ifconfig.me)
echo "   $IPv4"
echo ""

# IPv6-Adresse
echo "📡 IPv6-Adresse des Servers:"
IPv6=$(curl -s -6 ifconfig.me 2>/dev/null || echo "Nicht verfügbar")
echo "   $IPv6"
echo ""

# Aktuelle DNS-Einstellungen
echo "🌐 Aktuelle DNS-Einstellungen:"
echo "   gutachtenruhr.de zeigt auf:"
dig +short gutachtenruhr.de A
echo "   www.gutachtenruhr.de zeigt auf:"
dig +short www.gutachtenruhr.de A
echo ""

echo "❌ PROBLEM: Domain zeigt NICHT auf Server-IP!"
echo ""
echo "✅ LÖSUNG:"
echo "=========="
echo ""
echo "1. Gehe zu Strato Kundencenter:"
echo "   https://www.strato.de/kundencenter/"
echo ""
echo "2. Gehe zu DNS-Verwaltung für gutachtenruhr.de"
echo ""
echo "3. Aktualisiere die A-Records:"
echo "   Name: @ (oder leer)"
echo "   Typ: A"
echo "   Wert: $IPv4"
echo "   TTL: 3600"
echo ""
echo "   Name: www"
echo "   Typ: A"
echo "   Wert: $IPv4"
echo "   TTL: 3600"
echo ""
echo "4. ENTFERNE oder DEAKTIVIERE alle AAAA-Records (IPv6)"
echo "   (Falls vorhanden)"
echo ""
echo "5. Warte 5-10 Minuten für DNS-Propagierung"
echo ""
echo "6. Prüfe dann mit:"
echo "   dig +short gutachtenruhr.de A"
echo "   (Sollte jetzt $IPv4 zeigen)"
echo ""
echo "7. Dann erneut Certbot ausführen:"
echo "   sudo certbot certonly --standalone -d www.gutachtenruhr.de -d gutachtenruhr.de --email info@kfzgutachter-heiken.de --agree-tos"
echo ""

