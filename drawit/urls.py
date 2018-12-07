from django.conf.urls import url

from drawit.views import index

urlpatterns = [
    url(r'^/?$', index, name='index'),
]