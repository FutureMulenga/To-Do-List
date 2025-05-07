from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Task
from rest_framework_simplejwt.tokens import RefreshToken



class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that includes user data in response
    """
    def validate(self, attrs):
        # Get the token
        data = super().validate(attrs)
        
        # Add user data
        user = self.user
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
        }
        
        # Return the token as expected by frontend
        data['token'] = data.pop('access')  # Rename 'access' to 'token'
        data.pop('refresh', None)  
        
        return data

#
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
        
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
# Generate token for the new user
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email')
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
        }

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value


class TaskSerializer(serializers.ModelSerializer):
    due_date = serializers.DateTimeField(required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'completed',
            'due_date',
            'priority',
            'category',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'completed': {'default': False},
            'priority': {'required': False, 'default': 'medium'},
            'category': {'required': False, 'allow_null': True}
        }


    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Format the dates if needed
        if data['due_date']:
            data['due_date'] = instance.due_date.isoformat()
        return data

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
        read_only_fields = ('date_joined',)

