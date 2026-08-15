"""
users/views.py

POST /api/auth/session/
  Accepts a Supabase JWT in the Authorization header.
  The SupabaseJWTAuthentication backend verifies the token and upserts the
  User row — by the time this view runs, request.user is already populated.
  Returns the user's profile so the frontend can confirm identity.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import UserSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def session_view(request):
    """
    Exchange a valid Supabase JWT for a Django-side user profile.
    The authentication backend already created/updated the User row.
    """
    serializer = UserSerializer(request.user)
    return Response({"user": serializer.data})
