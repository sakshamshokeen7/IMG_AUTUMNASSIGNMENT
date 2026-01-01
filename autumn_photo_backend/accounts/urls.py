from django.urls import path
from .views import RegisterAPIView, VerifyOTPAPIView, LoginAPIView, OmniportLoginAPIView, OmniportCallbackAPIView


urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPAPIView.as_view(), name="verify-otp"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("omniport/login/", OmniportLoginAPIView.as_view()),
    path("omniport/callback/", OmniportCallbackAPIView.as_view()),
]
