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
from spyfall.data import get_locations
from spyfall.baseconsumer import BaseConsumer

MAX_LOCATIONS = 90#40

def start_game(cache_key):
    value = cache.get(cache_key)
    # print("start game", value)

    if 'remaining_words' in value:
        words = value['remaining_words']
    else:
        words = get_locations()[:MAX_LOCATIONS]
        random.shuffle(words)
    
    location = words.pop(0)
    # print("preloop", words)
    # make list of players
    players = []
    for player in (value["players"]):
        player["location"] = location
        player["is_spy"] = False
        player['is_first'] = False
        players.append(player)

    # print("after loop", words)
    random.shuffle(players)

    # now we can assign them numbers 
    for i, player in enumerate(players):
        player['order'] = i

     # get a random person and assign them as spy
    spy_index = random.randrange(len(players))

    players[spy_index]["location"] = None
    players[spy_index]["role"] = "spy"
    players[spy_index]["is_spy"] = True

    players[0]['is_first'] = True

    # set cache
    value["players"] = players
    value['current_player'] = 0
    value['round'] = 0
    value['is_game_started'] = True
    value['remaining_words'] = words
    value['locations'] = get_locations()[:MAX_LOCATIONS]
    cache.set(cache_key, value, timeout=None)
    # print("start game end", value)
    return value

def progress_game(cache_key):
    value = cache.get(cache_key)
    # print("progress game", value)
    value['current_player'] += 1

    if(value['current_player'] >= len(value['players'])):
        value['round'] += 1
        value['current_player'] = 0

    cache.set(cache_key, value, timeout=None)
    # print("progress game end", value)
    return value

def end_game(cache_key):

    value = cache.get(cache_key)
    players = []
    for player in (value["players"]):
        player["location"] = None
        player["order"] = None
        players.append(player)

    value['round'] = 0
    value['current_player'] = 0
    value["players"] = players
    value['is_game_started'] = False
    cache.set(cache_key, value, timeout=None)
    return value


class FakeArtistConsumer(BaseConsumer):

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
    
    def remove_before_returning(self, value):
        value.pop('remaining_words', None)
        return value

    def extra_commands(self, command, data):
        if command == "draw":
            # print(data)
            self.send_draw_command({
                "prev": data['message']['prev'],
                "cur": data['message']['cur'],
                "tool": data['message']['tool'],
                "username": self.get_username
            })
            return
        if command == "voting":
            self.send_voting_command()
            return 

    def send_voting_command(self, data=None):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'voting',
                'message': data,
            }
        )

    def voting(self, event):
        message = event['message']
        self.send_command('voting', message)

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
        value = start_game(self.room_group_name)
        return self.remove_before_returning(value)
    
    def end_round_message(self):
        value =  progress_game(self.room_group_name)
        return self.remove_before_returning(value)

    def end_game_message(self):
        value =  end_game(self.room_group_name)
        return self.remove_before_returning(value)