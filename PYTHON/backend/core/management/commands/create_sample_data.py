from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Project, Task, Label, UserBehavior
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample data for TaskFlow application'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create users
        scrum_master, created = User.objects.get_or_create(
            username='scrum_master',
            defaults={
                'email': 'scrum@teamsinspace.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'role': 'scrum_master',
                'is_active': True
            }
        )
        if created:
            scrum_master.set_password('password123')
            scrum_master.save()

        employee1, created = User.objects.get_or_create(
            username='employee1',
            defaults={
                'email': 'employee1@teamsinspace.com',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'role': 'employee',
                'is_active': True
            }
        )
        if created:
            employee1.set_password('password123')
            employee1.save()

        employee2, created = User.objects.get_or_create(
            username='employee2',
            defaults={
                'email': 'employee2@teamsinspace.com',
                'first_name': 'Bob',
                'last_name': 'Wilson',
                'role': 'employee',
                'is_active': True
            }
        )
        if created:
            employee2.set_password('password123')
            employee2.save()

        # Create project
        project, created = Project.objects.get_or_create(
            name='Teams in Space',
            defaults={
                'description': 'Software project for space exploration team management',
                'created_by': scrum_master,
                'is_active': True
            }
        )
        if created:
            project.members.add(scrum_master, employee1, employee2)

        # Create labels
        labels_data = [
            {'name': 'SPACE TRAVEL PARTNERS', 'color': '#fbbf24'},
            {'name': 'Local Mars Office', 'color': '#f97316'},
            {'name': 'SeeSpaceEZ Plus', 'color': '#60a5fa'},
            {'name': 'Large Team Support', 'color': '#a78bfa'},
        ]

        labels = []
        for label_data in labels_data:
            label, created = Label.objects.get_or_create(
                name=label_data['name'],
                project=project,
                defaults={'color': label_data['color']}
            )
            labels.append(label)

        # Create tasks matching the image
        tasks_data = [
            {
                'title': 'Engage Jupiter Express for outer solar system travel',
                'description': 'Establish partnership with Jupiter Express for long-distance space travel services',
                'status': 'todo',
                'priority': 'high',
                'assigned_to': employee1,
                'estimated_hours': 5,
                'labels': ['SPACE TRAVEL PARTNERS']
            },
            {
                'title': 'Create 90 day plans for all departments in the Mars Office',
                'description': 'Develop comprehensive 90-day strategic plans for each department',
                'status': 'todo',
                'priority': 'urgent',
                'assigned_to': employee2,
                'estimated_hours': 9,
                'labels': ['Local Mars Office']
            },
            {
                'title': 'Engage Saturn\'s Rings Resort as a preferred provider',
                'description': 'Negotiate partnership with Saturn\'s Rings Resort for accommodation services',
                'status': 'todo',
                'priority': 'medium',
                'assigned_to': employee1,
                'estimated_hours': 3,
                'labels': ['SPACE TRAVEL PARTNERS']
            },
            {
                'title': 'Enable Speedy SpaceCraft as the preferred',
                'description': 'Set up Speedy SpaceCraft as the preferred transportation provider',
                'status': 'todo',
                'priority': 'high',
                'assigned_to': employee2,
                'estimated_hours': 4,
                'labels': ['SPACE TRAVEL PARTNERS']
            },
            {
                'title': 'Requesting available flights is now taking > 5 seconds',
                'description': 'Performance issue with flight availability API needs optimization',
                'status': 'in_progress',
                'priority': 'high',
                'assigned_to': employee1,
                'estimated_hours': 3,
                'labels': ['SeeSpaceEZ Plus']
            },
            {
                'title': 'Engage Saturn Shuttle Lines for group tours',
                'description': 'Establish partnership for group tour transportation services',
                'status': 'in_progress',
                'priority': 'medium',
                'assigned_to': employee2,
                'estimated_hours': 4,
                'labels': ['SPACE TRAVEL PARTNERS']
            },
            {
                'title': 'Establish a catering vendor to provide meal service',
                'description': 'Find and contract with a reliable catering service for space missions',
                'status': 'in_progress',
                'priority': 'medium',
                'assigned_to': employee1,
                'estimated_hours': 4,
                'labels': ['Local Mars Office']
            },
            {
                'title': 'Register with the Mars Ministry of Revenue',
                'description': 'Complete registration process with Mars tax authorities',
                'status': 'code_review',
                'priority': 'high',
                'assigned_to': employee2,
                'estimated_hours': 3,
                'labels': ['Local Mars Office']
            },
            {
                'title': 'Draft network plan for Mars Office',
                'description': 'Create comprehensive network infrastructure plan for Mars office',
                'status': 'code_review',
                'priority': 'medium',
                'assigned_to': employee1,
                'estimated_hours': 3,
                'labels': ['Local Mars Office']
            },
            {
                'title': 'Homepage footer uses an inline style - should use a class',
                'description': 'Refactor homepage footer to use CSS classes instead of inline styles',
                'status': 'done',
                'priority': 'low',
                'assigned_to': employee2,
                'estimated_hours': 3,
                'actual_hours': 2,
                'labels': ['Large Team Support']
            },
            {
                'title': 'Engage JetShuttle SpaceWays for travel',
                'description': 'Establish partnership with JetShuttle SpaceWays for travel services',
                'status': 'done',
                'priority': 'high',
                'assigned_to': employee1,
                'estimated_hours': 5,
                'actual_hours': 6,
                'labels': ['SPACE TRAVEL PARTNERS']
            },
            {
                'title': 'Engage Saturn Shuttle Lines for group tours',
                'description': 'Complete partnership agreement with Saturn Shuttle Lines',
                'status': 'done',
                'priority': 'medium',
                'assigned_to': employee2,
                'estimated_hours': 1,
                'actual_hours': 1,
                'labels': ['SPACE TRAVEL PARTNERS']
            },
            {
                'title': 'Establish a catering vendor to provide meal service',
                'description': 'Successfully contracted with Galactic Catering Services',
                'status': 'done',
                'priority': 'medium',
                'assigned_to': employee1,
                'estimated_hours': 4,
                'actual_hours': 5,
                'labels': ['Local Mars Office']
            },
        ]

        for task_data in tasks_data:
            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                project=project,
                defaults={
                    'description': task_data['description'],
                    'status': task_data['status'],
                    'priority': task_data['priority'],
                    'assigned_to': task_data['assigned_to'],
                    'created_by': scrum_master,
                    'estimated_hours': task_data['estimated_hours'],
                    'actual_hours': task_data.get('actual_hours', 0),
                }
            )
            
            if created:
                # Add labels
                for label_name in task_data['labels']:
                    label = next((l for l in labels if l.name == label_name), None)
                    if label:
                        task.labels.add(label)

        # Create some user behavior data
        for i in range(50):
            UserBehavior.objects.get_or_create(
                user=random.choice([employee1, employee2]),
                action_type=random.choice(['task_created', 'task_completed', 'task_updated', 'comment_added']),
                defaults={
                    'duration_seconds': random.randint(30, 3600),
                    'metadata': {'source': 'web_app', 'timestamp': datetime.now().isoformat()}
                }
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )
        self.stdout.write('Users created:')
        self.stdout.write(f'  - scrum_master (password: password123)')
        self.stdout.write(f'  - employee1 (password: password123)')
        self.stdout.write(f'  - employee2 (password: password123)')
        self.stdout.write(f'Project: {project.name}')
        self.stdout.write(f'Tasks created: {Task.objects.filter(project=project).count()}')
