from rest_framework import serializers
from accounts.models import User
from events.models import Event
Role=User.Role

class AssignRoleSerializer(serializers.ModelSerializer):
    user_id=serializers.IntegerField()
    role_name=serializers.CharField()   

    def validate(self,attrs):
        try:
            attrs['user']=User.objects.get(id=attrs['user_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist.")
        try:
            attrs['role']=Role.objects.get(name=attrs['role_name'])
        except Role.DoesNotExist:
            raise serializers.ValidationError("Role does not exist.")
        return attrs
    
    def save(self):
        user=self.validated_data['user']
        role=self.validated_data['role']
        user.roles.add(role)
        user.save()
        return user

class CreateEventSerializer(serializers.ModelSerializer):
    class Meta:
        model=Event
        fields=[
            'name','slug','description','start_datetime','end_datetime','location',
            'is_public','qr_code_url'
        ]

