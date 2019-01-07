from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.consumer import SyncConsumer
from django.core.cache import cache
import time 
from urllib.parse import parse_qs
import json
import random
import pickle

class BaseConsumer(WebsocketConsumer):
    # def __init__(self, *args, **kwargs):
    #     super(BaseConsumer, self).__init__(self, *args, **kwargs)
    def cache_set(self, key, value, timeout=None):
        # DO NOT UNCOMMENT THIS UNLESS YOU CHANGE ALL CHILD CONSUMERS
        # cache.set(key, pickle.dumps(value), timeout=timeout)
        cache.set(key, (value), timeout=timeout)

    def cache_get(self, key, default=None):
        x = cache.get(key, default=default)
        return x
        # if x is None:
        #     return x
        # return pickle.loads(x)

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = '{}_{}'.format(self.__class__.__name__,
                                              self.room_name.lower())
        # print("GROUP NAME", self.room_group_name)
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        # parse get_params 
        self.get_params = parse_qs(self.scope['query_string'].decode("utf-8"))
        self.get_username = self.get_params.get("username", [time.time()])[0]

        # print(username)
        # store this user in our room cache
        self.store_user_in_cache()
        self._store_extra_in_cache()

        self.accept()
        self._send_get_room_response()

    def get_user(self, players=None):
        raise NotImplementedError("Implement get user")

    def is_game_started(self):
        value = self.cache_get(self.room_group_name, default={})
        print("is game started", value)
        for player in value['players']:
            if self.player_in_game(player):
                return True  # we found someone in the game still 
            continue  # this player was not in the game 
        # no one is in the game still
        return False

    def _store_is_game_started(self, overwrite=False, is_started=False):
        '''if is_started is set, will overwrite the is_game_started'''
        value = self.cache_get(self.room_group_name, default={})
        value['is_game_started'] = is_started if overwrite else self.is_game_started()
        self.cache_set(self.room_group_name, value)

    def _store_extra_in_cache(self):
        self._store_is_game_started()
        self.store_extra_in_cache()

    def store_extra_in_cache(self):
        raise NotImplementedError("Implement store_extra_in_cache")
 
    def store_user_in_cache(self):
        value = self.cache_get(self.room_group_name, default=None)
        player = {
            "id": 0,
            "channel": self.channel_name,
            "username": self.get_username,
        }
        if value is None:
            value = {}
        # ---------------
        players = value.get("players", [])

        if 'players' not in value or type(players) is not list:
            player.update(self.get_user())
            value["players"] = []
        else:
            player.update(self.get_user(players=players))

        value["players"].append(player)
        # set in cache
        self.cache_set(self.room_group_name, value, timeout=None)

    def player_in_game(self, player):
        raise NotImplementedError("is player in game")
    
    def _is_player_in_game(self, player):
        return self._is_player_in_game(player)

    def remove_person(self, channel):
        value = self.cache_get(self.room_group_name, default=None)
        players = []
        for player in value['players']:
            if player['channel'] == channel: continue
            players.append(player) 

        if len(players) == 0:
            self._send_end_game()

        self._store_is_game_started()

        value['players'] = players
        self.cache_set(self.room_group_name, value, timeout=None)
   
    def remove_user_from_cache(self, player):
        value = self.cache_get(self.room_group_name, default=None)
        if value is None: # no one to remove ? 
            value = {
                "players": [],
            }
        elif len(value.get("players", [])) == 0:
            pass 
        else:
            players = []
            for p in value['players']:
                if p['id'] == player['id']: continue  # skip the one we are kicking
                players.append(p)
            value['players'] = players
        self.cache_set(self.room_group_name, value, timeout=None)
        return 

    def kick_player(self, message):
        # specific.DXSWSJHM!qLEPQPwbXFOO 
        # {'type': 'kick_player', 'message': {
        #   'username': 'kickme', 'id': 1, 
        #   'channel': 'specific.DXSWSJHM!kdNElAVJIuRY'}
        # }
        player = message['player']
        if self.channel_name == player['channel']:
            self.close(code=1001)
        # otherwise send the removal to the other people 
        # remove this user in our room cache
        self.remove_user_from_cache(player)

    def send_command(self, command, message):
        self.send(text_data=json.dumps({
            "command": command,
            "message": message,
            "sender": self.channel_name,
        }))

    def disconnect(self, close_code):
        # remove person from cache
        self.remove_person(self.channel_name)
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        self._send_get_room_response()

    def extra_commands(self, command, data):
        pass
        
    # Receive message from WebSocket
    def receive(self, text_data):
        # print(text_data)
        text_data_json = json.loads(text_data)
        # print(text_data_json)
        command = text_data_json['command']
        if command == "join_lobby":
            self._send_join_lobby(text_data_json['username'])
        elif command == "get_room":
            self._send_get_room_response()
        elif command == "start_game":
            self._send_start_game()
        elif command == "end_round":
            self._send_end_round()
        elif command == "end_game":
            self._send_end_game()
        elif command == "kick_player":
            self._send_kick_player(text_data_json['player'])
        
        self.extra_commands(command, text_data_json)

    def _send_join_lobby(self, username):
        async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'new_user',
                    'message': username,
                }
            )

    def _send_kick_player(self, player):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'kick_player',
                'player': player
            }
        )
    
    def start_game_message(self):
        raise NotImplementedError("implement start_game_message")

    def _send_start_game(self):
        self._store_is_game_started(overwrite=True, is_started=True)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'start_game',
                'message': self.start_game_message()
            }
        )

    def start_game(self, event):
        message = event['message']
        self.send_command("start_game", message)

    def end_game_message(self):
        raise NotImplementedError("implement end_game_message")

    def _send_end_game(self):
        self._store_is_game_started(overwrite=True, is_started=False)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'end_game',
                'message': self.end_game_message()
            }
        )

    def end_game(self, event):
        message = event['message']
        self.send_command("end_game", message)

    def end_round_message(self):
        raise NotImplementedError("implement end_round_message")

    def _send_end_round(self):
        self._store_is_game_started(overwrite=True, is_started=False)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'end_round',
                'message': self.end_round_message()
            }
        )

    def end_round(self, event):
        message = event['message']
        self.send_command("end_round", message)


    def new_user(self, event):
        message = event['message']
        self.send_command("new_user", message)
    
    def remove_before_returning(self, value):
        return value

    def _send_get_room_response(self):
        value = cache.get(self.room_group_name)
        value = self.remove_before_returning(value)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'get_room_response',
                'message': value
            }
        )

    def get_room_response(self, event):
        message = event['message']
        # Send message to WebSocket
        self.send_command("get_room_response", message)