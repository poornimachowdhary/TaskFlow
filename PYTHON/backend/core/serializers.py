from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Project, Task, Label, Comment, ActivityLog, UserBehavior


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        return attrs


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ['id', 'name', 'color', 'created_at']


class ProjectSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.ListField(write_only=True, required=False)
    labels = LabelSerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_by', 'members', 'member_ids', 'labels', 'task_count', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_task_count(self, obj):
        return obj.tasks.count()

    def create(self, validated_data):
        member_ids = validated_data.pop('member_ids', [])
        project = Project.objects.create(**validated_data)
        if member_ids:
            project.members.set(member_ids)
        return project


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    created_by = UserSerializer(read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    label_ids = serializers.ListField(write_only=True, required=False)
    comments = CommentSerializer(many=True, read_only=True)
    activity_logs = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'assigned_to', 'assigned_to_id',
            'created_by', 'status', 'priority', 'labels', 'label_ids', 'due_date',
            'estimated_hours', 'actual_hours', 'task_id', 'comments', 'activity_logs',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'task_id', 'created_at', 'updated_at']

    def get_activity_logs(self, obj):
        logs = obj.activity_logs.all()[:10]  # Get last 10 activities
        return ActivityLogSerializer(logs, many=True).data

    def create(self, validated_data):
        label_ids = validated_data.pop('label_ids', [])
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        task = Task.objects.create(**validated_data)
        
        if label_ids:
            task.labels.set(label_ids)
        if assigned_to_id:
            task.assigned_to_id = assigned_to_id
            task.save()
        
        # Log the creation
        ActivityLog.objects.create(
            task=task,
            user=validated_data['created_by'],
            action='created',
            description=f'Task created: {task.title}'
        )
        
        return task

    def update(self, instance, validated_data):
        label_ids = validated_data.pop('label_ids', None)
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # Track status changes
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        # Update the task
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update labels if provided
        if label_ids is not None:
            instance.labels.set(label_ids)
        
        # Update assigned user if provided
        if assigned_to_id is not None:
            instance.assigned_to_id = assigned_to_id
            instance.save()
        
        # Log status changes
        if old_status != new_status:
            ActivityLog.objects.create(
                task=instance,
                user=self.context['request'].user,
                action='status_changed',
                description=f'Status changed from {old_status} to {new_status}',
                old_value=old_status,
                new_value=new_status
            )
        
        return instance


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'action', 'description', 'user', 'old_value', 'new_value', 'timestamp']


class UserBehaviorSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBehavior
        fields = ['id', 'action_type', 'task', 'duration_seconds', 'metadata', 'timestamp']


class TaskStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Task.STATUS_CHOICES)
    task_id = serializers.IntegerField()

    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data['status']
        
        instance.status = new_status
        instance.save()
        
        # Log the status change
        ActivityLog.objects.create(
            task=instance,
            user=self.context['request'].user,
            action='status_changed',
            description=f'Status changed from {old_status} to {new_status}',
            old_value=old_status,
            new_value=new_status
        )
        
        return instance
