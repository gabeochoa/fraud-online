# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2018-11-28 04:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fraud_game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='package',
            name='meta_name',
            field=models.CharField(default='empty', max_length=100),
            preserve_default=False,
        ),
    ]
