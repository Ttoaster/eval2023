from django.urls import path
from .views import create_wallet, get_balance, send_money, fund_wallet, get_wallets, get_wallet_details, delete_user_wallet
from . import views


urlpatterns = [
    path('', views.index),
    path('add/', views.add_person),
    path('show/', views.get_all_person),
    path('create_wallet/', create_wallet, name='create_wallet'),
    path('create_wallet/<str:newWalletName>', create_wallet, name='create_wallet'),
    path('delete_user_wallet/', delete_user_wallet, name='delete_user_wallet'),
    path('delete_user_wallet/<str:walletNameToDelete>', delete_user_wallet, name='delete_user_wallet'),
    path('get_balance/', get_balance, name='get_balance'),
    path('get_wallet_details/', get_wallet_details, name='get_wallet_details'),
    path('get_wallet_details/<str:walletName>/', get_wallet_details, name='get_wallet_details_with_name'),
    path('get_wallets/', get_wallets, name='get_wallets'),
    path('send_money/', send_money, name='send_money'),
    path('fund_wallet/', fund_wallet, name='fund_wallet'),
]