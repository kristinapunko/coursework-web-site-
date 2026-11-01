# проект/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.views.static import serve
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tours/', include('tours.urls')), 
    path("api/", include("accounts.urls")),
    path("cabinet/", include('user_cabinet.urls'))
# ]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
]
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Для розробки (необов’язково, якщо DEBUG = False)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)