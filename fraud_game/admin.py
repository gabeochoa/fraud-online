# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from .models import Game, Package, PackageGame, UserPackage


admin.site.register(Game)
admin.site.register(Package)
admin.site.register(PackageGame)
admin.site.register(UserPackage)
