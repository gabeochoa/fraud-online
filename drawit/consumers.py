from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.consumer import SyncConsumer
from django.core.cache import cache
import time 
from urllib.parse import parse_qs
import json
import random


from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.consumer import SyncConsumer
from django.core.cache import cache
import time 
from urllib.parse import parse_qs
import json
import random
from drawit.data import WORDS
from spyfall.data import get_locations, get_roles
from spyfall.baseconsumer import BaseConsumer

def start_game(cache_key):
    value = cache.get(cache_key)
    print("start game", value)

    # make list of players
    players = []
    for player in (value["players"]):
        player['word'] = random.choice(WORDS)
        players.append(player)

    random.shuffle(players)

    # now we can assign them numbers 
    for i, player in enumerate(players):
        player['order'] = i

    # set cache
    value["players"] = players
    value['current_player'] = 0
    value['is_game_started'] = True
    cache.set(cache_key, value, timeout=None)
    print("start game end", value)
    return value

def progress_game(cache_key):
    value = cache.get(cache_key)
    print("progress game", value)
    value['current_player'] += 1
    cache.set(cache_key, value, timeout=None)
    print("progress game end", value)
    return value

def end_game(cache_key):

    value = cache.get(cache_key)
    players = []
    for player in (value["players"]):
        player["word"] = None
        player["order"] = None
        players.append(player)
    value["players"] = players
    value['is_game_started'] = False
    cache.set(cache_key, value, timeout=None)
    return value


class DrawItConsumer(BaseConsumer):

    def get_user(self, players=None):
        base_player = {
            "username": self.get_username,
            "id": 0,
            "channel": self.channel_name,
            "is_in_game": False,
        }
        if players is None or len(players) == 0:
            return base_player
        else:
            # players is not empty
            print(players, len(players))
            base_player['id'] = players[-1]['id']+1
            return base_player
        
    def store_extra_in_cache(self):
        pass

    def extra_commands(self, command, data):
        if command == "draw":
            print(data)
            self.send_draw_command({
                "prev": data['message']['prev'],
                "cur": data['message']['cur'],
                "tool": data['message']['tool'],
                "username": self.get_username
            })

    def send_draw_command(self, data):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'draw',
                'message': data,
            }
        )
    
    def draw(self, event):
        message = event['message']
        self.send_command("draw", message)

    def player_in_game(self, player):
        return player['is_in_game']
    
    def start_game_message(self):
        return start_game(self.room_group_name)
    
    def end_round_message(self):
        return progress_game(self.room_group_name)

    def end_game_message(self):
        return end_game(self.room_group_name)