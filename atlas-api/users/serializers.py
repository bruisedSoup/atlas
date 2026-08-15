"""
users/serializers.py
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "avatar_url", "bio", "created_at"]
        read_only_fields = ["id", "created_at"]
