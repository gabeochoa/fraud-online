from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.consumer import SyncConsumer
from django.core.cache import cache
import time 
from urllib.parse import parse_qs
import json
import random
from json import JSONEncoder
from spyfall.data import get_locations, get_roles
from spyfall.baseconsumer import BaseConsumer

class MyActionEncoder(JSONEncoder):

        def encode(self, o):
            return {
                "apc": o.action_cost,
                "mc": o.monetary_cost,
                "name": o.name, 
                "dname": o.display_name
            }


class BaseAction(object):

    def __init__(self, ap_cost=1, m_cost=0, name="default", display_name=None):
        self.action_cost = ap_cost
        self.monetary_cost = m_cost
        self.name = name
        self.display_name = name if display_name is None else display_name

    def __str__(self):
        return self.display_name
    
    def action(self):
        raise NotImplementedError("implement action")
    
class SideEffect(object):

    def __init__(self, )

class StockMarket(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 0,
            "m_cost": 0,
            "name": "stock_market",
            "display_name": "Play the Stock Market",
        }
        super(StockMarket, self).__init__(**kwargs)

    def action(self):
        pass


def start_game(cache_key):
    value = cache.get(cache_key)
    print("start game", value)
    # set the rest to random jobs for that location
    players = []
    for player in (value["players"]):
        players.append(player)

    # then generate first player and spy
    # get a random person and assign them as spy
    first_person = random.randrange(len(players))
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
        player['is_first'] = False
        players.append(player)
    value["players"] = players
    cache.set(cache_key, value, timeout=None)
    return value


class CorpConsumer(BaseConsumer):

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