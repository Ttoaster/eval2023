# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from django.http import JsonResponse
from django.shortcuts import render
from .models import test_collection
#from base.models import Base
#from .serializers import BaseSerializer
from django.http import HttpResponse

import requests
import blockcypher

from blockcypher import create_wallet_from_address
from blockcypher import list_wallet_names
from blockcypher import get_wallet_addresses
from blockcypher import get_wallet_balance
from blockcypher import simple_spend
from blockcypher import delete_wallet
from blockcypher import get_broadcast_transactions


from ecdsa import SigningKey, SECP256k1
import hashlib
import base58


# BLOCKCYPHER_API_KEY = 'your_blockcypher_api_key'

token = "99557193792244dbb38afcc3f7608da6"




@api_view(['GET'])
def get_data(request):
    cursor = test_collection.find()
    # Iterate over the cursor to retrieve all documents
    documents = list(cursor)

    returnDocuments = []
    # Print or process the documents
    for document in documents:
        serialized_document = {
            key: value for key, value in document.items() if key != '_id'
        }
        returnDocuments.append(serialized_document)

    return Response(returnDocuments)


def index(request):

    last_height = blockcypher.get_latest_block_height(coin_symbol='bcy',api_key=token)
    print("The latest BCY block height is:", last_height)
    message = "  <h1>   App is running...        </h1>"
    # return HttpResponse(

    #     {last_height, message },

    #     )
    return last_height


@api_view(['POST'])
def add_person(request):

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
    print("keypair", keypair)
    new_wallet_name = request.GET.get('newWalletName')
    print("new wallet name", new_wallet_name)
    wallet_name = new_wallet_name
    wallet = create_wallet_from_address(wallet_name=new_wallet_name, address=keypair['address'],coin_symbol='bcy',api_key=token)


    print("new wallet", wallet)
    test_collection.insert_one(wallet)


    cursor = test_collection.find()

    # Iterate over the cursor to retrieve all documents
    documents = list(cursor)

    # Print or process the documents
    for document in documents:

        if document.get('name') == wallet_name:
            print(document.get('name'), " ---", wallet_name)
            # Assuming wallet_id is the ObjectId of the wallet you want to update
            wallet_id = document.get('_id')
            print(wallet_id)


            # Update the balance using update_one
            result = test_collection.update_one(
                {"_id": wallet_id},
                {"$set": {"keypair": keypair}}
            )

            # Check if the update was successful
            if result.modified_count > 0:
                print("New Wallet created successfully")
            else:
                print("No documents matched the query")

    # Convert the MongoDB document to a Python dictionary and exclude the '_id' field
    serialized_wallet = {
        key: value for key, value in wallet.items() if key != '_id'
    }

    #return JsonResponse(wallet)
    return Response(serialized_wallet)



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


# @api_view(['GET'])
def get_wallet_details(request):
    print("="*66)
    wallet_name = request.GET.get('walletName')
    print(wallet_name)
    wallet_details = get_wallet_balance(wallet_name=wallet_name, api_key=token, coin_symbol='bcy')
    print()
    print("balance", wallet_details.get('balance'))
    wallet_balance =  wallet_details.get('balance')
    print(wallet_details)
    #update database with latest info
    cursor = test_collection.find({'name': wallet_name})

    # Iterate over the cursor to retrieve all documents
    document = list(cursor)
    print("document", document)
    wallet_id = document[0].get('_id')
    print("id", wallet_id)

    if document:
        result = test_collection.update_one(
            {'_id': wallet_id},
            {'$set': {'balance': wallet_balance}}
        )
        if result.modified_count > 0:
            print("Balance updated successfully")
        else:
            print("No documents matched the query or the balance was not updated")

    return JsonResponse(wallet_details)


#@api_view(['GET'])
def get_wallets(request):
    # Logic to retrieve wallet names

    wallets = list_wallet_names(token,coin_symbol='bcy')
    print(wallets)
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



#@api_view(['POST'])
def send_money(request):
    # Logic to send money from one wallet to another
    print("+"*48)
    wallet_name_amount_toWallet = request.GET.get('walletName_amount_toWallet')
    print(wallet_name_amount_toWallet)
    result_list = wallet_name_amount_toWallet.split("_")

    wallet_name = result_list[0]
    amount_to_send = int(result_list[1])
    to_wallet = result_list[2]

    print("new wallet name", wallet_name, " amount to fund ", amount_to_send, " to wallet", to_wallet)
    print()

    from_address = get_wallet_addresses(wallet_name=wallet_name, api_key=token,coin_symbol='bcy')
    #print(' wallet to send coin from', from_address)
    #print('alice address_____', from_address['addresses'][0])
    fromAddress = from_address['addresses'][0]
    print('fromAddress', fromAddress)

    cursor = test_collection.find()

    # Iterate over the cursor to retrieve all documents
    documents = list(cursor)
    private_keypair = ''
    for document in documents:

        if document.get('name') == wallet_name:
            print(document.get('name'), " ---", wallet_name)
            # Assuming wallet_id is the ObjectId of the wallet you want to update
            wallet_id = document.get('_id')
            print(wallet_id)

            if document.get('keypair'):
                print("keypair", document.get('keypair'))
                keys = document.get('keypair')
                print(keys)
                print("private key", keys.get('private'))
                private_keypair = keys.get('private')

    to_address = get_wallet_addresses(wallet_name=to_wallet, api_key=token,coin_symbol='bcy')

    toAddress = to_address['addresses'][0]
    print("toAddress", toAddress)



    tx_ref = blockcypher.simple_spend(
        from_privkey=private_keypair,to_address=toAddress,to_satoshis=amount_to_send,coin_symbol='bcy',api_key=token)
    print("Txid is", tx_ref)
    print("*"*48)
    result = get_broadcast_transactions(limit=1)
    print("result ******************", result)
    #update database with new balance
    if tx_ref:
        #update sending wallet
        if document.get('name') == wallet_name:
            wallet_id = document.get('_id')
            print(wallet_id)
            current_balance = get_current_balance(wallet_name) or 0
            new_balance = current_balance  # Set the new balance value

            result = test_collection.update_one(
                {"_id": wallet_id},
                {"$set": {"balance": new_balance}}
            )

            # Check if the update was successful
            if result.modified_count > 0:
                print("Balance updated successfully after send")
            else:
                print("No documents matched the query or the balance was not updated")
    else:
        return JsonResponse({'message': 'Send may have failed!'})


    return JsonResponse({'message': 'Transaction successful'})



def get_current_balance(wallet_name):
    wallet_balance = get_wallet_balance(wallet_name=wallet_name, api_key=token, coin_symbol='bcy')
    print("wallet balance",wallet_balance)
    wallet_balance = wallet_balance.get('balance')
    return wallet_balance


#@api_view(['POST'])
def fund_wallet(request):

    print("-"*48)
    wallet_name_amount = request.GET.get('walletName_amount')
    result_list = wallet_name_amount.split("_")
    wallet_name = result_list[0]
    amount_to_fund = int(result_list[1])
    print("new wallet name", wallet_name, " amount to fund ", amount_to_fund)

    #get address of wallet
    get_address = get_wallet_addresses(wallet_name=wallet_name, api_key=token,coin_symbol='bcy')
    print('get address_____', get_address)

    faucet_tx = blockcypher.send_faucet_coins(address_to_fund=get_address['addresses'][0],satoshis=amount_to_fund,coin_symbol='bcy',api_key=token)
    print("Faucet txid is", faucet_tx['tx_ref'])
    print(faucet_tx)

    ######################################################
    #sync wallet with mongodb



    cursor = test_collection.find()

    # Iterate over the cursor to retrieve all documents
    documents = list(cursor)

    # Print or process the documents
    for document in documents:

        if document.get('name') == wallet_name:
            print(document.get('name'), " ---", wallet_name)
            # Assuming wallet_id is the ObjectId of the wallet you want to update
            wallet_id = document.get('_id')
            print(wallet_id)
            current_balance = get_current_balance(wallet_name) or 0

            # Update the balance using update_one
            result = test_collection.update_one(
                {"_id": wallet_id},
                {"$set": {"balance": current_balance}}
            )

            # Check if the update was successful
            if result.modified_count > 0:
                print("Balance updated successfully")
            else:
                print("No documents matched the query or the balance was not updated")


    return JsonResponse({'message': 'in fund wallet'})


#@api_view(['DELETE'])
def delete_user_wallet(request):
    # Logic to delete a  wallet

    wallet_name_to_delete = request.GET.get('walletNameToDelete')

    print(" wallet to be deleted", wallet_name_to_delete)

    walletDeleted = delete_wallet(wallet_name=wallet_name_to_delete, api_key=token, coin_symbol='bcy')

    cursor = test_collection.find()

    # Iterate over the cursor to retrieve all documents
    documents = list(cursor)

        # Print or process the documents
    for document in documents:

        if document.get('name') == wallet_name_to_delete:
            print(document.get('name'), " ---", wallet_name_to_delete)
            # Assuming wallet_id is the ObjectId of the wallet you want to update
            wallet_id = document.get('_id')
            print(wallet_id)

            result = test_collection.delete_one(
                {"_id": wallet_id}
            )

            if result.acknowledged == True:
                return JsonResponse({'message': "Delete successful"})
            else:
                return JsonResponse({'message': "Delete failed"})
