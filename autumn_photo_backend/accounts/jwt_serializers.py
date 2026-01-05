# accounts/jwt_serializers.py

from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["email"], password=data["password"])

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_verified:
            raise serializers.ValidationError("Please verify your OTP before login")

        refresh = RefreshToken.for_user(user)

        # If the user is a Django superuser treat them as ADMIN for frontend role checks
        role = "ADMIN" if getattr(user, "is_superuser", False) else getattr(user, "role", "PUBLIC")

        return {
            "message": "Login successful",
            "email": user.email,
            "role": role,
            "refresh": str(refresh),            # save in localStorage
            "access": str(refresh.access_token) # use in headers
        }
