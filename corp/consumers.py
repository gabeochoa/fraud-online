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

from . import logic
import pickle

def pickle_value(value):
    return value#pickle.dumps(value)

def unpickle_value(pickle_value):
    return pickle_value#pickle.loads(pickle_value)

def deck_dict_to_obj(o):
    d = logic.Deck()
    d.ALL_CARDS = o['all_cards']
    d.draw_pile = o['draw_pile']
    d.in_hand = o['hand']
    d.discard_pile = o['discard']
    return d

def player_dict_to_obj(o):
    p = logic.Player()
    p.money = o['money']
    p.action_points = o['ap']
    p.employees = o['emp']
    p.max_employees = o['maxemp']
    return p


def start_game(cache_key):
    pvalue = cache.get(cache_key)
    value = unpickle_value(pvalue)

    print("start game", value)

    print("deck", repr(value['deck']))
    deck = deck_dict_to_obj(value['deck'])
    deck.reshuffle()
    print(deck)

    players = []
    for player in value['players']:
        player['obj'] = player_dict_to_obj(player['obj'])
        player['obj'].employees = deck.draw(num_cards=2)
        player['in_game'] = True
        players.append(player)

    random.shuffle(players)

    # now we can assign them numbers 
    for i, player in enumerate(players):
        player['order'] = i

    value['current_player'] = 0

    # then generate first player and spy
    # get a random person and assign them as spy
    first_person = random.randrange(len(players))
    players[first_person]['is_first'] = True

    print("players", players)
    # set cache
    serialized_players = []
    for player in players:
        player['obj'] = json.dumps(player['obj'], cls=logic.MyPlayerEncoder)
        serialized_players.append(player)
    value["players"] = serialized_players

    value['cards'] = json.dumps(logic.CARD_MAP, cls=logic.MyActionEncoder)

    pvalue = pickle_value(value)
    cache.set(cache_key, pvalue, timeout=None)
    print("start game end", value)
    return pvalue

def end_turn(cache_key):
    pvalue = cache.get(cache_key)
    value = unpickle_value(pvalue)

    pvalue = pickle_value(value)
    cache.set(cache_key, pvalue, timeout=None)
    return {}

def end_game(cache_key):
    pvalue = cache.get(cache_key)
    value = unpickle_value(pvalue)

    players = []
    for player in (value["players"]):
        player['is_first'] = False
        player['in_game'] = False
        players.append(player)
    value["players"] = players

    pvalue = pickle_value(value)
    cache.set(cache_key, pvalue, timeout=None)
    return {}


class CorpConsumer(BaseConsumer):

    def get_user(self, players=None):
        player_s = json.dumps(logic.Player(), cls=logic.MyPlayerEncoder)
        base_player = {
            "username": self.get_username,
            "id": 0,
            "channel": self.channel_name,
            "obj": player_s,
            "in_game": False,
        }
        if players is None or len(players) == 0:
            return base_player
        else:
            # players is not empty
            # print(players, len(players))
            base_player['id'] = players[-1]['id']+1
            return base_player

    def player_in_game(self, player):
        return player['in_game']
        
    def store_extra_in_cache(self):
        self.store_deck_in_cache()

    def store_deck_in_cache(self):
        value = self.cache_get(self.room_group_name)
        if 'deck' in value:
            return 
        deck = logic.Deck()
        value['deck'] = json.dumps(deck, cls=logic.MyDeckEncoder)
        self.cache_set(self.room_group_name, value)
    
    def remove_before_returning(self, value):
        del value['deck']
        return value

    def start_game_message(self):
        return start_game(self.room_group_name)
    
    def end_turn_message(self):
        return end_turn(self.room_group_name)

    def end_game_message(self):
        return end_game(self.room_group_name)