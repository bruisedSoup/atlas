"""
users/authentication.py

DRF custom authentication backend.
Verifies the Supabase JWT sent in the Authorization: Bearer <token> header,
then finds-or-creates the matching User row. Django sessions are not used —
every request is stateless and token-verified.
"""

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import User


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Verify a Supabase-issued JWT and return (user, token).

    The JWT is signed with the project's JWT secret (SUPABASE_JWT_SECRET).
    Standard Supabase JWTs carry:
      sub  — the user's UUID (matches auth.users.id)
      email — user email
      user_metadata.full_name / user_metadata.avatar_url — from Google OAuth
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None  # Let other authenticators try

        token = auth_header.removeprefix("Bearer ").strip()
        if not token:
            return None

        secret = settings.SUPABASE_JWT_SECRET
        if not secret:
            raise AuthenticationFailed(
                "SUPABASE_JWT_SECRET is not configured on the server."
            )

        try:
            unverified_header = jwt.get_unverified_header(token)
            alg = unverified_header.get("alg", "HS256")

            if alg == "HS256":
                # Try decoding with raw string secret, fallback to base64-decoded bytes if needed
                try:
                    payload = jwt.decode(
                        token,
                        secret,
                        algorithms=["HS256"],
                        options={"verify_exp": True},
                        audience="authenticated",
                    )
                except jwt.InvalidSignatureError:
                    import base64
                    secret_bytes = base64.b64decode(secret)
                    payload = jwt.decode(
                        token,
                        secret_bytes,
                        algorithms=["HS256"],
                        options={"verify_exp": True},
                        audience="authenticated",
                    )
            else:
                # Asymmetric algorithm (e.g. ES256, RS256) — fetch public key from Supabase JWKS
                supabase_url = getattr(settings, "SUPABASE_URL", "") or "https://ibcpwkioctzpqeewikhb.supabase.co"
                jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
                jwks_client = jwt.PyJWKClient(jwks_url)
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=[alg],
                    options={"verify_exp": True},
                    audience="authenticated",
                )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except Exception as exc:
            raise AuthenticationFailed(f"Invalid token: {exc}")

        user_id = payload.get("sub")
        email = payload.get("email", "")

        # Extract name & avatar from all possible Supabase OAuth locations
        metadata = payload.get("user_metadata") or {}
        identities = payload.get("identities") or []
        identity_data = identities[0].get("identity_data", {}) if (isinstance(identities, list) and len(identities) > 0) else {}

        full_name = (
            metadata.get("full_name")
            or metadata.get("name")
            or identity_data.get("full_name")
            or identity_data.get("name")
            or payload.get("name", "")
        )
        avatar_url = (
            metadata.get("avatar_url")
            or metadata.get("picture")
            or identity_data.get("avatar_url")
            or identity_data.get("picture")
            or payload.get("picture", "")
            or payload.get("avatar_url", "")
        )

        if not user_id:
            raise AuthenticationFailed("Token payload missing 'sub'.")

        # Upsert the local profile row without erasing existing valid avatar
        user, created = User.objects.get_or_create(
            id=user_id,
            defaults={
                "email": email,
                "full_name": full_name,
                "avatar_url": avatar_url,
            },
        )
        if not created:
            updated = False
            if email and user.email != email:
                user.email = email
                updated = True
            if full_name and not user.full_name:
                user.full_name = full_name
                updated = True
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
                updated = True
            elif avatar_url and user.avatar_url != avatar_url and not user.avatar_url.startswith("data:"):
                user.avatar_url = avatar_url
                updated = True
            if updated:
                user.save()

        return (user, token)
