from django.contrib.auth import authenticate
from django.contrib.auth.tokens import (
    PasswordResetTokenGenerator
)
from django.utils.encoding import force_str
from django.utils.http import (
    urlsafe_base64_decode
)

from rest_framework import serializers

from .models import User



class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True,min_length=8)

    class Meta:
        model = User

        fields = (
            "email",
            "first_name",
            "last_name",
            "password",
        )

    def create(self,validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get(
                "first_name",
                ""
            ),
            last_name=validated_data.get(
                "last_name",
                ""
            ),
        )
    


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField()

    def validate(self, attrs):

        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid credentials"
            )

        if not user.check_password(
            password
        ):
            raise serializers.ValidationError(
                "Invalid credentials"
            )

        attrs["user"] = user

        return attrs


class ForgotPasswordSerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    def validate_email(
        self,
        value
    ):

        if not User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "User not found"
            )

        return value
    



class ResetPasswordSerializer(
    serializers.Serializer
):

    uid = serializers.CharField()

    token = serializers.CharField()

    password = serializers.CharField(
        min_length=8
    )

    def validate(
        self,
        attrs
    ):

        try:

            user_id = force_str(
                urlsafe_base64_decode(
                    attrs["uid"]
                )
            )

            user = User.objects.get(
                pk=user_id
            )

        except Exception:

            raise serializers.ValidationError(
                "Invalid user"
            )

        token_valid = (
            PasswordResetTokenGenerator()
            .check_token(
                user,
                attrs["token"]
            )
        )

        if not token_valid:

            raise serializers.ValidationError(
                "Invalid token"
            )

        attrs["user"] = user

        return attrs
    



class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)




class ProfileSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = User

        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "is_verified",
            "created_at",
        )

        read_only_fields = (
            "email",
            "is_verified",
            "created_at",
        )




class UpdateProfileSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = User

        fields = (
            "first_name",
            "last_name",
        )



