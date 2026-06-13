#!/bin/bash
# Nginx Configuration for manitech.cloud

echo "Configuring Nginx..."

# Create Nginx config
sudo tee /etc/nginx/sites-available/manitech > /dev/null << 'EOF'
upstream gunicorn {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name manitech.cloud www.manitech.cloud;
    client_max_body_size 100M;

    # Frontend - React
    location / {
        root /var/www/ecommerce/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend - API
    location /api/ {
        proxy_pass http://gunicorn;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin panel
    location /admin/ {
        proxy_pass http://gunicorn;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files
    location /static/ {
        alias /var/www/ecommerce/Backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /var/www/ecommerce/Backend/media/;
    }
}
EOF

# Enable the config
sudo ln -sf /etc/nginx/sites-available/manitech /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration has errors"
    exit 1
fi

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✓ Nginx configured and restarted"
echo ""
echo "Next: Run SSL_SETUP.sh to add HTTPS"
