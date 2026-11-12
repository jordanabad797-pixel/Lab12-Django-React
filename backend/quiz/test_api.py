from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from quiz.models import Exam, Question, Choice

class ApiTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.profe_group, _ = Group.objects.get_or_create(name='profe')
        self.user = User.objects.create_user(username='admin_profe', password='password')
        self.user.groups.add(self.profe_group)
        self.client.force_authenticate(user=self.user)

        self.exam = Exam.objects.create(title="Math Exam", description="Algebra")

    def test_exam_list(self):
        response = self.client.get('/api/exams/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)

    def test_question_validation_exactly_one_correct(self):
        # Invalid: 0 correct choices
        data = {
            "exam": self.exam.id,
            "text": "What is 2+2?",
            "choices": [
                {"text": "3", "is_correct": False},
                {"text": "5", "is_correct": False}
            ]
        }
        response = self.client.post('/api/questions/', data, format='json')
        self.assertEqual(response.status_code, 400)

        # Valid: exactly 1 correct choice
        data_valid = {
            "exam": self.exam.id,
            "text": "What is 2+2?",
            "choices": [
                {"text": "3", "is_correct": False},
                {"text": "4", "is_correct": True}
            ]
        }
        response = self.client.post('/api/questions/', data_valid, format='json')
        self.assertEqual(response.status_code, 201)
