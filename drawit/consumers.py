from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.consumer import SyncConsumer
from django.core.cache import cache
import time 
from urllib.parse import parse_qs
import json
import random


class DrawItConsumer(WebsocketConsumer):
    def connect(self):
       pass

    def disconnect(self, close_code):
        print ("disconnect")
        

    # Receive message from WebSocket
    def receive(self, text_data):
        pass