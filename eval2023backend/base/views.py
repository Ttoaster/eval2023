# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
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
from blockcypher import get_broadcast_transactions
from blockcypher import get_transaction_details

import datetime



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
            wallet_id = document.get('_id')
            timestamp = datetime.datetime.now()
            # Update the mongodb
            result = test_collection.update_one(
                {"_id": wallet_id},
                {"$set": {"keypair": keypair, "timestamp": timestamp}},
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


    return Response(serialized_wallet)



@api_view(['GET'])
def get_balance(request):

    wallet_balance = get_wallet_balance(wallet_name='alice', api_key=token, coin_symbol='bcy')
    print("wallet balance",wallet_balance)
    print("bob balance", get_wallet_balance(wallet_name='bob', api_key=token, coin_symbol='bcy'))


    return JsonResponse(wallet_balance)


@api_view(['GET'])
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
    timestamp = datetime.datetime.now()
    if document:
        result = test_collection.update_one(
            {'_id': wallet_id},
            {'$set': {'balance': wallet_balance, "timestamp": timestamp}}
        )
        if result.modified_count > 0:
            print("Balance updated successfully")
        else:
            print("No documents matched the query or the balance was not updated")

    return JsonResponse(wallet_details)


@api_view(['GET'])
def get_wallets(request):
    # Logic to retrieve wallet names

    wallets = list_wallet_names(token,coin_symbol='bcy')
    print(wallets)

    #update mongodb with current time
    cursor = test_collection.find()
    # Iterate over the cursor to retrieve all documents
    documents = list(cursor)

    timestamp = datetime.datetime.now()
    for document in documents:
        wallet_id = document.get('_id')
        result = test_collection.update_one(
            {"_id": wallet_id},
            {"$set": {"timestamp": timestamp}}
        )
        # Check if the update was successful
        if result.modified_count > 0:
            print("Timestamp updated")
        else:
            print("No documents matched the query or the timestamp was not updated")


    return JsonResponse(wallets)



@api_view(['POST'])
def send_money(request):
    # Logic to send money from one wallet to another
    print("+"*48)
    wallet_name_amount_toWallet = request.GET.get('walletName_amount_toWallet')

    result_list = wallet_name_amount_toWallet.split("_")

    wallet_name = result_list[0]
    amount_to_send = int(result_list[1])
    to_wallet = result_list[2]

    print("new wallet name", wallet_name, " amount to fund ", amount_to_send, " to wallet", to_wallet)
    print()

    from_address = get_wallet_addresses(wallet_name=wallet_name, api_key=token,coin_symbol='bcy')

    cursor = test_collection.find()

    # Iterate over the cursor to retrieve all documents
    documents = list(cursor)
    private_keypair = ''
    for document in documents:

        if document.get('name') == wallet_name:
            print(document.get('name'), " ---", wallet_name)
            # Assuming wallet_id is the ObjectId of the wallet you want to update
            wallet_id = document.get('_id')

            if document.get('keypair'):
                keys = document.get('keypair')
                private_keypair = keys.get('private')

    to_address = get_wallet_addresses(wallet_name=to_wallet, api_key=token,coin_symbol='bcy')

    toAddress = to_address['addresses'][0]

    tx_ref = blockcypher.simple_spend(
        from_privkey=private_keypair,to_address=toAddress,to_satoshis=amount_to_send,coin_symbol='bcy',api_key=token)

    print("*"*48)
    result = get_broadcast_transactions(limit=1)

    #update database with new balance
    if tx_ref:
        #update sending wallet
        if document.get('name') == wallet_name:
            wallet_id = document.get('_id')

            current_balance = get_current_balance(wallet_name) or 0
            new_balance = current_balance  # Set the new balance value
            timestamp = datetime.datetime.now()
            result = test_collection.update_one(
                {"_id": wallet_id},
                {"$set": {"balance": new_balance, "timestamp": timestamp}}
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


@api_view(['POST'])
def fund_wallet(request):

    print("-"*48)
    wallet_name_amount = request.GET.get('walletName_amount')
    result_list = wallet_name_amount.split("_")
    wallet_name = result_list[0]
    amount_to_fund = int(result_list[1])

    #get address of wallet
    get_address = get_wallet_addresses(wallet_name=wallet_name, api_key=token,coin_symbol='bcy')

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
            timestamp = datetime.datetime.now()
            # Update the balance using update_one
            result = test_collection.update_one(
                {"_id": wallet_id},
                {"$set": {"balance": current_balance, "timestamp": timestamp}}
            )

            # Check if the update was successful
            if result.modified_count > 0:
                print("Balance updated successfully")
            else:
                print("No documents matched the query or the balance was not updated")


    return JsonResponse({'message': 'in fund wallet'})


@api_view(['DELETE'])
def delete_user_wallet(request):
    # Logic to delete a  wallet

    wallet_name_to_delete = request.GET.get('walletNameToDelete')
    print("!"*42)
    print(" wallet to be deleted", wallet_name_to_delete)

    delete_wallet(wallet_name=wallet_name_to_delete, api_key=token, coin_symbol='bcy')

    cursor = test_collection.find()

    # Iterate over the cursor to retrieve all documents
    documents = list(cursor)

        # Print or process the documents
    for document in documents:

        if document.get('name') == wallet_name_to_delete:
            # Assuming wallet_id is the ObjectId of the wallet you want to update
            wallet_id = document.get('_id')

            result = test_collection.delete_one(
                {"_id": wallet_id}
            )

            if result.acknowledged == True:
                return JsonResponse({'message': "Delete successful"})
            else:
                return JsonResponse({'message': "Delete failed"})



def get_transaction(request):
    test = 'f854aebae95150b379cc1187d848d58225f3c4157fe992bcd166f58bd5063449'
    result = get_transaction_details(test)
    print("@"* 55)
    print("result", result)
    print("-----------------------", result.get('confirmed'))
    print("-----------------------", result.get('confirmations'))
    print("-----------------------", result.get('confidence'))

    return JsonResponse(result)