"""
users/views.py

POST /api/auth/session/
  Accepts a Supabase JWT in the Authorization header.
  The SupabaseJWTAuthentication backend verifies the token and upserts the
  User row — by the time this view runs, request.user is already populated.
  Returns the user's profile so the frontend can confirm identity.

GET/PATCH /api/users/profile/
  Fetches or updates the user profile (full_name, bio, avatar_url).
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

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


@api_view(["GET", "PATCH", "PUT"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Retrieve or update the authenticated user's profile.
    """
    if request.method == "GET":
        serializer = UserSerializer(request.user)
        return Response({"user": serializer.data})

    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"user": serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
