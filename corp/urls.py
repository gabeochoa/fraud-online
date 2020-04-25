from django.conf.urls import url

from corp.views import index

urlpatterns = [
    url(r'(^/(?P<extra>[^/]+))?$', index, name='index'),
]