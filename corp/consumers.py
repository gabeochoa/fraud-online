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
    p.next_turn = o['next']
    p.max_employees = o['maxemp']
    return p


def start_game(cache_key):
    pvalue = cache.get(cache_key)
    value = unpickle_value(pvalue)

    print("start game", value)

    # print("deck", repr(value['deck']))
    deck = deck_dict_to_obj(value['deck'])
    deck.reshuffle()
    # print(deck)

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


def play_card(cache_key, username, card, target_username):
    pvalue = cache.get(cache_key)
    value = unpickle_value(pvalue)

    deck = deck_dict_to_obj(value['deck'])

    cur_p_index, current_player = -1, None
    tar_index, target = -1, None
    for i, player in enumerate(value['players']):
        if current_player is None and player['username'] == username:
            current_player = player
            cur_p_index = i
            continue
        if target is None and player['username'] == target_username:
            target = player
            tar_index = i
            continue
    
    if current_player is None:
        print("player with bad username is playing? ", username, card)
        return {}

    p_obj = player_dict_to_obj(current_player['obj'])
    t_obj = None if target is None else player_dict_to_obj(target)
    print("playing ", username, card)
    # we need to check for global actions
    if card in ['stock_market', 'frame']:
        action_card = logic.CARD_MAP[card]
        try:
            p_obj.play_action(action_card, other_player=t_obj)
        except Exception as e:
            print("Action Exception: ", str(e))
            return {}
    else:
        try:
            c_index = p_obj.employees.index(card)
        except ValueError as e:
            print("trying to play card that player doesnt have", str(e))
            return {}
        try:
            p_obj.play_employee_action(c_index, other_player=t_obj)
        except Exception as e:
            print("Action Exception: ", str(e))
            return {}
    # now the card has been played

    # next is to draw cards
    p_to_draw = p_obj.max_employees - len(p_obj.employees)
    p_obj.next_turn = deck.draw(num_cards=p_to_draw)

    if tar_index != -1:
        value['players'][tar_index]['obj'] = json.dumps(t_obj, cls=logic.MyPlayerEncoder)
    value['players'][cur_p_index]['obj'] = json.dumps(p_obj, cls=logic.MyPlayerEncoder)
    
    value['deck'] = json.dumps(deck, cls=logic.MyDeckEncoder)

    pvalue = pickle_value(value)
    cache.set(cache_key, pvalue, timeout=None)
    return {}


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

    def extra_commands(self, command, data):
        if command == "play_card":
            print(command, data['card'])
            play_card(self.room_group_name, self.get_username, data['card'], data['target'])
            self.send_played_command({
                "card": data['card'],
                "username": self.get_username
            })
            self._send_get_room_response()


    def send_played_command(self, data):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'play',
                'message': data,
            }
        )

    def play(self, event):
        message = event['message']
        self.send_command('play', message)

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