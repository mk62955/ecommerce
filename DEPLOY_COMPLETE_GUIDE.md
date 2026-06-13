# Complete Deployment Guide: manitech.cloud
## VPS IP: 72.61.250.241 | Domain: manitech.cloud | GitHub: mk62955/ecommerce

---

## 📋 Pre-Deployment Checklist

Before you deploy, complete these:

### 1. Gmail App Password (Required for Email)
Your email: **dannyparker120@gmail.com**

**Steps to generate App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password like: `xxxx xxxx xxxx xxxx`
4. Copy this password (without spaces)
5. You'll paste it in .env during deployment

### 2. Generate Django Secret Key
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy the output and save it.

### 3. Update Your .env Locally (IMPORTANT!)
Edit: `Backend/.env`
```
SECRET_KEY=paste_your_generated_secret_key_here
EMAIL_HOST_PASSWORD=your_16_char_app_password_here
```

### 4. Commit Changes to GitHub
```bash
git add .
git commit -m "Update settings for production deployment"
git push origin main
```

---

## 🚀 Deployment Steps

### Step 1: Update DNS (5-10 min to propagate)

In your domain registrar (where you bought manitech.cloud):

1. Go to **DNS Settings**
2. Find **A Records** section
3. Add or update:
   - **Host:** @ (or leave blank)
   - **Type:** A
   - **Value:** 72.61.250.241
   - **TTL:** 3600

4. Add for www subdomain:
   - **Host:** www
   - **Type:** A
   - **Value:** 72.61.250.241
   - **TTL:** 3600

**Save and wait 5-10 minutes** for DNS to propagate.

### Step 2: SSH into VPS

```bash
ssh root@72.61.250.241
```

When prompted for password, enter your VPS password.

### Step 3: Set Proper Permissions

```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/ecommerce
sudo chmod -R 755 /var/www/ecommerce

# Media folder needs write permissions
sudo chmod -R 775 /var/www/ecommerce/Backend/media
sudo chmod -R 775 /var/www/ecommerce/Backend/staticfiles
```

### Step 4: Run Main Deployment Script

```bash
cd /var/www/ecommerce
bash DEPLOYMENT_SETUP.sh
```

This will:
- ✓ Update system packages
- ✓ Install Python, Node.js, MySQL, Nginx
- ✓ Clone your GitHub repo
- ✓ Setup Python virtual environment
- ✓ Install all dependencies
- ✓ Create MySQL database
- ✓ Run migrations

### Step 5: Update .env with Gmail Password

```bash
nano /var/www/ecommerce/Backend/.env
```

Find this line:
```
EMAIL_HOST_PASSWORD=your_gmail_app_password
```

Replace with your 16-character Gmail App Password (without spaces).

Press `Ctrl+O`, `Enter`, `Ctrl+X` to save and exit.

### Step 6: Create Django Superuser

```bash
cd /var/www/ecommerce/Backend
source ../venv/bin/activate
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

### Step 7: Setup Gunicorn

```bash
bash /var/www/ecommerce/GUNICORN_SETUP.sh
```

Verify it's running:
```bash
sudo systemctl status gunicorn.service
```

### Step 8: Build & Deploy Frontend

```bash
bash /var/www/ecommerce/FRONTEND_SETUP.sh
```

This will build your React app for production.

### Step 9: Configure Nginx

```bash
bash /var/www/ecommerce/NGINX_SETUP.sh
```

Test by visiting: `http://manitech.cloud` (should work but not HTTPS yet)

### Step 10: Setup SSL Certificate (Free)

```bash
bash /var/www/ecommerce/SSL_SETUP.sh
```

You'll be prompted to:
1. Enter your email
2. Agree to Let's Encrypt terms

Once complete, your site will be **HTTPS enabled** ✅

---

## ✅ Testing After Deployment

### 1. Test Frontend
```
https://manitech.cloud
https://www.manitech.cloud
```
Should show your React app homepage.

### 2. Test API
```
https://manitech.cloud/api/auth/login/
```
Should return a JSON response (might show 405 Method Not Allowed, that's fine).

### 3. Test Admin Panel
```
https://manitech.cloud/admin/
```
Should show Django admin login. Use the superuser credentials you created.

### 4. Test Email Verification
- Go to `https://manitech.cloud`
- Register a new account
- Check your email for verification link
- Click the link to verify

---

## 🔧 Useful Commands for Future Maintenance

### Check Service Status
```bash
sudo systemctl status gunicorn.service
sudo systemctl status nginx
sudo systemctl status mysql
```

### View Logs
```bash
# Django logs
sudo journalctl -u gunicorn.service -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Restart Services
```bash
sudo systemctl restart gunicorn.service
sudo systemctl restart nginx
```

### Deploy New Code Changes
```bash
cd /var/www/ecommerce
git pull origin main
source venv/bin/activate
cd Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn.service
```

### Renew SSL Certificate
```bash
sudo certbot renew
```

---

## ❌ Troubleshooting

### 502 Bad Gateway Error
**Problem:** Gunicorn isn't running or socket issue

**Solution:**
```bash
sudo systemctl restart gunicorn.service
sudo journalctl -u gunicorn.service -f
```

### Frontend showing 404
**Problem:** React build didn't complete

**Solution:**
```bash
cd /var/www/ecommerce/frontend
npm run build
ls -la dist/  # Should show files
```

### Email not sending
**Problem:** Gmail App Password incorrect or not set

**Solution:**
```bash
# Check .env file
cat /var/www/ecommerce/Backend/.env | grep EMAIL

# Update if needed
nano /var/www/ecommerce/Backend/.env
sudo systemctl restart gunicorn.service
```

### Database connection error
**Problem:** MySQL not running or credentials wrong

**Solution:**
```bash
sudo systemctl restart mysql
# Test connection:
mysql -u ecommerce_user -p ecommerce_db
# Enter password: Mkm62955aA@#&
```

### Static files not loading
**Problem:** collectstatic not run properly

**Solution:**
```bash
cd /var/www/ecommerce/Backend
source ../venv/bin/activate
python manage.py collectstatic --noinput --clear
sudo systemctl restart gunicorn.service
```

---

## 📞 Support Information

**Your Setup Details:**
- Domain: manitech.cloud
- VPS IP: 72.61.250.241
- GitHub Repo: https://github.com/mk62955/ecommerce.git
- Admin Email: dannyparker120@gmail.com
- Database: ecommerce_db
- DB User: ecommerce_user

---

## ✨ Deployment Complete!

Once everything is working:
1. Your React app is live at https://manitech.cloud
2. Your API is available at https://manitech.cloud/api/
3. Your admin panel is at https://manitech.cloud/admin/
4. Email verification is working
5. SSL certificate auto-renews

Congratulations! 🎉
