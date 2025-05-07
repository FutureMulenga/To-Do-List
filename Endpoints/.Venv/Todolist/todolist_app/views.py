from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import MyTokenObtainPairSerializer, RegisterSerializer, TaskSerializer, UserUpdateSerializer, UserListSerializer
from rest_framework import viewsets
from .models import Task
from django.contrib.auth.models import User


# this view is used to get the token for the user
class LoginView(TokenObtainPairView):
    """
    Custom login endpoint that uses JWT but returns in the format expected by the frontend
    """
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [AllowAny]


# this view is used to register the user
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


#this view is used to update the user profile
class UserUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            'user': {
                'id': instance.id,
                'username': instance.username,
                'email': instance.email,
            }
        }, status=status.HTTP_200_OK)


# this view is used to get the tasks of the user
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# this view is used to get all the users in the system
class UserListView(generics.ListAPIView):
    """
    Endpoint to get all users
    """
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # You might want to add filters here
        return User.objects.all().order_by('-date_joined')


# this view is used to get the user by id
class UserDetailView(generics.RetrieveAPIView):
    """
    Endpoint to get user by ID
    """
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)