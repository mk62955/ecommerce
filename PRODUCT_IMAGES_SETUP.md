# Product Images Setup Guide

## Overview

Images are stored in the **media folder** on the server, and the **file path is stored in the database**. This is the standard Django approach using `ImageField`.

## How It Works

1. **User uploads image** via Django admin
2. **Image saved to** `Backend/media/products/` folder
3. **File path stored in** Product model's `image` field
4. **API returns full image URL** via `image_url` field
5. **Frontend displays image** using the image_url

## Directory Structure

```
Backend/
├── media/                  ← Image files stored here
│   └── products/          ← Product images subdirectory
│       ├── image1.jpg
│       ├── image2.png
│       └── ...
├── Backend/
├── auth/
│   ├── settings.py        ← MEDIA_URL and MEDIA_ROOT configured
│   └── urls.py            ← Media file serving configured
├── products/
│   ├── models.py          ← Product model with ImageField
│   ├── admin.py           ← Admin interface with image upload
│   └── serializers.py     ← ProductSerializer with image_url
└── requirements.txt       ← Pillow dependency added
```

## Backend Setup (Already Done ✓)

### 1. Model Update
**File:** `Backend/products/models.py`

```python
class Product(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(
        upload_to='products/',
        blank=True,
        null=True,
        help_text="Product image"
    )
    # ... other fields
```

**Key points:**
- `upload_to='products/'` → Images saved to `media/products/`
- `blank=True, null=True` → Image is optional
- Django creates folders automatically

### 2. Serializer Update
**File:** `Backend/products/serializers.py`

```python
class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [..., 'image', 'image_url']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            image_url = obj.image.url
            if request:
                return request.build_absolute_uri(image_url)
            return image_url
        return None
```

**Why `image_url`?**
- Returns full URL like `http://127.0.0.1:8000/media/products/image.jpg`
- Frontend can display directly without path manipulation
- Works with both relative and absolute URLs

### 3. Settings Configuration
**File:** `Backend/auth/settings.py`

```python
MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

Already configured - no changes needed!

### 4. URL Configuration
**File:** `Backend/auth/urls.py`

```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

This serves media files during development (DEBUG=True).

**For production:** Use a web server (Nginx) or cloud storage (AWS S3).

### 5. Dependencies
**File:** `Backend/requirements.txt`

Added: `Pillow` - Required for image processing

```bash
pip install Pillow
```

## Frontend Setup (Already Done ✓)

### 1. ProductList Component
Shows product images in grid:
```jsx
{product.image_url ? (
  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
) : (
  <div>{product.id}</div>
)}
```

### 2. ProductDetail Component
Shows larger product image:
```jsx
{product.image_url ? (
  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
) : (
  <div>{product.id}</div>
)}
```

### 3. Cart Component
Shows thumbnail images:
```jsx
{item.product.image_url ? (
  <img src={item.product.image_url} alt={item.product.name} />
) : (
  <div>{item.product.id}</div>
)}
```

## Database Migration

Run these commands to update the database:

```bash
cd Backend

# Create migration
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

This adds the `image` field to the Product table.

## Uploading Images

### Via Django Admin

1. Go to `http://127.0.0.1:8000/admin/products/product/`
2. Click on a product to edit
3. In the "Product Information" section, click "Choose File" for the image field
4. Select an image from your computer
5. Click "Save"

**Supported formats:** JPG, PNG, GIF, WebP

**Recommended:**
- Max size: 5-10 MB
- Dimensions: 400x400 to 1000x1000 pixels
- Format: JPG (best compression) or PNG (supports transparency)

### Via API (Multipart Form Data)

```bash
curl -X POST http://127.0.0.1:8000/api/products/products/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Product Name" \
  -F "slug=product-name" \
  -F "category_id=1" \
  -F "price=99.99" \
  -F "stock=10" \
  -F "image=@/path/to/image.jpg"
```

## API Response Example

```json
{
  "id": 1,
  "name": "Denim Jacket",
  "slug": "denim-jacket",
  "description": "Classic denim jacket",
  "price": "79.99",
  "stock": 50,
  "is_available": true,
  "image": "/media/products/denim_jacket.jpg",
  "image_url": "http://127.0.0.1:8000/media/products/denim_jacket.jpg",
  "category": {
    "id": 2,
    "name": "Fashion",
    "slug": "fashion"
  },
  "created_at": "2026-06-12T10:30:00Z"
}
```

## Fallback Handling

If product has no image:
- `image_url` returns `null`
- Frontend displays product ID as placeholder
- No errors thrown

This ensures backward compatibility with products created before images were added.

## File Size Best Practices

| Use Case | Max Size | Format | Dimensions |
|----------|----------|--------|-----------|
| Product List | 100 KB | JPG | 400×400 px |
| Product Detail | 500 KB | JPG | 800×800 px |
| Cart Thumbnail | 50 KB | JPG | 200×200 px |
| High DPI (2x) | 200 KB | JPG | 800×800 px |

**Tips:**
- Use JPEG for photos (smaller file size)
- Use PNG for graphics with transparency
- Compress images before uploading
- Use tools like TinyPNG or ImageOptim

## Production Deployment

For production, you have several options:

### Option 1: Cloud Storage (Recommended)
Use **AWS S3**, **Google Cloud Storage**, or **Azure Blob Storage**
- Install: `pip install django-storages[s3]`
- Configure in settings.py to use S3 backend
- Images stored securely in cloud
- CDN integration for fast delivery

### Option 2: Web Server (Nginx)
- Configure Nginx to serve media files
- Images stored on server filesystem
- Requires manual backup strategy

### Option 3: Separate Media Server
- Use dedicated server for file storage
- CDN in front for caching
- Better scalability

## Troubleshooting

### Images not appearing?

1. **Check migration:**
   ```bash
   python manage.py migrate
   ```

2. **Check MEDIA_ROOT:**
   ```bash
   ls Backend/media/
   ```

3. **Check file permissions:**
   ```bash
   chmod 755 Backend/media/
   chmod 644 Backend/media/products/*
   ```

4. **Check URL:**
   - Image field: `/media/products/image.jpg`
   - Full URL: `http://127.0.0.1:8000/media/products/image.jpg`

5. **Check Pillow installed:**
   ```bash
   pip install Pillow
   ```

### Large files?

1. Add to settings.py:
   ```python
   # Max upload size: 100 MB
   DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600
   FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600
   ```

2. Compress images before upload

### "No such file or directory"?

Usually means `media` folder doesn't exist. Create it:
```bash
mkdir Backend/media
mkdir Backend/media/products
```

## Summary

✅ **Backend ready** - ImageField configured, admin interface set up, serializer returns image URLs
✅ **Frontend ready** - Components display images with fallbacks
✅ **Media serving** - Django serves files in development
✅ **Database** - Run migrations to add `image` field

**Next steps:**
1. Run migrations
2. Install Pillow: `pip install Pillow`
3. Restart Django server
4. Upload images via Django admin
5. Images appear in your e-commerce store!
