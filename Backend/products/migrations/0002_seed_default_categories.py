from django.db import migrations


DEFAULT_CATEGORIES = [
    {
        "name": "Fashion",
        "slug": "fashion",
        "subtitle": "Clothing, accessories, and style essentials.",
        "description": "Fashion products for the storefront.",
    },
    {
        "name": "Electronics",
        "slug": "electronics",
        "subtitle": "Devices, gadgets, and useful tech.",
        "description": "Electronics products for the storefront.",
    },
    {
        "name": "Home",
        "slug": "home",
        "subtitle": "Home products, decor, and everyday essentials.",
        "description": "Home products for the storefront.",
    },
    {
        "name": "Appliances",
        "slug": "appliances",
        "subtitle": "Appliances for daily use.",
        "description": "Appliances products for the storefront.",
    },
]


def seed_default_categories(apps, schema_editor):
    Category = apps.get_model("products", "Category")

    for category_data in DEFAULT_CATEGORIES:
        category = (
            Category.objects.filter(slug=category_data["slug"]).first()
            or Category.objects.filter(name__iexact=category_data["name"]).first()
        )

        if category:
            for field, value in category_data.items():
                setattr(category, field, value)
            category.save()
        else:
            Category.objects.create(**category_data)


def remove_default_categories(apps, schema_editor):
    Category = apps.get_model("products", "Category")
    Category.objects.filter(
        slug__in=[category["slug"] for category in DEFAULT_CATEGORIES]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_default_categories, remove_default_categories),
    ]
