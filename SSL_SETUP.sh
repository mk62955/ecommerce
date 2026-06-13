#!/bin/bash
# SSL Certificate Setup for manitech.cloud (Let's Encrypt)

echo "Setting up free SSL certificate..."

# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
echo "Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d manitech.cloud -d www.manitech.cloud

echo "✓ SSL certificate installed!"
echo ""
echo "Your site is now protected with HTTPS:"
echo "  https://manitech.cloud"
echo "  https://www.manitech.cloud"
echo ""
echo "The certificate will auto-renew in 90 days."
echo "To manually renew: sudo certbot renew"
echo "To test renewal: sudo certbot renew --dry-run"
