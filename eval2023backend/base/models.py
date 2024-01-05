from django.db import models
from django.contrib.postgres.fields import ArrayField
from .db_connection import db

# Create your models here.


# class Test(models.Model):
#     token = models.CharField(max_length=255)
#     name = models.CharField(max_length=255)
#     addresses = ArrayField(models.CharField(max_length=255))

class Item(models.Model):
    name= models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)


# class Base(models.Model):
#     name= models.CharField(max_length=200)
#     created = models.DateTimeField(auto_now_add=True)
    #modified = models.DateTimeField(auto_now_add=True)
    #balance = models.DecimalField()

test_collection = db['Test']
