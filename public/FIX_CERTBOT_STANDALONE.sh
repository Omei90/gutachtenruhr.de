#!/bin/bash
# Certbot im Standalone-Modus (ohne Nginx-Plugin)

echo "🔒 Certbot Setup im Standalone-Modus"
echo "======================================"
echo ""

# Stoppe Nginx temporär (Certbot braucht Port 80)
echo "⏸️  Stoppe Nginx temporär..."
sudo systemctl stop nginx

# Certbot im Standalone-Modus
echo "🔐 Starte Certbot im Standalone-Modus..."
echo "   (Dieser Modus verwendet Port 80 direkt, ohne Nginx)"
echo ""

sudo certbot certonly --standalone -d www.gutachtenruhr.de -d gutachtenruhr.de --email info@kfzgutachter-heiken.de --agree-tos --non-interactive

# Prüfe ob Zertifikat erstellt wurde
if [ -f "/etc/letsencrypt/live/www.gutachtenruhr.de/fullchain.pem" ]; then
    echo ""
    echo "✅ SSL-Zertifikat erfolgreich erstellt!"
    
    # Starte Nginx wieder
    echo "▶️  Starte Nginx wieder..."
    sudo systemctl start nginx
    
    # Aktualisiere Nginx-Konfiguration für HTTPS
    echo "📝 Aktualisiere Nginx-Konfiguration für HTTPS..."
    
    NGINX_CONF="/etc/nginx/sites-available/gutachtenruhr"
    
    # Erstelle HTTPS-Server-Block
    sudo tee -a "$NGINX_CONF" > /dev/null <<EOF

# HTTPS Server Block
server {
    listen 443 ssl http2;
    server_name gutachtenruhr.de www.gutachtenruhr.de;

    # SSL-Zertifikate
    ssl_certificate /etc/letsencrypt/live/www.gutachtenruhr.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.gutachtenruhr.de/privkey.pem;
    
    # SSL-Konfiguration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/gutachtenruhr-access.log;
    error_log /var/log/nginx/gutachtenruhr-error.log;

    # Max Upload Size
    client_max_body_size 10M;

    # Statische Dateien direkt servieren
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|json|xml|txt)$ {
        root /var/www/gutachtenruhr/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Alle anderen Requests an Node.js weiterleiten
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}

# HTTP zu HTTPS Redirect
server {
    listen 80;
    server_name gutachtenruhr.de www.gutachtenruhr.de;
    return 301 https://\$host\$request_uri;
}
EOF

    # Teste Nginx-Konfiguration
    echo "🧪 Teste Nginx-Konfiguration..."
    if sudo nginx -t; then
        echo "✅ Nginx-Konfiguration ist gültig"
        echo "🔄 Lade Nginx neu..."
        sudo systemctl reload nginx
        echo ""
        echo "✅ HTTPS ist jetzt aktiv!"
        echo "🌐 Ihre Seite ist über https://www.gutachtenruhr.de erreichbar"
    else
        echo "❌ Nginx-Konfiguration hat Fehler!"
        echo "   Bitte prüfe die Konfiguration manuell"
    fi
else
    echo ""
    echo "❌ SSL-Zertifikat konnte nicht erstellt werden"
    echo "   Bitte prüfe die Fehlermeldungen oben"
    
    # Starte Nginx wieder
    sudo systemctl start nginx
fi

