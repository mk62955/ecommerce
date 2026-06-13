# Deployment Guide: manitech.cloud (Django + React)

## 📋 Your Setup
- **Domain:** manitech.cloud
- **Server:** Ubuntu VPS (HostLinker)
- **Backend:** Django + Gunicorn
- **Frontend:** React + Vite
- **Database:** MySQL
- **Reverse Proxy:** Nginx

---

## ✅ Step-by-Step Deployment

### Step 1: Prepare Your Environment Variables

Create `.env` file in `Backend/` directory with these values:

```bash
SECRET_KEY=your_django_secret_key_here
DEBUG=False
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=your_strong_mysql_password
DB_HOST=localhost
DB_PORT=3306
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_specific_password
```

**For Gmail:**
- Use 2FA enabled Gmail account
- Generate App Password: https://myaccount.google.com/apppasswords
- Use the generated password, not your real Gmail password

### Step 2: Update Django Settings

Update `Backend/auth/settings.py`:

```python
# Line: DEBUG
DEBUG = False

# Line: ALLOWED_HOSTS
ALLOWED_HOSTS = [
    'manitech.cloud',
    'www.manitech.cloud',
    'your_vps_ip_here'  # temporary, for testing
]

# Line: CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS = [
    "https://manitech.cloud",
    "https://www.manitech.cloud",
]

# Line: FRONTEND_URL (for email verification links)
FRONTEND_URL = "https://manitech.cloud"

# Line: STATIC_ROOT
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Line: MEDIA_ROOT  
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

### Step 3: VPS Setup & Deployment

SSH into your VPS:
```bash
ssh root@your_vps_ip
```

#### A. Update System
```bash
apt update && apt upgrade -y
apt install -y python3 python3-pip python3-venv git curl nginx mysql-server
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
```

#### B. Setup MySQL Database
```bash
sudo mysql
```

```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'your_strong_mysql_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### C. Deploy Backend
```bash
cd /var/www
git clone your_github_repo_url ecommerce
cd ecommerce

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

# Install dependencies
cd Backend
pip install -r requirements.txt
pip install gunicorn

# Create .env file (use nano or vim)
nano .env
# Paste the .env content from Step 1

# Run migrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # Create admin account
```

#### D. Setup Gunicorn Service
```bash
sudo nano /etc/systemd/system/gunicorn.socket
```

Paste:
```ini
[Unit]
Description=gunicorn socket
Before=gunicorn.service

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
```

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

Paste:
```ini
[Unit]
Description=gunicorn daemon for ecommerce
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
```

```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
sudo systemctl start gunicorn.service
sudo systemctl enable gunicorn.service
```

#### E. Build & Deploy Frontend
```bash
cd /var/www/ecommerce/frontend
npm install
npm run build
```

#### F. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/manitech
```

Paste:
```nginx
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

    # Backend - Accounts API
    location /accounts/ {
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
```

```bash
sudo ln -s /etc/nginx/sites-available/manitech /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null
sudo nginx -t
sudo systemctl restart nginx
```

#### G. Setup SSL Certificate (Free)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d manitech.cloud -d www.manitech.cloud
```

This will automatically update your Nginx config with HTTPS!

#### H. Set Proper Permissions
```bash
sudo chown -R www-data:www-data /var/www/ecommerce
sudo chmod -R 755 /var/www/ecommerce
sudo chmod -R 775 /var/www/ecommerce/Backend/media
```

---

## 🌐 Configure DNS

In your domain registrar (where you bought manitech.cloud):

1. Go to DNS Settings
2. Add an **A Record**:
   - **Name:** @ (or leave blank)
   - **Type:** A
   - **Value:** your_vps_ip_address
   - **TTL:** 3600

3. Add an **A Record** for www:
   - **Name:** www
   - **Type:** A
   - **Value:** your_vps_ip_address
   - **TTL:** 3600

Wait 5-10 minutes for DNS to propagate.

---

## ✨ Testing

After everything is deployed:

1. **Test Frontend:** https://manitech.cloud
2. **Test API:** https://manitech.cloud/api/auth/login/
3. **Test Admin:** https://manitech.cloud/admin/

---

## 🔧 Useful Commands

```bash
# SSH into VPS
ssh root@your_vps_ip

# Check service status
sudo systemctl status gunicorn.service
sudo systemctl status nginx

# View logs
sudo journalctl -u gunicorn.service -f
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart gunicorn.service
sudo systemctl restart nginx

# Pull latest code and deploy
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

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check `sudo systemctl status gunicorn.service` |
| 404 on frontend | Ensure `npm run build` completed, check `/var/www/ecommerce/frontend/dist` exists |
| Static files not loading | Run `python manage.py collectstatic --noinput` |
| API CORS error | Update `CORS_ALLOWED_ORIGINS` in settings.py |
| Email not sending | Check `.env` credentials, enable Less Secure Apps for Gmail |

---

## 🎯 Next Steps

1. ✅ Update local settings.py with domain
2. ✅ Create .env file
3. ✅ SSH into VPS and follow Step 3 (A-H)
4. ✅ Update DNS records
5. ✅ Test endpoints

**Ready to deploy?** 🚀
