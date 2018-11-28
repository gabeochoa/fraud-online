# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

from rest_framework import serializers
from rest_framework import generics

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from fraud_game.models import UserPackage, PackageGame, Game, Package


class Example(APIView):
    def get(self, request):
        data = list(range(20))
        return Response(data, status=status.HTTP_200_OK)


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'


class GamesListCreate(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'


class PackagesListCreate(generics.ListAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer


class PackageGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackageGame
        fields = '__all__'


class PackageGamesListCreate(generics.ListAPIView):
    queryset = PackageGame.objects.all()
    serializer_class = PackageGameSerializer
