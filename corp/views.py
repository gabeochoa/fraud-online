# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.utils.safestring import mark_safe
import json

def index(request, extra):
    return render(request, 'corp/index.html')