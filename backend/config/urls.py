"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from quiz.views import home_view, redoc_view
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('', include('quiz.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema', template_name='quiz/swagger.html'), name='swagger-ui'),
    path('api/redoc/', redoc_view, name='redoc'),
]
