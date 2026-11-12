from django.test import TestCase, override_settings

from quiz.models import Exam

REACT_ORIGIN = 'http://localhost:5173'
FOREIGN_ORIGIN = 'http://evil.example.com'


@override_settings(CORS_ALLOWED_ORIGINS=[REACT_ORIGIN])
class CorsTestCase(TestCase):
    """The API only answers CORS headers to the authorized React origin."""

    def setUp(self):
        Exam.objects.create(title='CORS exam', description='')

    def test_allowed_origin_receives_header(self):
        response = self.client.get('/api/exams/', HTTP_ORIGIN=REACT_ORIGIN)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Access-Control-Allow-Origin'], REACT_ORIGIN)

    def test_foreign_origin_is_not_authorized(self):
        response = self.client.get('/api/exams/', HTTP_ORIGIN=FOREIGN_ORIGIN)
        self.assertNotIn('Access-Control-Allow-Origin', response)

    def test_no_wildcard_is_used(self):
        response = self.client.get('/api/exams/', HTTP_ORIGIN=REACT_ORIGIN)
        self.assertNotEqual(response['Access-Control-Allow-Origin'], '*')

    def test_preflight_allows_delete_with_authorization(self):
        response = self.client.options(
            '/api/exams/1/',
            HTTP_ORIGIN=REACT_ORIGIN,
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='DELETE',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='authorization,content-type',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('DELETE', response['Access-Control-Allow-Methods'])
        self.assertIn('authorization', response['Access-Control-Allow-Headers'])

    def test_admin_is_not_exposed_cross_origin(self):
        response = self.client.get('/admin/login/', HTTP_ORIGIN=REACT_ORIGIN)
        self.assertNotIn('Access-Control-Allow-Origin', response)
