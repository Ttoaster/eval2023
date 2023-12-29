# serializers.py
from rest_framework import serializers

from base.models import Item


class WalletSerializer(serializers.Serializer):
    # Define wallet serialization fields
    pass

class TransactionSerializer(serializers.Serializer):
    # Define transaction serialization fields
    pass



class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'