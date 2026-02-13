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

    def __clstr__(self):
        return f"{self.user.username} - {self.role}"
