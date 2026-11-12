from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from quiz.models import Exam

class PermissionsTestCase(TestCase):
    def setUp(self):
        self.exam = Exam.objects.create(title="Test Exam", description="Desc")
        self.profe_group, _ = Group.objects.get_or_create(name='profe')
        self.agente_group, _ = Group.objects.get_or_create(name='agente')

        self.human_user = User.objects.create_user(username='human', password='password')
        self.human_user.groups.add(self.profe_group)

        self.agent_user = User.objects.create_user(username='agent', password='password')
        self.agent_user.groups.add(self.agente_group)

        self.client = APIClient()

    def test_agent_cannot_delete(self):
        self.client.force_authenticate(user=self.agent_user)
        response = self.client.delete(f'/api/exams/{self.exam.id}/')
        self.assertEqual(response.status_code, 403)

    def test_human_can_delete(self):
        self.client.force_authenticate(user=self.human_user)
        response = self.client.delete(f'/api/exams/{self.exam.id}/')
        self.assertEqual(response.status_code, 204)

    def test_agent_can_create_and_modify(self):
        self.client.force_authenticate(user=self.agent_user)
        # Create
        response = self.client.post('/api/exams/', {'title': 'Agent Exam', 'description': 'Agent desc'})
        self.assertEqual(response.status_code, 201)
        exam_id = response.json()['id']
        # Modify
        response = self.client.patch(f'/api/exams/{exam_id}/', {'title': 'Updated Agent Exam'})
        self.assertEqual(response.status_code, 200)
