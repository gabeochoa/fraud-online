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
        player["is_spy"] = False
        player['is_first'] = False
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


class SpyfallConsumer(BaseConsumer):

    def get_user(self, players=None):
        base_player = {
            "username": self.get_username,
            "id": 0,
            "channel": self.channel_name,
            "role": None,
            "location": None,
            "is_spy": False,
        }
        if players is None or len(players) == 0:
            return base_player
        else:
            # players is not empty
            print(players, len(players))
            base_player['id'] = players[-1]['id']+1
            return base_player
        
    def store_extra_in_cache(self):
        self.store_timer_amount_in_cache()
        self.store_locations_in_cache()

    def store_timer_amount_in_cache(self):
        local_time = self.get_params.get("minutes", [5])[0]
        value = cache.get(self.room_group_name, default=None)
        if 'minutes' in value:
            # time already set
            return 
        self.get_total_time = local_time
        value['minutes'] = self.get_total_time
        cache.set(self.room_group_name, value, timeout=None)

    def store_locations_in_cache(self):
        value = cache.get(self.room_group_name, default=None)
        value['locations'] = get_locations()
        cache.set(self.room_group_name, value, timeout=None)

    def player_in_game(self, player):
        return player['role'] is not None
    
    def start_game_message(self):
        return start_game(self.room_group_name)

    def end_game_message(self):
        return end_game(self.room_group_name)