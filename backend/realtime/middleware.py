import os
import urllib.parse
import jwt
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")

@database_sync_to_async
def get_user_from_payload(user_id, email):
    if not user_id:
        return AnonymousUser()
    try:
        user, _ = User.objects.get_or_create(
            id=user_id,
            defaults={"email": email or "", "username": email or str(user_id)},
        )
        return user
    except Exception:
        return AnonymousUser()

class JWTAuthMiddleware:
    """
    Custom WebSocket middleware that authenticates Supabase JWT from query parameters:
    ws://localhost:8000/ws/realtime/?token=<access_token>
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = urllib.parse.parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        scope["user"] = AnonymousUser()
        scope["user_id"] = None

        if token:
            try:
                # Decode Supabase JWT
                if SUPABASE_JWT_SECRET:
                    payload = jwt.decode(
                        token,
                        SUPABASE_JWT_SECRET,
                        algorithms=["HS256"],
                        options={"verify_aud": False},
                    )
                else:
                    payload = jwt.decode(
                        token,
                        options={"verify_signature": False},
                    )

                user_id = payload.get("sub")
                email = payload.get("email", "")

                if user_id:
                    scope["user_id"] = user_id
                    scope["user"] = await get_user_from_payload(user_id, email)
            except Exception as e:
                # Invalid or expired token
                pass

        return await self.inner(scope, receive, send)
