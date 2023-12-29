from django.db import models
from .db_connection import db

# Create your models here.

class Item(models.Model):
    name= models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)

test_collection = db['Test']
