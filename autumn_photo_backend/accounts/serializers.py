from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.crypto import get_random_string
from .models import User, EmailOtp as EmailOTP

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            is_verified=False
        )
        otp = get_random_string(6, "0123456789")
        EmailOTP.objects.create(user=user, otp=otp)
        print("OTP For Testing:", otp)
        return user

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        otp_obj = EmailOTP.objects.filter(
            user=user,
            otp=data["otp"],
            is_used=False
        ).first()

        if not otp_obj:
            raise serializers.ValidationError("Invalid OTP")

        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP expired")

        data["user"] = user
        data["otp_obj"] = otp_obj
        return data

    def save(self):
        user = self.validated_data["user"]
        otp_obj = self.validated_data["otp_obj"]

        otp_obj.is_used = True
        otp_obj.save()

        user.is_verified = True
        user.save()

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_verified:
            raise serializers.ValidationError("Please verify your account first")

        return {
            "user": user,
            "email": user.email,
            "role": user.role,
        }
