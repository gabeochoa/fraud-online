import json
from json import JSONEncoder

class MyActionEncoder(JSONEncoder):

    def encode(self, o):
        if isinstance(o, list):
            return [self.encode(x) for x in o]
        if isinstance(o, dict):
            return { k: self.encode(v) for k,v in o.items()}
        return {
            "apc": o.action_cost,
            "mc": o.monetary_cost,
            "name": o.name,
            "dname": o.display_name,
            "attr": o.attr,
        }


class BaseAction(object):

    def __init__(self, ap_cost=1, m_cost=0, 
                 name="default", display_name=None, defense_name=None,
                 illegal=False):
        self.action_cost = ap_cost
        self.monetary_cost = m_cost
        self.name = name
        self.display_name = name if display_name is None else display_name
        self.defense_name = name if defense_name is None else defense_name
        self.attr = {}
        self.illegal = illegal

    def __str__(self):
        return self.display_name
    
    def add_attr(self, name, value):
        self.attr[name] = value

    def action(self, player, target):
        source = [SideEffect("add", "money", -self.monetary_cost), 
                  SideEffect("add", 'action_points', -self.action_cost)]
        target = []
        return source, target

    def defense(self, player, target):
        source = []
        target = []
        return source, target

class SideEffect(object):

    def __init__(self, kind, attr_name, attr_value, *args):
        self.kind = kind
        self.affected = attr_name
        self.amount = attr_value
        self.extra = args

class StockMarket(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 1,
            "m_cost": 0,
            "name": "stock_market",
            "display_name": "Play the Stock Market",
        }
        super(StockMarket, self).__init__(**kwargs)

    def action(self, player, target):
        base_source, base_target = super(StockMarket, self).action(player, target)
        source = base_source + [SideEffect("add", "money", 1)]
        target = base_target + []
        return source, target

class Frame(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 2,
            "m_cost": 7,
            "name": "frame",
            "display_name": "Frame another company",
        }
        super(Frame, self).__init__(**kwargs)

    def action(self, player, target):
        base_source, base_target = super(Frame, self).action(player, target)
        source = base_source + []
        target = base_target + [SideEffect("add", "max_employees", -1)]
        return source, target

class TaxAccountant(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 1,
            "m_cost": 0,
            "name": "taxaccountant",
            "display_name": "Use an accountant to massage your taxes",
        }
        super(TaxAccountant, self).__init__(**kwargs)

    def action(self, player, target):
        base_source, base_target = super(TaxAccountant, self).action(player, target)
        source = base_source + [SideEffect("add", "money", 2)]
        target = base_target + [SideEffect("add", "max_employees", -1)]
        return source, target

class HR(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 1,
            "m_cost": 0,
            "name": "hr",
            "display_name": "Use HR to lay off / hire new employees",
        }
        super(HR, self).__init__(**kwargs)

    def action(self, player, target):
        base_source, base_target = super(HR, self).action(player, target)
        source = base_source + [ SideEffect("draw", "employees", "2")]
        target = base_target + []
        return source, target

class Conman(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 1,
            "m_cost": 0,
            "name": "conman",
            "display_name": "Use Con-Man to steal from another company",
            "illegal": True,
        }
        super(Conman, self).__init__(**kwargs)

    def action(self, player, target_player):
        base_source, base_target = super(Conman, self).action(player, target_player)
        if target_player is None:
            raise Exception("conman requires a target")
        to_take = 2 if target_player.money >= 2 else target_player.money
        source = base_source + [ SideEffect("add", "money", to_take)]
        target = base_target + [ SideEffect("add", "money", -to_take)]
        return source, target

class InsideTrader(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 1,
            "m_cost": 0,
            "name": "insidetrader",
            "display_name": "Use Inside Trading to gain $3 million (illegal)",
            "illegal": True,
        }
        super(InsideTrader, self).__init__(**kwargs)

    def action(self, player, target_player):
        base_source, base_target = super(InsideTrader, self).action(player, target_player)
        
        source = base_source + [ SideEffect("add", "money", 3)]
        target = base_target + [ SideEffect("notify", "inside", None)]
        return source, target

class PoliceOfficer(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 1,
            "m_cost": 3,
            "name": "police",
            "display_name": "Bribe police to arrest another company's employee",
            "defense_name": "Block conman action"
        }
        super(PoliceOfficer, self).__init__(**kwargs)

    def action(self, player, target_player):
        base_source, base_target = super(PoliceOfficer, self).action(player, target_player)

        source = base_source + []
        target = base_target + [ SideEffect("notify", "arrest", target_player)]
        return source, target

class Lawyer(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 999,  # basically it cant be played offensively
            "m_cost": 0,
            "name": "lawyer",
            "display_name": "Lawyer",
            "defense_name": "Block arrests"
        }
        super(Lawyer, self).__init__(**kwargs)

    def action(self, player, target_player):
        return super(Lawyer, self).action(player, target_player)
    
    def defense(self, player, target_player):
        return super(Lawyer, self).defense(player, target_player)

class GovtEmployee(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 1,  # basically it cant be played offensively
            "m_cost": 0,
            "name": "govtemployee",
            "display_name": "Force other company to show their employees",
            "defense_name": "Block illegal action"
        }
        super(GovtEmployee, self).__init__(**kwargs)

    def action(self, player, target_player):
        base_source, base_target = super(GovtEmployee, self).action(player, target_player)

        source = base_source + []
        target = base_target + [ SideEffect("notify", "show_cards", target_player, player.max_employees) ]
        return source, target


CARD_MAP = {
    "stock_market": StockMarket(),
    "frame": Frame(),
    "taxaccountant": TaxAccountant(),
    "hr": HR(),
    "police": PoliceOfficer(),
    "lawyer": Lawyer(),
    "govtemployee": GovtEmployee(),
    "conman": Conman(),
    "insidertrader": InsideTrader(),
}

DECK_INIT = ([]
    + (["taxaccountant"] * 3)
    + (["hr"] * 3)
    + (["police"] * 3)
    + (["lawyer"] * 3)
    + (["govtemployee"] * 3)
    + (["conman"] * 3)
    + (["insidertrader"] * 3)
)


class MyPlayerEncoder(JSONEncoder):

    def encode(self, o):
        if isinstance(o, list):
            return [self.encode(x) for x in o]
        return {
            "money": o.money,
            "ap": o.action_points,
            "emp": o.employees,
            "maxemp": o.max_employees,
        }

    def object_hook(self, o):
        if isinstance(o, list):
            return [self.object_hook(x) for x in o]
        p = Player()
        p.money = o['money']
        p.action_points = o['ap']
        p.employees = o['emp']
        p.max_employees = o['maxemp']
        return p

class Player(object):
    def __init__(self):
        self.reset_player_numbers()
    
    def reset_player_numbers(self):
        self.money = 0
        self.action_points = 2
        self.employees = []
        self.max_employees = 2

    def apply_side_effect(self, side_effect):
        where = side_effect.affected
        what = side_effect.amount
        kind = side_effect.kind
        
        if kind == "add":
            cur_val = getattr(self, where)
            print("\tchanging", where, "from", cur_val, "to", cur_val + what)
            setattr(self, where, max(cur_val + what, 0))
            return 
        if kind == "draw":
            print("\tdrawing", what, "cards")
            return 
        if kind == "notify":
            print("\tnotify player", where, what, "cards")
            return 

    def play_employee_action(self, index, other_player=None):
        emp_name = self.employees.pop(index)
        # check if we need to deep copy
        emp = CARD_MAP[emp_name]
        return self.play_action(emp, other_player=other_player)

    def play_action(self, emp, other_player=None):
        ''' when cards are played offensively '''
        print("playing", emp, other_player)
        if emp.attr.get("requires_target", False) and other_player is None:
            raise Exception("emp requires target but doesnt have one") 
        if emp.monetary_cost > self.money:
            raise Exception("player doesnt have enough money for this empl action")
        if emp.action_cost > self.action_points:
            raise Exception("player doesnt have enough action points for this empl action")
        local_side_effects, target_side_effects = emp.action(self, other_player)
        # TODO map? 
        for se in local_side_effects:
            self.apply_side_effect(se)
        if other_player is not None:
            for se in target_side_effects:
                other_player.apply_side_effect(se)
        return 
    
    def play_defense(self, index, other_action=None):
        ''' actions played to block other actions 
            true if successfully blocked
            false otherwise
        ''' 
        return False

    def can_block_conman(self):
        ''' you can block if you have a police or govt '''
        return any(emp.name == "govtemployee" or emp.name == "police" for emp in self.employees)
    
    def can_block_arrest(self):
        ''' you can block if you have a lawyer '''
        return any(emp.name == "lawyer" for emp in self.employees)

    def arrest(self, block=False, employee=None):
        if not block and employee is None:
            raise Exception("not blocking arrest but employee is none")
        
        if block:
            # remove lawyer
            index = -1
            for i, emp in enumerate(self.employees):
                if emp.name == "lawyer":
                    index = i
                    break
            if index == -1:
                raise Exception("tried to block but didnt have a lawyer")
            self.employees.pop(i)
            # self.draw() TODO
            return 
        else:
            self.max_employees -= 1
            self.employees.remove(employee)
            return 
    
    def draw(self, deck):
        to_draw = self.max_employees - len(self.employees)
        cds = deck.draw(num_cards=to_draw)
        self.employees += cds
    
    def __str__(self):
        return str(self.__dict__)
import random

class MyDeckEncoder(JSONEncoder):

    def encode(self, o):
        if isinstance(o, list):
            return [self.encode(x) for x in o]
        return {
            "all_cards": o.ALL_CARDS,
            "draw_pile": o.draw_pile,
            "hand": o.in_hand,
            "discard": o.discard_pile,
        }
    
    def object_hook(self, o):
        if isinstance(o, list):
            return [self.object_hook(x) for x in o]
        d = Deck()
        d.ALL_CARDS = o['all_cards']
        d.draw_pile = o['draw_pile']
        d.in_hand = o['hand']
        d.discard_pile = o['discard']
        return d
    

class Deck(object):
    def __init__(self, starting_deck=DECK_INIT):
        self.ALL_CARDS = starting_deck
        self.draw_pile = list(starting_deck)
        random.shuffle(self.draw_pile)
        self.in_hand = []
        self.discard_pile = []

    def reshuffle(self):
        self.draw_pile = list(self.discard_pile + self.draw_pile)
        self.discard_pile = []
        random.shuffle(self.draw_pile)
    
    def play(self, card):
        self.in_hand.remove(card)
        self.discard_pile.append(card)

    def draw(self, num_cards=1):
        cards = self.draw_pile[:num_cards]
        self.draw_pile = self.draw_pile[num_cards:]
        self.in_hand += cards
        return cards
    
    def __str__(self):
        total =  len(self.draw_pile) + len(self.in_hand) + len(self.discard_pile)
        return ("Total: {}; Draw: {}; InHand: {}; Discard: {};"
                .format(total, len(self.draw_pile), 
                        len(self.in_hand), len(self.discard_pile)))


# d = Deck()
# print(d)
# print("draw", d.draw_pile[:5])

# player = Player()
# print(player.employees)
# print(player.draw(d))
# print(player.employees)
# player.play_employee_action(1)
# print(player.employees)

# print("inhand", d.in_hand[:5])
# x = d.draw(5)
# print("drawcards-------------")
# print("mycards", x)
# print("draw", d.draw_pile[:5])
# print("inhand", d.in_hand[:5])
# d.play(x[0])
# print("play --------" )
# print(d.discard_pile)

# # print(json.dumps(DECK, cls=MyActionEncoder, indent=2))
# print(json.dumps(DECK, indent=2))
# # print(json.dumps(StockMarket(), cls=MyActionEncoder, indent=2))


# try:
#     player = Player()
#     # player.play_action(TaxAccountant())
#     # player.employees.append(GovtEmployee())
#     # player.play_action(InsideTrader())
#     # print("arrest", player.can_block_arrest())
#     # print("conman", player.can_block_conman())
#     # player.play_action(StockMarket())
#     # player.play_action(Frame())
#     # player.play_action(PoliceOfficer(), Player())
# except Exception as e:
#     print(str(e))
# print(player)