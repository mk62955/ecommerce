#!/bin/bash
# Gunicorn Setup for manitech.cloud

echo "Setting up Gunicorn service..."

# Create socket file
sudo tee /etc/systemd/system/gunicorn.socket > /dev/null << 'EOF'
[Unit]
Description=gunicorn socket for manitech.cloud
Before=gunicorn.service

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
EOF

# Create service file
sudo tee /etc/systemd/system/gunicorn.service > /dev/null << 'EOF'
[Unit]
Description=gunicorn daemon for manitech.cloud
Requires=gunicorn.socket
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/ecommerce/Backend
ExecStart=/var/www/ecommerce/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/run/gunicorn.sock \
    auth.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# Enable and start services
sudo systemctl daemon-reload
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
sudo systemctl start gunicorn.service
sudo systemctl enable gunicorn.service

echo "✓ Gunicorn service created and started"
echo "Check status: sudo systemctl status gunicorn.service"
