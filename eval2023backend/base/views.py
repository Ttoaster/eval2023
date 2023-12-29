# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.shortcuts import render
from .models import test_collection
from django.http import HttpResponse

import requests
import blockcypher


BLOCKCYPHER_API_KEY = 'your_blockcypher_api_key'

def create_wallet(request):
    # Use Blockcypher API to create a new wallet
    response = requests.post('https://api.blockcypher.com/v1/btc/test3/wallets', data={})
    # Process response

token = "0d225355af3f4f0fac72f8db8bab8847"
last_height = blockcypher.get_latest_block_height(coin_symbol='bcy',api_key=token)
#print("The latest BCY block height is:", last_height)
# keypair = blockcypher.generate_new_address(coin_symbol='bcy',api_key=token)
# print("My address is", keypair['address'])
# print(keypair)
# faucet_tx = blockcypher.send_faucet_coins(
#     address_to_fund=keypair['address'],satoshis=100000,coin_symbol='bcy',api_key=token)
# print("Faucet txid is", faucet_tx['tx_ref'])
# print(faucet_tx)
# faucet_addr = "CFr99841LyMkyX5ZTGepY58rjXJhyNGXHf"
# tx_ref = blockcypher.simple_spend(
#     from_privkey=keypair['private'],to_address=faucet_addr,to_satoshis=100,coin_symbol='bcy',api_key=token)
# print("Txid is", tx_ref)

# Create your views here.

def index(request):
    token = "0d225355af3f4f0fac72f8db8bab8847"
    last_height = blockcypher.get_latest_block_height(coin_symbol='bcy',api_key=token)
    print("The latest BCY block height is:", last_height)
    message = "  <h1>   App is running...        </h1>"
    return HttpResponse(

        {last_height, message },

        )


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




@api_view(['POST'])
def create_wallet(request):
    # Logic to create a new wallet
    return Response({'message': 'Wallet created successfully'})

@api_view(['GET'])
def get_balance(request, wallet_id):
    # Logic to retrieve wallet balance
    return Response({'balance': 100.0})

@api_view(['POST'])
def send_money(request):
    # Logic to send money from one wallet to another
    return Response({'message': 'Transaction successful'})
