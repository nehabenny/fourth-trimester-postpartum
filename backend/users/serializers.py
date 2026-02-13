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
            profile = user.profile
            token['role'] = profile.role
            if profile.role == 'MOTHER':
                token['care_code'] = profile.care_code
        except Exception:
            token['role'] = 'ADMIN' # Fallback for users without profiles
            
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=True)
    care_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'care_code')

    def create(self, validated_data):
        role = validated_data.pop('role', 'MOTHER')
        care_code_input = validated_data.pop('care_code', None)
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
            profile = Profile(user=user, role=role)

            if role == Profile.MOTHER:
                # Generate a unique 6-character care code
                import random
                import string
                while True:
                    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                    if not Profile.objects.filter(care_code=code).exists():
                        profile.care_code = code
                        break
            
            elif role == Profile.FAMILY:
                if not care_code_input:
                    raise serializers.ValidationError({"care_code": "Care code is required for Family registration."})
                
                # Verify the care code exists
                try:
                    mother_profile = Profile.objects.get(care_code=care_code_input, role=Profile.MOTHER)
                    profile.mother = mother_profile
                except Profile.DoesNotExist:
                    raise serializers.ValidationError({"care_code": "Invalid care code. Please check with the mother."})

            profile.save()
            
        return user
