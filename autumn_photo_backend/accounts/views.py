from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import redirect

from .serializers import RegisterSerializer, VerifyOTPSerializer
from .jwt_serializers import LoginSerializer      # << important
from .models import User
from .omniport import get_omniport_login_url, get_tokens, get_user_info


# ---------------- REGISTER -------------------
class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered. OTP sent to email."}, status=200)
        return Response(serializer.errors, status=400)


# ---------------- VERIFY OTP -------------------
class VerifyOTPAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Account verified successfully"}, status=200)
        return Response(serializer.errors, status=400)


# ---------------- LOGIN (JWT) -------------------
class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        
        if serializer.is_valid():
            return Response(serializer.validated_data, status=200)  # validated_data contains tokens
        
        return Response(serializer.errors, status=400)


# ---------------- OMNIPORT LOGIN -------------------
class OmniportLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return redirect(get_omniport_login_url())


class OmniportCallbackAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return Response({"error": "Missing authorization code"}, status=400)

        tokens = get_tokens(code)
        if "access_token" not in tokens:
            return Response({"error": "Failed to obtain access token"}, status=400)

        access_token = tokens["access_token"]
        user_info = get_user_info(access_token)
        if not user_info:
            return Response({"error": "Failed to retrieve user profile"}, status=400)

        email = user_info.get("email")
        first_name = user_info.get("first_name", "")
        last_name = user_info.get("last_name", "")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "is_verified": True,
                "is_omniport_user": True,
            }
        )

        return Response({
            "message": "Omniport login successful",
            "email": user.email,
        }, status=200)
