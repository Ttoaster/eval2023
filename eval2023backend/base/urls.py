from django.urls import path
from .views import create_wallet, get_balance, send_money, fund_wallet, get_wallets, get_wallet_details, delete_user_wallet, get_data, get_transaction




urlpatterns = [
    path('create_wallet/', create_wallet, name='create_wallet'),
    path('create_wallet/<str:newWalletName>', create_wallet, name='create_wallet'),
    path('delete_user_wallet/', delete_user_wallet, name='delete_user_wallet'),
    path('delete_user_wallet/<str:walletNameToDelete>', delete_user_wallet, name='delete_user_wallet'),
    path('get_balance/', get_balance, name='get_balance'),
    path('get_wallet_details/', get_wallet_details, name='get_wallet_details'),
    path('get_wallet_details/<str:walletName>/', get_wallet_details, name='get_wallet_details'),
    path('get_wallets/', get_wallets, name='get_wallets'),
    path('send_money/', send_money, name='send_money'),
    path('send_money/<str:walletName_amount_toWallet>/', send_money, name='send_money'),
    path('fund_wallet/', fund_wallet, name='fund_wallet'),
    path('fund_wallet/<str:walletName_amount>', fund_wallet, name='fund_wallet'),
    path('get_data/', get_data, name='get_data'),
    path('get_transaction/', get_transaction, name='get_transaction')
]