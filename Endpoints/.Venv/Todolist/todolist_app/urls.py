from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, RegisterView, TaskViewSet

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task') 

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('tasks/', include(router.urls)),
]
