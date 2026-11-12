from django.test import SimpleTestCase
import quizctl

class QuizCtlTestCase(SimpleTestCase):
    def test_get_exit_code(self):
        self.assertEqual(quizctl.get_exit_code(200), 0)
        self.assertEqual(quizctl.get_exit_code(201), 0)
        self.assertEqual(quizctl.get_exit_code(400), 2)
        self.assertEqual(quizctl.get_exit_code(401), 3)
        self.assertEqual(quizctl.get_exit_code(403), 3)
        self.assertEqual(quizctl.get_exit_code(404), 4)
        self.assertEqual(quizctl.get_exit_code(500), 5)
        self.assertEqual(quizctl.get_exit_code(418), 1)

    def test_build_question_body(self):
        body = quizctl.build_question_body(1, "What is Django?", ["Framework:ok", "Language"])
        self.assertEqual(body['exam'], 1)
        self.assertEqual(body['text'], "What is Django?")
        self.assertEqual(len(body['choices']), 2)
        self.assertTrue(body['choices'][0]['is_correct'])
        self.assertFalse(body['choices'][1]['is_correct'])
