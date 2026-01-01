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

        return {
            "message": "Login successful",
            "email": user.email,
            "role": user.role,
            "refresh": str(refresh),            # save in localStorage
            "access": str(refresh.access_token) # use in headers
        }
