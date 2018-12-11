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
from spyfall.data import get_locations, get_roles
from spyfall.baseconsumer import BaseConsumer

def start_game(cache_key):
    value = cache.get(cache_key)
    print("start game", value)
    # set the rest to random jobs for that location
    location = random.choice(get_locations())
    roles = get_roles(location)
    players = []
    for player in (value["players"]):
        player["role"] = random.choice(roles)
        player["location"] = location
        players.append(player)

    # then generate first player and spy

    # get a random person and assign them as spy
    spy_index = random.randrange(len(players))
    first_person = random.randrange(len(players))

    players[spy_index]["location"] = None
    players[spy_index]["role"] = "spy"
    players[spy_index]["is_spy"] = True

    players[first_person]['is_first'] = True

    # set cache
    value["players"] = players
    cache.set(cache_key, value, timeout=None)
    print("start game end", value)
    return value

def end_game(cache_key):

    value = cache.get(cache_key)
    players = []
    for player in (value["players"]):
        player["role"] = None
        player["location"] = None
        player["is_spy"] = False
        player['is_first'] = False
        players.append(player)
    value["players"] = players
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
                "stroke": data['message']['stroke'],
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

    def end_game_message(self):
        return end_game(self.room_group_name)