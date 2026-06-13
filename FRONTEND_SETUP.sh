#!/bin/bash
# Frontend Build & Setup for manitech.cloud

echo "Building React frontend..."

cd /var/www/ecommerce/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Check if build succeeded
if [ -d "dist" ]; then
    echo "✓ Frontend built successfully"
    echo "Build output directory: /var/www/ecommerce/frontend/dist"
    ls -la dist/
else
    echo "✗ Frontend build failed"
    exit 1
fi

echo ""
echo "Frontend setup complete!"
echo "Next: Run NGINX_SETUP.sh"
