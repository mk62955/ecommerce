from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import (
    urlsafe_base64_encode,
    urlsafe_base64_decode
)

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny
)

from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
    ProfileSerializer,
    UpdateProfileSerializer
)

from .tokens import (
    email_verification_token
)

from .utils import (
    send_verification_email_async,
    send_reset_password_email
)

from rest_framework_simplejwt.tokens import (
    RefreshToken
)



class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        token = (
            email_verification_token
            .make_token(user)
        )

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://127.0.0.1:5173')
        verify_url = (
            f"{frontend_url}"
            f"/verify-email/{uid}/{token}"
        )

        send_verification_email_async(
            user.first_name or user.email,
            user.email,
            verify_url
        )

        return Response(
            {
                "message":
                "Registration successful. "
                "Check your email."
            },
            status=status.HTTP_201_CREATED
        )
    



class VerifyEmailView(APIView):

    permission_classes = [AllowAny]

    def get(
        self,
        request,
        uid,
        token
    ):

        try:

            user_id = (
                urlsafe_base64_decode(uid)
                .decode()
            )

            user = User.objects.get(
                pk=user_id
            )

        except Exception:

            return Response(
                {
                    "error":
                    "Invalid link"
                },
                status=400
            )

        if user.is_verified:
            return Response(
                {
                    "message": "Your email has already been verified! You can log in now."
                }
            )

        valid = (
            email_verification_token
            .check_token(
                user,
                token
            )
        )

        if not valid:

            return Response(
                {
                    "error":
                    "Token invalid"
                },
                status=400
            )

        user.is_verified = True
        user.save()

        try:
            send_mail(
                subject="Account Verified Successfully",
                message=f"Hello {user.first_name or user.email},\n\nYour account has been successfully verified! You can now log in and start shopping.\n\nThank you!",
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@127.0.0.1'),
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(
            {
                "message":
                "Email verified successfully"
            }
        )
    



class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data[
            "user"
        ]

        refresh = RefreshToken.for_user(
            user
        )

        return Response(
            {
                "refresh":
                str(refresh),

                "access":
                str(refresh.access_token),

                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name":
                    user.first_name,
                    "last_name":
                    user.last_name,
                    "is_admin": user.is_staff and user.is_superuser
                }
            }
        )
    

class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)

            uid = urlsafe_base64_encode(
                force_bytes(user.pk)
            )

            token = (
                PasswordResetTokenGenerator()
                .make_token(user)
            )

            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://127.0.0.1:5173')
            reset_url = (
                f"{frontend_url}/reset-password/"
                f"?uid={uid}&token={token}"
            )

            # SEND TO USER EMAIL
            try:
                send_reset_password_email(
                    user.first_name,
                    user.email,
                    reset_url,
                )
            except Exception as e:
                return Response(
                    {"error": f"Failed to send email: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(
                {
                    "message": (
                        "Password reset link sent "
                        "to your email."
                    )
                },
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {
                    "message": (
                        "If the email exists, "
                        "a reset link has been sent."
                    )
                },
                status=status.HTTP_200_OK,
            )   




class ResetPasswordView(
    APIView
):

    permission_classes = [AllowAny]

    def post(
        self,
        request
    ):

        serializer = (
            ResetPasswordSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data[
            "user"
        ]

        user.set_password(
            serializer.validated_data[
                "password"
            ]
        )

        user.save()

        return Response(
            {
                "message":
                "Password reset successful"
            }
        )
    


class ChangePasswordView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request
    ):

        serializer = (
            ChangePasswordSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        old_password = (
            serializer.validated_data[
                "old_password"
            ]
        )

        new_password = (
            serializer.validated_data[
                "new_password"
            ]
        )

        user = request.user

        if not user.check_password(
            old_password
        ):

            return Response(
                {
                    "error":
                    "Old password incorrect"
                },
                status=400
            )

        user.set_password(
            new_password
        )

        user.save()

        return Response(
            {
                "message":
                "Password changed"
            }
        )
    



class ProfileView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request
    ):

        serializer = (
            ProfileSerializer(
                request.user
            )
        )

        return Response(
            serializer.data
        )
    


class UpdateProfileView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def put(
        self,
        request
    ):

        serializer = (
            UpdateProfileSerializer(
                request.user,
                data=request.data,
                partial=True
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )
    




class RefreshTokenView(APIView):

    def post(self, request):

        refresh_token = request.data.get(
            "refresh"
        )

        try:

            refresh = RefreshToken(
                refresh_token
            )

            return Response(
                {
                    "access":
                    str(
                        refresh.access_token
                    )
                }
            )

        except Exception:

            return Response(
                {
                    "error":
                    "Invalid refresh token"
                },
                status=400
            )
        

class LogoutView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        try:

            refresh_token = request.data.get(
                "refresh"
            )

            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

            return Response(
                {
                    "message":
                    "Logged out"
                }
            )

        except Exception:

            return Response(
                {
                    "error":
                    "Invalid token"
                },
                status=400
            )
        
