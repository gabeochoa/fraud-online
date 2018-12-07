from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import spyfall.routing
import drawit.routing

from django.conf.urls import url, include

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter(
            spyfall.routing.websocket_urlpatterns + 
            drawit.routing.websocket_urlpatterns
        )
    ),
})