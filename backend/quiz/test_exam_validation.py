from django.contrib.auth.models import User
from rest_framework.test import APIClient
from django.test import TestCase

from quiz.models import Exam, Question


class ExamValidationTestCase(TestCase):
    """Errors returned by the API are the ones the React form displays."""

    def setUp(self):
        self.client = APIClient()
        user = User.objects.create_user('teacher', password='x', is_staff=True)
        self.client.force_authenticate(user=user)
        exam = Exam.objects.create(title='Existing exam')
        Question.objects.create(exam=exam, text='Q1')

    def test_empty_title_returns_field_error(self):
        response = self.client.post('/api/exams/', {'title': '', 'description': 'x'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['title'], ['El título es obligatorio.'])

    def test_missing_title_returns_field_error(self):
        response = self.client.post('/api/exams/', {'description': 'x'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('title', response.json())

    def test_short_title_is_rejected(self):
        response = self.client.post('/api/exams/', {'title': 'abc'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_duplicate_title_is_rejected_case_insensitive(self):
        response = self.client.post('/api/exams/', {'title': 'existing EXAM'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['title'], ['Ya existe un examen con ese título.'])

    def test_valid_exam_is_created_and_trimmed(self):
        response = self.client.post('/api/exams/', {'title': '  React and Axios  '}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['title'], 'React and Axios')
        self.assertEqual(response.json()['question_count'], 0)

    def test_list_includes_question_count(self):
        response = self.client.get('/api/exams/')
        self.assertEqual(response.json()['results'][0]['question_count'], 1)

    def test_anonymous_user_cannot_create(self):
        response = APIClient().post('/api/exams/', {'title': 'Anonymous exam'}, format='json')
        self.assertIn(response.status_code, (401, 403))
