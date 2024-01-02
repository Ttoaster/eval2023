#Token 0d225355af3f4f0fac72f8db8bab8847
#PS C:\Users\richa\Documents\CodingPractice\Paybilt\eval2023> curl http://api.blockcypher.com/v1/btc/main?token=$0d225355af3f4f0fac72f8db8bab8847
# StatusCode        : 200
# StatusDescription : OK
# Content           : {
#                       "name": "BTC.main",
#                       "height": 823192,
#                       "hash": "00000000000000000001c381a95e3eafa15fea7e0554ca1c853aae373307c604",
#                       "time": "2023-12-27T18:59:11.944904372Z",
#                       "latest_url": "https://api.block...
# RawContent        : HTTP/1.1 200 OK
#                     Connection: keep-alive
#                     Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept
#                     Access-Control-Allow-Methods: GET, POST, PUT, DELETE
#                     Access-Control-Allow-Origin...
# Forms             : {}
# Headers           : {[Connection, keep-alive], [Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type,
#                     Accept], [Access-Control-Allow-Methods, GET, POST, PUT, DELETE], [Access-Control-Allow-Origin,
#                     *]...}
# Images            : {}
# InputFields       : {}
# Links             : {}
# ParsedHtml        : mshtml.HTMLDocumentClass
# RawContentLength  : 775


import blockcypher
# import sys
# import json
# import ast # abstract syntax tree

# data_to_pass_back = "Sending from PY to JS"

# input = sys.argv[1]
# output = data_to_pass_back

# print(output)

# sys.stdout.flush()

token = "0d225355af3f4f0fac72f8db8bab8847"
last_height = blockcypher.get_latest_block_height(coin_symbol='bcy',api_key=token)
print("The latest BCY block height is:", last_height)
keypair = blockcypher.generate_new_address(coin_symbol='bcy',api_key=token)
print("My address is", keypair['address'])
print(keypair)
faucet_tx = blockcypher.send_faucet_coins(
    address_to_fund=keypair['address'],satoshis=100000,coin_symbol='bcy',api_key=token)
print("Faucet txid is", faucet_tx['tx_ref'])
print(faucet_tx)
faucet_addr = "CFr99841LyMkyX5ZTGepY58rjXJhyNGXHf"
tx_ref = blockcypher.simple_spend(
    from_privkey=keypair['private'],to_address=faucet_addr,to_satoshis=100,coin_symbol='bcy',api_key=token)
print("Txid is", tx_ref)

