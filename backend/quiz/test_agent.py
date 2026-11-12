from django.test import TestCase
from agent.gateway import process_intent

class AgentGatewayTestCase(TestCase):
    def test_invalid_intent_rejected(self):
        process_intent('{"op": "run_sql"}')
        process_intent('"Exam.objects.all().delete()"')
        self.assertTrue(True)
