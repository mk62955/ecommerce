"""Image compression and optimization utilities."""

from PIL import Image, ImageEnhance, ImageOps
import io
from django.core.files.base import ContentFile


def optimize_product_image(image_file, quality=92, max_width=1600, max_height=1600):
    """
    Optimize product images for the storefront.

    This keeps visual quality high, gently improves sharpness/contrast, limits
    very large uploads, and stores the result as high-quality WebP.
    """
    if not image_file:
        return None

    try:
        image_file.seek(0)
        img = Image.open(image_file)
        img = ImageOps.exif_transpose(img)

        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA' if 'A' in img.getbands() else 'RGB')

        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

        if img.mode == 'RGB':
            img = ImageOps.autocontrast(img, cutoff=0.5)
            img = ImageEnhance.Contrast(img).enhance(1.04)

        img = ImageEnhance.Sharpness(img).enhance(1.08)

        output = io.BytesIO()
        img.save(
            output,
            format='WEBP',
            quality=quality,
            method=6
        )
        output.seek(0)

        original_filename = getattr(image_file, 'name', 'product-image')
        filename = original_filename.rsplit('.', 1)[0] + '.webp'
        return ContentFile(output.getvalue(), name=filename)

    except Exception as e:
        print(f"Error optimizing image: {e}")
        image_file.seek(0)
        return image_file


def compress_image(image_file, quality=92, max_width=1600, max_height=1600):
    """Backward-compatible wrapper for existing imports."""
    return optimize_product_image(image_file, quality, max_width, max_height)


def get_image_size_reduction(original_size, compressed_size):
    """
    Calculate compression ratio
    
    Returns:
        Dictionary with size info and reduction percentage
    """
    if original_size == 0:
        return {'original': 0, 'compressed': 0, 'reduction_percent': 0}
    
    reduction = ((original_size - compressed_size) / original_size) * 100
    
    return {
        'original_size_mb': round(original_size / (1024 * 1024), 2),
        'compressed_size_mb': round(compressed_size / (1024 * 1024), 2),
        'reduction_percent': round(reduction, 1)
    }
