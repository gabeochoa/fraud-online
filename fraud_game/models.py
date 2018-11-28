# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from django.contrib.auth.models import User

class Game(models.Model):
    # has id
    display_name = models.CharField(max_length=100)
    url_name = models.CharField(max_length=100)

class Package(models.Model):
    # has id
    name = models.CharField(max_length=100)

class PackageGame(models.Model):
    ''' Maps a package and game together '''
    package = models.ForeignKey(Package)
    game = models.ForeignKey(Game)

class UserPackage(models.Model):
    '''
        Keeps track of which users own which packages
    '''
    user = models.ForeignKey(User)
    package = models.ForeignKey(Package)
    purchased_at = models.DateTimeField(auto_now_add=True)