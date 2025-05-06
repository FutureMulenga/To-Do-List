from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, RegisterView, TaskViewSet, UserUpdateView, UserListView, UserDetailView

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task') 

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('tasks/', include(router.urls)),
    path('user/update/', UserUpdateView.as_view(), name='user-update'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
