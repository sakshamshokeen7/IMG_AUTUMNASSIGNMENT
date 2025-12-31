import requests
from django.conf import settings


def get_omniport_login_url():
    return (
        f"{settings.OMNIPORT_AUTHORIZE_URL}"
        f"?client_id={settings.OMNIPORT_CLIENT_ID}"
        f"&redirect_uri={settings.OMNIPORT_REDIRECT_URI}"
        f"&response_type=code"
    )


def get_tokens(code):
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.OMNIPORT_REDIRECT_URI,
        "client_id": settings.OMNIPORT_CLIENT_ID,
        "client_secret": settings.OMNIPORT_CLIENT_SECRET,
    }

    response = requests.post(settings.OMNIPORT_TOKEN_URL, data=data)
    return response.json()


def get_user_info(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(settings.OMNIPORT_USER_INFO_URL, headers=headers)
    return response.json()
