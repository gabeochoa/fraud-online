from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [
    url(r'^ws/corp/(?P<room_name>[^/]+)/$', consumers.CorpConsumer),
]