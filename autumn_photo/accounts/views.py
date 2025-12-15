from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import redirect
from django.contrib.auth import login

from .serializers import RegisterSerializer, VerifyOTPSerializer, LoginSerializer
from .models import User
from .omniport import get_omniport_login_url, get_tokens, get_user_info


class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered. OTP sent."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPAPIView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Account verified."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OmniportLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return redirect(get_omniport_login_url())


class OmniportCallbackAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        tokens = get_tokens(code)

        access_token = tokens.get("access_token")
        user_info = get_user_info(access_token)

        email = user_info["email"]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": user_info.get("name", ""),
                "is_verified": True,
                "is_omniport_user": True,
            }
        )

        login(request, user)

        return Response({"message": "Omniport login successful", "email": user.email})
        return Response({"error": "Omniport login failed"}, status=status.HTTP_400_BAD_REQUEST)