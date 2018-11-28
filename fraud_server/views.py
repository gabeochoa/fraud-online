# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework import generics

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.

class Example(APIView):
    def get(self, request):
        data = list(range(20))
        return Response(data, status=status.HTTP_200_OK)


class CurrentUserSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'id')

class UsersListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = CurrentUserSerializer
