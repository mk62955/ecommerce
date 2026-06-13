# Deployment Guide: Django + React on Ubuntu VPS (HostLinker)

## Prerequisites
- SSH access to your VPS
- Root or sudo privileges
- Your domain name

## Step 1: Initial Server Setup

### Connect to VPS
```bash
ssh root@your_vps_ip
```

### Update System
```bash
apt update && apt upgrade -y
```

### Install Required Packages
```bash
apt install -y python3 python3-pip python3-venv git curl wget nginx mysql-server supervisor
```

### Install Node.js (for frontend)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

---

## Step 2: Setup Database (MySQL)

```bash
# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 3: Deploy Backend (Django)

### Create App Directory
```bash
mkdir -p /var/www/ecommerce
cd /var/www/ecommerce
```

### Clone Repository
```bash
git clone your_repo_url .
# or upload files via SCP/SFTP
```

### Setup Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r Backend/requirements.txt
```

### Update Django Settings
Edit `Backend/auth/settings.py`:

```python
# Set production values
DEBUG = False
ALLOWED_HOSTS = ['your_domain.com', 'www.your_domain.com', 'your_vps_ip']

# Update database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ecommerce_db',
        'USER': 'ecommerce_user',
        'PASSWORD': 'your_strong_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://your_domain.com",
    "https://www.your_domain.com",
]

# Frontend URL for email verification
FRONTEND_URL = "https://your_domain.com"
```

### Create .env file
```bash
cd /var/www/ecommerce/Backend
cat > .env << EOF
SECRET_KEY=your_django_secret_key
DEBUG=False
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=your_strong_password
DB_HOST=localhost
DB_PORT=3306
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
EOF
```

### Run Migrations
```bash
cd /var/www/ecommerce/Backend
source ../venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

---

## Step 4: Setup Gunicorn

### Install Gunicorn
```bash
source /var/www/ecommerce/venv/bin/activate
pip install gunicorn
```

### Create Gunicorn Socket Service
```bash
sudo cat > /etc/systemd/system/gunicorn.socket << EOF
[Unit]
Description=gunicorn socket
Before=gunicorn.service

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
EOF
```

### Create Gunicorn Service
```bash
sudo cat > /etc/systemd/system/gunicorn.service << EOF
[Unit]
Description=gunicorn daemon
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
```

### Enable Gunicorn
```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
sudo systemctl start gunicorn.service
sudo systemctl enable gunicorn.service
```

---

## Step 5: Build & Deploy Frontend (React)

### Build React App
```bash
cd /var/www/ecommerce/frontend
npm install
npm run build
```

### Serve with Nginx (see next step)

---

## Step 6: Configure Nginx

### Create Nginx Config
```bash
sudo cat > /etc/nginx/sites-available/ecommerce << 'EOF'
upstream gunicorn {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

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
```

### Enable Nginx Config
```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: Setup SSL Certificate (Free with Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

Certbot will automatically renew. To verify:
```bash
sudo certbot renew --dry-run
```

---

## Step 8: Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/ecommerce
sudo chmod -R 755 /var/www/ecommerce
sudo chmod -R 775 /var/www/ecommerce/Backend/media
sudo chmod -R 775 /var/www/ecommerce/Backend/staticfiles
```

---

## Step 9: Monitor & Logs

### View Django Logs
```bash
sudo journalctl -u gunicorn.service -f
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Services if Needed
```bash
sudo systemctl restart gunicorn.service
sudo systemctl restart nginx
```

---

## Troubleshooting

### If pages are not loading:
```bash
# Check Nginx config
sudo nginx -t

# Check Gunicorn socket
ls -l /run/gunicorn.sock

# Check file permissions
ls -l /var/www/ecommerce/
```

### If React app shows 404:
- Ensure `npm run build` completed
- Check `frontend/dist` folder exists
- Verify Nginx location block

### If API calls fail:
- Check CORS settings in Django
- Verify FRONTEND_URL in settings.py matches your domain
- Check Gunicorn is running: `sudo systemctl status gunicorn.service`

---

## Quick Reference Commands

```bash
# SSH into VPS
ssh root@your_vps_ip

# Check service status
sudo systemctl status gunicorn.service
sudo systemctl status nginx
sudo systemctl status mysql

# Restart services
sudo systemctl restart gunicorn.service
sudo systemctl restart nginx

# Activate venv and run commands
cd /var/www/ecommerce
source venv/bin/activate
cd Backend
python manage.py migrate

# Pull latest code
cd /var/www/ecommerce
git pull origin main
source venv/bin/activate
cd Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn.service
```

---

## Next Steps

1. Update your DNS settings to point to your VPS IP
2. Test API endpoints: `https://your_domain.com/api/...`
3. Test Django admin: `https://your_domain.com/admin/`
4. Monitor logs for any issues
5. Setup backups for database and media files

Happy deployment! 🚀
