# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.shortcuts import render
from .models import test_collection
from django.http import HttpResponse

import requests
import blockcypher

from blockcypher import create_wallet_from_address
from blockcypher import list_wallet_names
from blockcypher import get_wallet_addresses
from blockcypher import get_wallet_balance
from blockcypher import simple_spend
from blockcypher import delete_wallet

from ecdsa import SigningKey, SECP256k1
import hashlib
import base58


# BLOCKCYPHER_API_KEY = 'your_blockcypher_api_key'

token = "99557193792244dbb38afcc3f7608da6"

# def create_wallet(request):
#     # Use Blockcypher API to create a new wallet
#     response = requests.post('https://api.blockcypher.com/v1/btc/test3/wallets', data={})
    # Process response

# last_height = blockcypher.get_latest_block_height(coin_symbol='bcy',api_key=token)
# #print("The latest BCY block height is:", last_height)
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
    #token = "0d225355af3f4f0fac72f8db8bab8847"
    last_height = blockcypher.get_latest_block_height(coin_symbol='bcy',api_key=token)
    print("The latest BCY block height is:", last_height)
    message = "  <h1>   App is running...        </h1>"
    # return HttpResponse(

    #     {last_height, message },

    #     )
    return last_height


@api_view(['POST'])
def add_person(request):
    #token = "0d225355af3f4f0fac72f8db8bab8847"
    last_height = blockcypher.get_latest_block_height(coin_symbol='bcy',api_key=token)
    records = {
        "block_height": last_height,

    }
    test_collection.insert_one(records)


    # return HttpResponse("New person added")
    return records

def get_all_person(request):
    persons = test_collection.find()
    return HttpResponse(persons)




@api_view(['POST'])
def create_wallet(request):
    # Logic to create a new wallet

    keypair = blockcypher.generate_new_address(coin_symbol='bcy',api_key=token)

    new_wallet_name = request.GET.get('newWalletName')
    print("new wallet name", new_wallet_name)

    wallet = create_wallet_from_address(wallet_name=new_wallet_name, address=keypair['address'],coin_symbol='bcy',api_key=token)
    print("new wallet", wallet)
    test_collection.insert_one(wallet)



    return JsonResponse(wallet)


@api_view(['GET'])
def get_balance(request):
    # Logic to retrieve wallet balance
    #token = "0d225355af3f4f0fac72f8db8bab8847"
    #print(list_wallet_names(token))
    #wallets = list_wallet_names(token,coin_symbol='bcy')
    #print(wallets)
    #get_address = get_wallet_addresses(wallet_name='alice', api_key=token,coin_symbol='bcy')
    #print('get address_____', get_address)

    wallet_balance = get_wallet_balance(wallet_name='alice', api_key=token, coin_symbol='bcy')
    print("wallet balance",wallet_balance)
    print("bob balance", get_wallet_balance(wallet_name='bob', api_key=token, coin_symbol='bcy'))

    # return Response({'balance': 100.0})
    return JsonResponse(wallet_balance)


@api_view(['GET'])
def get_wallet_details(request):

    wallet_name = request.GET.get('walletName')
    wallet_balance = get_wallet_balance(wallet_name=wallet_name, api_key=token, coin_symbol='bcy')

    return JsonResponse(wallet_balance)


@api_view(['GET'])
def get_wallets(request):
    # Logic to retrieve wallet names

    wallets = list_wallet_names(token,coin_symbol='bcy')

    return JsonResponse(wallets)


# def get_private_key_from_address(address, private_key_hex):
#     # Assuming private_key_hex is a hexadecimal representation of the private key
#     private_key = SigningKey.from_string(bytes.fromhex(private_key_hex), curve=SECP256k1)

#     # Verify that the private key corresponds to the provided address
#     public_key = private_key.get_verifying_key().to_string()
#     derived_address = hashlib.new('ripemd160', hashlib.sha256(public_key).digest()).digest()
#     derived_address = base58.b58encode_check(b'\x00' + derived_address).decode('utf-8')

#     if derived_address == address:
#         return private_key
#     else:
#         raise ValueError("Private key does not correspond to the provided address")


# # Replace 'private_key_hex' with the actual private key in hexadecimal format
# def generate_private_key_hex():
#     # Generate a private key
#     private_key = SigningKey.generate(curve=SECP256k1)

#     # Convert the private key to hexadecimal format
#     private_key_hex = private_key.to_string().hex()

#     return private_key_hex









@api_view(['POST'])
def send_money(request):
    # Logic to send money from one wallet to another

    from_address = get_wallet_addresses(wallet_name='alice', api_key=token,coin_symbol='bcy')
    print('alice wallet', from_address)
    #print('alice address_____', from_address['addresses'][0])
    fromAddress = from_address['addresses'][0]
    print('fromAddress', fromAddress)
    to_address = get_wallet_addresses(wallet_name='bob', api_key=token,coin_symbol='bcy')
    print('bob address_____', to_address)
    #print('bob to address_____', to_address['addresses'][0])
    toAddress = to_address['addresses'][0]
    print("toAddress", toAddress)

    faucet_addr = "CFr99841LyMkyX5ZTGepY58rjXJhyNGXHf"
    keypair = blockcypher.generate_new_address(coin_symbol='bcy',api_key=token)

    from blockcypher import create_unsigned_tx
    inputs = [{'address': toAddress},]
    outputs = [{'address': fromAddress, 'value': 100}]
    unsigned_tx = create_unsigned_tx(inputs=inputs, outputs=outputs, coin_symbol='bcy', api_key=token)
    print('unsigned_tx', unsigned_tx)

    from blockcypher import make_tx_signatures
# Using our same unsigned_tx as before, iterate through unsigned_tx['tx']['inputs'] to find each address in order.
# Include duplicates as many times as they may appear:
    # privkey_list = ['privkeyhex1']
    # pubkey_list = ['pubkeyhex1']
    # tx_signatures = make_tx_signatures(txs_to_sign=unsigned_tx['tosign'], privkey_list=privkey_list, pubkey_list=pubkey_list)
    # print('tx_signatures', tx_signatures)
    # Generate a private key
    #private_key_hex = generate_private_key_hex()
    #print("private key hex", private_key_hex)
    #from_privkey = get_private_key_from_address(from_address['addresses'][0], private_key_hex)
    # tx_ref = blockcypher.simple_spend(from_privkey=keypair['private'],to_address=toAddress,to_satoshis=100,coin_symbol='bcy',api_key=token)
    # print("Txid is", tx_ref)


    return JsonResponse({'message': 'Transaction successful'})



@api_view(['POST'])
def fund_wallet(request):
    keypair = blockcypher.generate_new_address(coin_symbol='bcy',api_key=token)
    print('token', token)


    #keypair = blockcypher.generate_new_address(coin_symbol='bcy',api_key=token)
    print("keypair",keypair)
    address = keypair.get('address')
    print('address', address)
    wallets = list_wallet_names(token,coin_symbol='bcy')
    print(wallets)
    get_address = get_wallet_addresses(wallet_name='alice', api_key=token,coin_symbol='bcy')
    print('get address_____', get_address)

    wallet_balance = get_wallet_balance(wallet_name='alice', api_key=token, coin_symbol='bcy')
    print("wallet balance",wallet_balance)

    faucet_tx = blockcypher.send_faucet_coins(address_to_fund=get_address['addresses'][0],satoshis=200000,coin_symbol='bcy',api_key=token)
    print("Faucet txid is", faucet_tx['tx_ref'])
    print(faucet_tx)


    return JsonResponse({'message': 'in fund wallet'})

@api_view(['DELETE'])
def delete_user_wallet(request):
    # Logic to delete a  wallet

    wallet_name_to_delete = request.GET.get('walletNameToDelete')
    wallet_name_to_delete = ''
    print(" wallet to be deleted", wallet_name_to_delete)

    walletDeleted = delete_wallet(wallet_name=wallet_name_to_delete, api_key=token, coin_symbol='bcy')

    #test_collection.deleteOne(wallet)
    #test_collection.deleteOne( {"name": wallet_name_to_delete})

    return JsonResponse(walletDeleted)