from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from rest_framework.authtoken.models import Token
from quiz.models import Exam, Question, Choice

class Command(BaseCommand):
    help = 'Seeds initial quiz data and creates profe and agente users with tokens.'

    def handle(self, *args, **options):
        # Create groups
        profe_group, _ = Group.objects.get_or_create(name='profe')
        agente_group, _ = Group.objects.get_or_create(name='agente')

        # Create human user (profe)
        profe_user, _ = User.objects.get_or_create(username='profe')
        profe_user.is_staff = True
        profe_user.is_superuser = True
        profe_user.set_password('profe123')
        profe_user.groups.add(profe_group)
        profe_user.save()
        profe_token, _ = Token.objects.get_or_create(user=profe_user)

        # Create agent user (agente)
        agente_user, _ = User.objects.get_or_create(username='agente')
        agente_user.set_password('agente123')
        agente_user.groups.add(agente_group)
        agente_user.save()
        agente_token, _ = Token.objects.get_or_create(user=agente_user)

        # Seed sample data
        Exam.objects.all().delete()
        exam1 = Exam.objects.create(title='Python & Django REST Basics', description='Fundamentals of DRF and APIs')
        exam2 = Exam.objects.create(title='Advanced Django', description='ORM optimization and select_related/prefetch_related')

        q1 = Question.objects.create(exam=exam1, text='What is REST?')
        Choice.objects.create(question=q1, text='An architectural style for distributed hypermedia systems', is_correct=True)
        Choice.objects.create(question=q1, text='A programming language', is_correct=False)

        q2 = Question.objects.create(exam=exam2, text='Which method is used to optimize foreign key queries?')
        Choice.objects.create(question=q2, text='select_related', is_correct=True)
        Choice.objects.create(question=q2, text='prefetch_only', is_correct=False)

        self.stdout.write(self.style.SUCCESS('Quiz database seeded successfully!'))
        self.stdout.write(f'QUIZ_TOKEN_HUMANO="{profe_token.key}"')
        self.stdout.write(f'QUIZ_TOKEN_AGENTE="{agente_token.key}"')
