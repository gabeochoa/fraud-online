import json
from json import JSONEncoder

class MyActionEncoder(JSONEncoder):

        def encode(self, o):
            return {
                "apc": o.action_cost,
                "mc": o.monetary_cost,
                "name": o.name,
                "dname": o.display_name,
                "attr": o.attr,
            }

class BaseAction(object):

    def __init__(self, ap_cost=1, m_cost=0, name="default", display_name=None):
        self.action_cost = ap_cost
        self.monetary_cost = m_cost
        self.name = name
        self.display_name = name if display_name is None else display_name
        self.attr = {}

    def __str__(self):
        return self.display_name
    
    def add_attr(self, name, value):
        self.attr[name] = value

    def action(self, target):
        source = [SideEffect("add", "money", -self.monetary_cost), 
                  SideEffect("add", 'action_points', -self.action_cost)]
        target = []
        return source, target

class SideEffect(object):

    def __init__(self, kind, attr_name, attr_value):
        self.kind = kind
        self.affected = attr_name
        self.amount = attr_value

class StockMarket(BaseAction):
    def __init__(self):
        kwargs = {
            "ap_cost": 1,
            "m_cost": 0,
            "name": "stock_market",
            "display_name": "Play the Stock Market",
        }
        super(StockMarket, self).__init__(**kwargs)

    def action(self, target):
        base_source, base_target = super(StockMarket, self).action(target)
        source = base_source + [SideEffect("money", 1)]
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

    def action(self, target):
        base_source, base_target = super(Frame, self).action(target)
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

    def action(self, target):
        base_source, base_target = super(TaxAccountant, self).action(target)
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

    def action(self, target):
        base_source, base_target = super(HR, self).action(target)
        source = base_source + [ SideEffect("draw", "employees", "2")]
        target = base_target + []
        return source, target

class Player(object):
    def __init__(self, ):
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
        cur_val = getattr(self, where)
        if kind == "add":
            print("\tchanging", where, "from", cur_val, "to", cur_val + what)
            setattr(self, where, cur_val + what)
            return 
        if kind == "draw":
            print("\tdrawing", what, "cards")
            return 

    def play_employee_action(self, index, other_player=None):
        emp = self.employees.pop(index)
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
        local_side_effects, target_side_effects = emp.action(other_player)
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
    
    def __str__(self):
        return str(self.__dict__)


print(json.dumps(StockMarket(), cls=MyActionEncoder, indent=2))


try:
    player = Player()
    player.play_action(TaxAccountant())
    player.play_action(StockMarket())
    player.play_action(Frame())
except Exception as e:
    print(str(e))
print(player)