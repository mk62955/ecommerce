from django.conf import settings
from django.core.mail import send_mail
import threading


def send_verification_email(
    firstname,
    email,
    verification_url
):

    subject = "Verify Your Email"

    message = f"""
Hello {firstname},

Please verify your email by clicking
the link below.

{verification_url}

If you did not register,
ignore this email.
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )


def send_verification_email_async(
    firstname,
    email,
    verification_url
):
    """Send verification email asynchronously without blocking the request"""
    thread = threading.Thread(
        target=send_verification_email,
        args=(firstname, email, verification_url),
        daemon=True
    )
    thread.start()


def send_reset_password_email(
    firstname,
    email,
    reset_url
):

    subject = "Reset Password"

    message = f"""
Hello {firstname},

Click the link below to reset
your password.

{reset_url}

If you didn't request this,
ignore this email.
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )