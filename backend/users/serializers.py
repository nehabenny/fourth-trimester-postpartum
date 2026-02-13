from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Robustly handle missing profiles (e.g. for superusers)
        try:
            token['role'] = user.profile.role
        except Exception:
            token['role'] = 'ADMIN' # Fallback for users without profiles
            
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role')

    def create(self, validated_data):
        role = validated_data.pop('role', 'MOTHER')
        username = validated_data['username'].lower()
        
        # Use a transaction to ensure both user and profile are created together
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=validated_data.get('email', ''),
                password=validated_data['password']
            )
            
            # Import profile inside to avoid early circular import issues
            from .models import Profile
            Profile.objects.create(user=user, role=role)
            
        return user
