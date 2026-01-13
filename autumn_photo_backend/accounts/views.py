from autumn_photo.settings import OMNIPORT_TOKEN_URL
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import redirect
from django.conf import settings
import requests

from .serializers import RegisterSerializer, VerifyOTPSerializer
from .jwt_serializers import LoginSerializer      # << important
from .models import User
from .omniport import get_omniport_login_url, get_tokens, get_user_info
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect


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
            return Response({"error": "Authorization code missing"}, status=400)

        # 1️⃣ Exchange code → access token
        token_res = requests.post(
            settings.OMNIPORT_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.OMNIPORT_CLIENT_ID,
                "client_secret": settings.OMNIPORT_CLIENT_SECRET,
                "redirect_uri": settings.OMNIPORT_REDIRECT_URI,
            },
        )

        tokens = token_res.json()
        access_token = tokens.get("access_token")

        if not access_token:
            return Response(tokens, status=400)

        # 2️⃣ Fetch user info
        user_res = requests.get(
            settings.OMNIPORT_USER_INFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        data = user_res.json()

        email = data["contact_information"]["email_address"]
        full_name = data["person"]["full_name"]

        # 3️⃣ Create / fetch local user
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": full_name,
                "is_verified": True,
                "is_omniport_user": True,
            },
        )

        # 4️⃣ Create JWT
        refresh = RefreshToken.for_user(user)

        # 5️⃣ Store tokens in session (for SPA pickup)
        request.session["jwt_access"] = str(refresh.access_token)
        request.session["jwt_refresh"] = str(refresh)
        request.session["email"] = user.email
        request.session["role"] = user.role

        return redirect("http://localhost:5173/omniport/callback")




class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = "ADMIN" if getattr(user, "is_superuser", False) else getattr(user, "role", "PUBLIC")

        return Response({
            "email": user.email,
            "full_name": user.full_name,
            "role": role,
            "is_superuser": getattr(user, "is_superuser", False),
        })

class OmniportSessionAPIView(APIView):
    def get(self, request):
        if "jwt_access" not in request.session:
            return Response({"error": "No active session"}, status=401)

        return Response({
            "access": request.session["jwt_access"],
            "refresh": request.session["jwt_refresh"],
            "email": request.session["email"],
            "role": request.session["role"],
        })

