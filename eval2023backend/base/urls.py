from django.urls import path
from .views import create_wallet, get_balance, send_money
from . import views


urlpatterns = [
    path('', views.index),
    path('add/', views.add_person),
    path('show/', views.get_all_person),
    path('create_wallet/', create_wallet, name='create_wallet'),
    path('get_balance/<int:wallet_id>/', get_balance, name='get_balance'),
    path('send_money/', send_money, name='send_money'),
]