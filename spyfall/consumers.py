from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.consumer import SyncConsumer
from django.core.cache import cache
import time 
from urllib.parse import parse_qs
import json
import random

def get_locations():
    return [
        "Airplane",
        "Bank", 
        "Beach", 
        "Cathedral", 
        "Circus Tent", 
        "Corporate Party", 
    ]

def start_game(cache_key):
    value = cache.get(cache_key)
    print("start game", value)
    # get a random person and assign them as spy
    spy_index = random.randrange(len(value['players']))
    person = value['players'][spy_index] # random_person()
    person["role"] = "spy"
    person["is_spy"] = True
    # set the rest to random jobs for that location
    location = random.choice(get_locations())
    players = []
    for index, player in enumerate(value["players"]):
        if index == spy_index:
            players.append(person)
            continue
        player["role"] = "random_role"
        player["location"] = location
        players.append(player)

    value["players"] = players
    cache.set(cache_key, value, timeout=None)
    print("start game end", value)
    return value

class SpyfallConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'spyfall_%s' % self.room_name
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        get_params = parse_qs(self.scope['query_string'].decode("utf-8"))
        # print(get_params.keys())
        username = get_params.get("username", [time.time()])[0]
        # print(username)

        # store this user in our room cache
        value = cache.get(self.room_group_name, default=None)
        if value is None:
            # empty cache / first user login
            value = {
                "locations": get_locations(),
                "players": [
                    {
                        "username": username,
                        "id": 0,
                        "channel": self.channel_name,
                        "role": None,
                        "location": None,
                        "is_spy": False,
                    }
                ],
            }
        # otherwise just add to it directly
        elif len(value.get("players", [])) == 0:
            value["players"].append({
                "username": username,
                "id": 0,
                "channel": self.channel_name,
                "role": None,
                "location": None,
                "is_spy": False,
            })
        else:
            value["players"].append({
                "username": username,
                "id": value["players"][-1]['id']+1,
                "channel": self.channel_name,
                "role": None,
                "location": None,
                "is_spy": False,
            })
        cache.set(self.room_group_name, value, timeout=None)
        self.accept()
        self.send_get_room_response()

    def send_command(self, command, message):
        self.send(text_data=json.dumps({
            "command": command,
            "message": message,
            "sender": self.channel_name,
        }))

    def remove_person(self, channel):
        value = cache.get(self.room_group_name, default=None)
        players = []
        for player in value['players']:
            if player['channel'] == channel:
                continue
            players.append(player) 
        value['players'] = players
        cache.set(self.room_group_name, value, timeout=None)

    def disconnect(self, close_code):
        print ("disconnect")
        # remove person from cache
        self.remove_person(self.channel_name)
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        self.send_get_room_response()

    # Receive message from WebSocket
    def receive(self, text_data):
        print(text_data)
        text_data_json = json.loads(text_data)
        print(text_data_json)
        command = text_data_json['command']
        if command == "join_lobby":
            username = text_data_json['username']
            # # Send message to room group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'new_user',
                    'message': username,
                }
            )
        elif command == "get_room":
            self.send_get_room_response()
        elif command == "start_game":
            self.send_start_game()

    def send_start_game(self):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'start_game',
                'message': start_game(self.room_group_name)
            }
        )

    def start_game(self, event):
        message = event['message']
        self.send_command("start_game", message)

    def new_user(self, event):
        message = event['message']
        self.send_command("new_user", message)
    
    def send_get_room_response(self):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'get_room_response',
                'message': cache.get(self.room_group_name)
            }
        )

    def get_room_response(self, event):
        message = event['message']
        # Send message to WebSocket
        print("get_room_response", message)
        self.send_command("get_room_response", message)


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': "x has joined "
            }
        )
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': "x has left "
            }
        )
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['command']

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))