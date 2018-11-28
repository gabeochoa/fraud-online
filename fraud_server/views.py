# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.


class Index(APIView):
    def get(self, request):
        data = {
            "success": True,
            "message": "Working"
        }
        return Response(data, status=status.HTTP_200_OK)