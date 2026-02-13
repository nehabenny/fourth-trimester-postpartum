from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    MOTHER = 'MOTHER'
    FAMILY = 'FAMILY'
    ROLE_CHOICES = [
        (MOTHER, 'Mother'),
        (FAMILY, 'Family'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=MOTHER)
    
    # 6-character unique code generated for Mothers
    care_code = models.CharField(max_length=6, unique=True, null=True, blank=True)
    
    # Link Family accounts to a Mother's profile
    mother = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='circle_members')

    def __str__(self):
        return f"{self.user.username} - {self.role}"
