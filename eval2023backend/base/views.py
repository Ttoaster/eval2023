from django.shortcuts import render
from .models import test_collection
from django.http import HttpResponse


# Create your views here.

def index(request):
    return HttpResponse("<h1>App is running...</h1>")


def add_person(request):
    records = {
        "first_name": "Richard",
        "last_name": "Lowe",
    }
    test_collection.insert_one(records)


    return HttpResponse("New person added")


def get_all_person(request):
    persons = test_collection.find()
    return HttpResponse(persons)