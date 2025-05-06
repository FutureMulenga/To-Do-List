from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import MyTokenObtainPairSerializer, RegisterSerializer, TaskSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task

class LoginView(TokenObtainPairView):
    """
    Custom login endpoint that uses JWT but returns in the format expected by the frontend
    """
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [AllowAny]

class RegisterView(generics.CreateAPIView):
    """
    Custom registration endpoint that creates a user and returns a token
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate token for the new user
        refresh = RefreshToken.for_user(user)
        
        # Format response to match frontend expectations
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
            },
            'token': str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)