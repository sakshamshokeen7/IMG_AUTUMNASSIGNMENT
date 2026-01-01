# accounts/serializers.py

from rest_framework import serializers
from django.utils.crypto import get_random_string
from .models import User, EmailOtp as EmailOTP

class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.pop("first_name"),
            last_name=validated_data.pop("last_name"),
            is_verified=False
        )

        # Generate & store otp
        otp = get_random_string(6, "0123456789")
        EmailOTP.objects.create(user=user, otp=otp)
        print("OTP:", otp)  # Later send via email

        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()

    def validate(self, data):
        user = User.objects.filter(email=data["email"]).first()
        if not user:
            raise serializers.ValidationError("User not found")

        otp_obj = EmailOTP.objects.filter(user=user, otp=data["otp"], is_used=False).first()
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

        return {"message": "Account verified successfully"}
