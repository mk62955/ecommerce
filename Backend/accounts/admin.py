from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    model = User

    list_display = (
        "id",
        "email",
        "is_verified",
        "is_staff",
        "is_active"
    )

    ordering = ("email",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password"
                )
            }
        ),
        (
            "Personal Info",
            {
                "fields": (
                    "first_name",
                    "last_name"
                )
            }
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_verified",
                    "groups",
                    "user_permissions"
                )
            }
        ),
    )

    add_fieldsets = (
    (
        None,
        {
            "classes": ("wide",),
            "fields": (
                "email",
                "first_name",
                "last_name",
                "password1",
                "password2",
            ),
        },
    ),)

    search_fields = (
        "email",
    )