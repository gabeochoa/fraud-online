# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.utils.safestring import mark_safe
import json

def index(request):
    return render(request, 'spyfall/index.html')

def room(request, room_name):
    print("ROOM" + room_name)
    return render(request, 'spyfall/room.html', {
        'room_name_json': mark_safe(json.dumps(room_name))
    })