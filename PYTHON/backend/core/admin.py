from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Project, Task, Label, Comment, ActivityLog, UserBehavior


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'avatar')}),
    )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    filter_horizontal = ('members',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('task_id', 'title', 'project', 'assigned_to', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'project', 'created_at')
    search_fields = ('title', 'description', 'task_id')
    filter_horizontal = ('labels',)
    readonly_fields = ('task_id', 'created_at', 'updated_at')
    raw_id_fields = ('project', 'assigned_to', 'created_by')


@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'project', 'created_at')
    list_filter = ('project', 'created_at')
    search_fields = ('name',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'task__title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'action', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('task__title', 'user__username', 'description')
    readonly_fields = ('timestamp',)


@admin.register(UserBehavior)
class UserBehaviorAdmin(admin.ModelAdmin):
    list_display = ('user', 'action_type', 'task', 'timestamp')
    list_filter = ('action_type', 'timestamp')
    search_fields = ('user__username', 'action_type')
    readonly_fields = ('timestamp',)
