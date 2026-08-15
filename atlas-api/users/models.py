"""
users/models.py

The User model mirrors the shape of Supabase Auth — the Supabase `id` (UUID)
is the primary key so Django rows are always matched 1:1 with auth.users rows.
Django does NOT manage auth — Supabase Auth issues JWTs, Django just verifies
them and keeps a local profile row in sync.
"""

import uuid
from django.db import models


class User(models.Model):
    # Primary key = Supabase Auth user UUID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True, default="")
    avatar_url = models.URLField(max_length=1024, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "atlas_users"

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return f"{self.email} ({self.id})"
