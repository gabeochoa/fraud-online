# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

from rest_framework import serializers
from rest_framework import generics

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from fraud_game.models import UserPackage

# Create your views here.

class Example(APIView):
    def get(self, request):
        data = list(range(20))
        return Response(data, status=status.HTTP_200_OK)


class CurrentUserSerializer(serializers.Serializer):
    class Meta:
        model = UserPackage
        fields = ('user', 'package', 'purchased_at')

class UsersListCreate(generics.ListCreateAPIView):
    queryset = UserPackage.objects.all()
    serializer_class = CurrentUserSerializer
