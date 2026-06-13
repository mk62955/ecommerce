#!/bin/bash
# Deployment Script for manitech.cloud
# This script sets up the entire VPS for Django + React deployment

set -e  # Exit on error

echo "=========================================="
echo "Deploying manitech.cloud"
echo "=========================================="

# Update system
echo "[1/10] Updating system packages..."
apt update && apt upgrade -y

# Install dependencies
echo "[2/10] Installing required packages..."
apt install -y python3 python3-pip python3-venv git curl wget nginx mysql-server supervisor

# Install Node.js
echo "[3/10] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Setup MySQL Database
echo "[4/10] Setting up MySQL database..."
sudo mysql << EOF
CREATE DATABASE IF NOT EXISTS ecommerce_db;
CREATE USER IF NOT EXISTS 'ecommerce_user'@'localhost' IDENTIFIED BY 'Mkm62955aA@#&';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Clone repository
echo "[5/10] Cloning your repository..."
cd /var/www
git clone https://github.com/mk62955/ecommerce.git
cd ecommerce

# Setup Python virtual environment
echo "[6/10] Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

# Install Python dependencies
echo "[7/10] Installing Python packages..."
cd Backend
pip install -r requirements.txt
pip install gunicorn

# Create .env file for production
echo "[8/10] Creating .env file..."
cat > .env << 'ENVFILE'
SECRET_KEY=your-django-secret-key-here
DEBUG=False
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=Mkm62955aA@#&
DB_HOST=localhost
DB_PORT=3306
EMAIL_HOST_USER=dannyparker120@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
FRONTEND_URL=https://manitech.cloud
ENVFILE

echo "⚠️  UPDATE YOUR .env FILE:"
echo "   - Replace EMAIL_HOST_PASSWORD with your Gmail App Password"
echo "   - Run: nano /var/www/ecommerce/Backend/.env"

# Run migrations
echo "[9/10] Running database migrations..."
python manage.py migrate
python manage.py collectstatic --noinput

echo "[10/10] Deployment script complete!"
echo ""
echo "=========================================="
echo "NEXT STEPS:"
echo "=========================================="
echo "1. Update email password in .env:"
echo "   nano /var/www/ecommerce/Backend/.env"
echo ""
echo "2. Create superuser:"
echo "   cd /var/www/ecommerce/Backend"
echo "   source ../venv/bin/activate"
echo "   python manage.py createsuperuser"
echo ""
echo "3. Setup Gunicorn service (see GUNICORN_SETUP.sh)"
echo "4. Build frontend (see FRONTEND_SETUP.sh)"
echo "5. Configure Nginx (see NGINX_SETUP.sh)"
echo "6. Setup SSL (see SSL_SETUP.sh)"
echo "=========================================="
