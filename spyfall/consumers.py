from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.consumer import SyncConsumer
from django.core.cache import cache
import time 
from urllib.parse import parse_qs
import json
import random

LOCATIONS = {
    "airplane": [
        "Air Marshall",
        "Mechanic",
        "First Class Passenger",
        "Co-Pilot",
        "Captain",
        "Economy Class Passenger",
        "Stewardess"
    ],
    "amusement_park": [
        "Parent",
        "Food Vendor",
        "Cashier",
        "Happy Child",
        "Teenager",
        "Janitor",
        "Security Guard",
        "Parent",
        "Ride Operator",
        "Annoying Child"
    ],
    "art_museum": [
        "Art Critic",
        "Photographer",
        "Teacher",
        "Security Guard",
        "Painter",
        "Art Collector",
        "Ticket Seller",
        "Student",
        "Visitor",
        "Tourist"
    ],
    "bank": [
        "Manager",
        "Consultant",
        "Armored Car Driver",
        "Security Guard",
        "Teller",
        "Customer",
        "Robber"
    ],
    "beach": [
        "Beach Waitress",
        "Kite Surfer",
        "Lifeguard",
        "Thief",
        "Beach Goer",
        "Beach Photographer",
        "Ice Cream Truck Driver"
    ],
    "broadway_theater": [
        "Cashier",
        "Coat Check Lady",
        "Crewman",
        "Actor",
        "Director",
        "Prompter",
        "Visitor"
    ],
    "candy_factory": [
        "Inspector",
        "Oompa Loompa",
        "Madcap Redhead",
        "Visitor",
        "Pastry Chef",
        "Truffle Maker",
        "Taster",
        "Supply Worker",
        "Taster",
        "Machine Operator"
    ],
    "casino": [
        "Gambler",
        "Dealer",
        "Hustler",
        "Bouncer",
        "Head Security Guard",
        "Bartender",
        "Manager"
    ],
    "cat_show": [
        "Cat",
        "Cat Owner",
        "Cat",
        "Security Guard",
        "Cat Trainer",
        "Crazy Cat Lady",
        "Animal Lover",
        "Judge",
        "Cat-Handler",
        "Veterinarian"
    ],
    "cathedral": [
        "Priest",
        "Sinner",
        "Beggar",
        "Tourist",
        "Parishioner",
        "Choir Singer",
        "Sponsor"
    ],
    "cemetery": [
        "Priest",
        "Gothic Girl",
        "Grave Robber",
        "Poet",
        "Mourning Person",
        "Gatekeeper",
        "Dead Person",
        "Grave Digger",
        "Relative",
        "Flower Seller"
    ],
    "circus_tent": [
        "Visitor",
        "Fire Eater",
        "Clown",
        "Juggler",
        "Acrobat",
        "Animal Trainer",
        "Magician"
    ],
    "coal_mine": [
        "Worker",
        "Miner",
        "Solid Waste Engineer",
        "Safety Inspector",
        "Miner",
        "Overseer",
        "Dump Truck Operator",
        "Driller",
        "Coordinator",
        "Blasting Engineer"
    ],
    "construction_site": [
        "Construction Worker",
        "Architect",
        "Construction Worker",
        "Electrician",
        "Engineer",
        "Trespasser",
        "Safety Officer",
        "Contractor",
        "Crane Driver",
        "Free-Roaming Toddler"
    ],
    "corporate_party": [
        "Delivery Boy",
        "Accountant",
        "Secretary",
        "Owner",
        "Unwelcomed Guest",
        "Manager",
        "Entertainer"
    ],
    "crusader_army": [
        "Imprisoned Arab",
        "Servant",
        "Monk",
        "Archer",
        "Knight",
        "Bishop",
        "Squire"
    ],
    "day_spa": [
        "Dermatologist",
        "Beautician",
        "Manicurist",
        "Makeup Artist",
        "Stylist",
        "Masseuse",
        "Customer"
    ],
    "embassy": [
        "Diplomat",
        "Refugee",
        "Tourist",
        "Government Official",
        "Ambassador",
        "Secretary",
        "Security Guard"
    ],
    "gaming_convention": [
        "Cosplayer",
        "Gamer",
        "Blogger",
        "Child",
        "Security Guard",
        "Exhibitor",
        "Collector",
        "Geek",
        "Shy Person",
        "Famous Person"
    ],
    "gas_station": [
        "Car Washer",
        "Customer",
        "Customer",
        "Cashier",
        "Car Enthusiast",
        "Shopkeeper",
        "Service Attendant",
        "Service Attendant",
        "Climate Change Activist",
        "Manager"
    ],
    "harbor_docks": [
        "Fisherman",
        "Exporter",
        "Loader",
        "Sailor",
        "Captain",
        "Salty Old Pirate",
        "Loader",
        "Cargo Inspector",
        "Cargo Overseer",
        "Smuggler"
    ],
    "hospital": [
        "Therapist",
        "Surgeon",
        "Intern",
        "Patient",
        "Doctor",
        "Anesthesiologist",
        "Nurse"
    ],
    "hotel": [
        "Bellman",
        "Bartender",
        "Customer",
        "Housekeeper",
        "Manager",
        "Security Guard",
        "Doorman"
    ],
    "ice_hockey_stadium": [
        "Spectator",
        "Referee",
        "Security Guard",
        "Food Vendor",
        "Coach",
        "Goaltender",
        "Hockey Fan",
        "Hockey Player",
        "Medic",
        "Hockey Player"
    ],
    "jail": [
        "Wrongly Accused Man",
        "CCTV Operator",
        "Guard",
        "Visitor",
        "Lawyer",
        "Janitor",
        "Jailkeeper",
        "Criminal",
        "Correctional Officer",
        "Maniac"
    ],
    "jazz_club": [
        "Waiter",
        "VIP",
        "Barman",
        "Dancer",
        "Jazz Fanatic",
        "Singer",
        "Saxophonist",
        "Pianist",
        "Drummer",
        "Bouncer"
    ],
    "library": [
        "Student",
        "Librarian",
        "Volunteer",
        "Know-It-All",
        "Journalist",
        "Author",
        "Old Man",
        "Loudmouth",
        "Book Fanatic",
        "Nerd"
    ],
    "military_base": [
        "Officer",
        "Tank Engineer",
        "Soldier",
        "Sniper",
        "Colonel",
        "Medic",
        "Deserter"
    ],
    "movie_studio": [
        "Cameraman",
        "Costume Artist",
        "Director",
        "Producer",
        "Stuntman",
        "Sound Engineer",
        "Actor"
    ],
    "night_club": [
        "Drunk Person",
        "Muscly Guy",
        "Security Guard",
        "Bartender",
        "Regular",
        "Model",
        "Party Girl",
        "Pick-Up Artist",
        "Dancer",
        "Shy Person"
    ],
    "ocean_liner": [
        "Rich Passenger",
        "Cook",
        "Captain",
        "Bartender",
        "Musician",
        "Waiter",
        "Mechanic"
    ],
    "passenger_train": [
        "Passenger",
        "Restaurant Chef",
        "Engineer",
        "Stoker",
        "Mechanic",
        "Border Patrol",
        "Train Attendant"
    ],
    "pirate_ship": [
        "Brave Captain",
        "Cabin Boy",
        "Bound Prisoner",
        "Cannoneer",
        "Slave",
        "Sailor",
        "Cook"
    ],
    "polar_station": [
        "Biologist",
        "Radioman",
        "Hydrologist",
        "Meteorologist",
        "Medic",
        "Geologist",
        "Expedition Leader"
    ],
    "police_station": [
        "Archivist",
        "Criminalist",
        "Criminal",
        "Patrol Officer",
        "Detective",
        "Journalist",
        "Lawyer"
    ],
    "race_track": [
        "Referee",
        "Mechanic",
        "Driver",
        "Spectator",
        "Bookmaker",
        "Commentator",
        "Spectator",
        "Food Vendor",
        "Team Owner",
        "Engineer"
    ],
    "restaurant": [
        "Food Critic",
        "Head Chef",
        "Hostess",
        "Bouncer",
        "Customer",
        "Musician",
        "Waiter"
    ],
    "retirement_home": [
        "Cook",
        "Blind Person",
        "Nurse",
        "Janitor",
        "Cribbage Player",
        "Old Person",
        "Relative",
        "Psychologist",
        "Old Person",
        "Nurse"
    ],
    "rock_concert": [
        "Technical Support",
        "Security Guard",
        "Bassist",
        "Dancer",
        "Singer",
        "Fan",
        "Guitarist",
        "Drummer",
        "Roadie",
        "Stage Diver"
    ],
    "school": [
        "Student",
        "Principal",
        "Gym Teacher",
        "Lunch Lady",
        "Maintenance Man",
        "Security Guard",
        "Janitor"
    ],
    "service_station": [
        "Auto Mechanic",
        "Electrician",
        "Car Wash Operator",
        "Car Owner",
        "Biker",
        "Tire Specialist",
        "Manager"
    ],
    "sightseeing_bus": [
        "Tourist",
        "Tourist",
        "Lost Person",
        "Annoying Child",
        "Tourist",
        "Tour Guide",
        "Photographer",
        "Old Man",
        "Lone Tourist",
        "Driver"
    ],
    "space_station": [
        "Alien",
        "Space Tourist",
        "Engineer",
        "Scientist",
        "Doctor",
        "Pilot",
        "Commander"
    ],
    "stadium": [
        "Sprinter",
        "Security Guard",
        "Referee",
        "Commentator",
        "Spectator",
        "Hammer Thrower",
        "Athlete",
        "Medic",
        "Food Vendor",
        "High Jumper"
    ],
    "submarine": [
        "Commander",
        "Radioman",
        "Cook",
        "Sonar Technician",
        "Sailor",
        "Electronics Technician",
        "Navigator"
    ],
    "subway": [
        "Old Lady",
        "Pregnant Lady",
        "Ticket Seller",
        "Pickpocket",
        "Cleaner",
        "Tourist",
        "Ticket Inspector",
        "Subway Operator",
        "Businessman",
        "Blind Man"
    ],
    "supermarket": [
        "Cashier",
        "Butcher",
        "Customer",
        "Food Sample Demonstrator",
        "Shelf Stocker",
        "Janitor",
        "Security Guard"
    ],
    "the_UN": [
        "Blowhard",
        "Interpreter",
        "Diplomat",
        "Secretary of State",
        "Journalist",
        "Napping Delegate",
        "Tourist",
        "Secretary-General",
        "Speaker",
        "Lobbyist"
    ],
    "university": [
        "Student",
        "Janitor",
        "Maintenance Man",
        "Professor",
        "Dean",
        "Graduate Student",
        "Psychologist"
    ],
    "vineyard": [
        "Exporter",
        "Butler",
        "Wine Taster",
        "Sommelier",
        "Gardener",
        "Gourmet Guide",
        "Winemaker",
        "Rich Lord",
        "Vineyard Manager",
        "Enologist"
    ],
    "wedding": [
        "Relative",
        "Father of the Bride",
        "Best Man",
        "Wedding Crasher",
        "Bride",
        "Groom",
        "Ring Bearer",
        "Flower Girl",
        "Photographer",
        "Officiant"
    ],
    "zoo": [
        "Researcher",
        "Veterinarian",
        "Photographer",
        "Visitor",
        "Zookeeper",
        "Food Vendor",
        "Tourist",
        "Child",
        "Zookeeper",
        "Cashier"
    ]
}

def get_locations():
    return list(LOCATIONS.keys())

def get_roles(location):
    return list(LOCATIONS[location])

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
    value['is_game_started'] = True
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
    value['is_game_started'] = False
    cache.set(cache_key, value, timeout=None)
    return value


class SpyfallConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'spyfall_%s' % self.room_name.lower()
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
        
        for player in players:
            if player['role'] is not None:
                # we found someone without none
                break
            continue
        else:
            # all were none
            value['is_game_started'] = False
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
        elif command == "end_game":
            self.send_end_game()
        elif command == "kick_player":
            self.send_kick_player(text_data_json['player'])


    def send_kick_player(self, player):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'kick_player',
                'player': player
            }
        )
    
    def kick_player(self, message):
        # specific.DXSWSJHM!qLEPQPwbXFOO 
        # {'type': 'kick_player', 'message': {
        #   'username': 'kickme', 'id': 1, 
        #   'channel': 'specific.DXSWSJHM!kdNElAVJIuRY', 'role': None, 'location': None, 
        #   'is_spy': False, 'is_me': False}
        # }
        player = message['player']
        if self.channel_name == player['channel']:
            self.close(code=1001)
        # otherwise send the removal to the other people 

        # store this user in our room cache
        value = cache.get(self.room_group_name, default=None)
        if value is None: # no one to remove ? 
            value = {
                "locations": get_locations(),
                "players": [],
            }
        elif len(value.get("players", [])) == 0:
            pass 
        else:
            players = []
            for p in value['players']:
                if p['id'] == player['id']:
                    continue
                players.append(p)
            value['players'] = players
        cache.set(self.room_group_name, value, timeout=None)

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


    def send_end_game(self):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'end_game',
                'message': end_game(self.room_group_name)
            }
        )

    def end_game(self, event):
        message = event['message']
        self.send_command("end_game", message)

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