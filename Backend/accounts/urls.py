from django.urls import path

from .views import (
    LogoutView,
    RefreshTokenView,
    RegisterView,
    VerifyEmailView,
    LoginView,
    ForgotPasswordView,
    ResetPasswordView,
    ChangePasswordView,
    ProfileView,
    UpdateProfileView
)

urlpatterns = [

    path(
        "register/",
        RegisterView.as_view()
    ),

    path(
        "verify-email/<uid>/<token>/",
        VerifyEmailView.as_view()
    ),

    path(
        "login/",
        LoginView.as_view()
    ),

    path(
        "forgot-password/",
        ForgotPasswordView.as_view()
    ),

    path(
        "reset-password/",
        ResetPasswordView.as_view()
    ),

    path(
        "change-password/",
        ChangePasswordView.as_view()
    ),

    path(
        "profile/",
        ProfileView.as_view()
    ),

    path(
        "profile/update/",
        UpdateProfileView.as_view()
    ),
    path(
    "refresh/",
    RefreshTokenView.as_view()
    ),
    path(
        "logout/",
        LogoutView.as_view()
    ),
]