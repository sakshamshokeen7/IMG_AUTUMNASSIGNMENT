from django.urls import path
from .views import (
    RegisterAPIView, VerifyOTPAPIView, LoginAPIView,
    OmniportLoginAPIView, OmniportCallbackAPIView
)

urlpatterns = [
    path("auth/signup/", RegisterAPIView.as_view()),
    path("auth/verify/", VerifyOTPAPIView.as_view()),
    path("auth/login/", LoginAPIView.as_view()),

    # Omniport OAuth
    path("auth/omniport/login/", OmniportLoginAPIView.as_view()),
    path("auth/omniport/callback/", OmniportCallbackAPIView.as_view()),
]
