import os
import json
import hashlib
import yaml
import requests

AUDIT_LOG = 'agent_audit.jsonl'

ALLOWED_OPS = {
    'exams_list': ('GET', 'api/exams/'),
    'exams_create': ('POST', 'api/exams/'),
    'exams_detail': ('GET', 'api/exams/{id}/'),
    'exams_update': ('PUT', 'api/exams/{id}/'),
    'exams_partial_update': ('PATCH', 'api/exams/{id}/'),
    'exams_destroy': ('DELETE', 'api/exams/{id}/'),
    
    'questions_list': ('GET', 'api/questions/'),
    'questions_create': ('POST', 'api/questions/'),
    'questions_detail': ('GET', 'api/questions/{id}/'),
    'questions_update': ('PUT', 'api/questions/{id}/'),
    'questions_partial_update': ('PATCH', 'api/questions/{id}/'),
    'questions_destroy': ('DELETE', 'api/questions/{id}/'),

    'choices_list': ('GET', 'api/choices/'),
    'choices_create': ('POST', 'api/choices/'),
    'choices_detail': ('GET', 'api/choices/{id}/'),
    'choices_update': ('PUT', 'api/choices/{id}/'),
    'choices_partial_update': ('PATCH', 'api/choices/{id}/'),
    'choices_destroy': ('DELETE', 'api/choices/{id}/'),
}

def compute_hash(plan_dict):
    canonical = json.dumps(plan_dict, sort_keys=True)
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()[:12]

def log_audit(entry):
    with open(AUDIT_LOG, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entry) + '\n')

def process_intent(intent_str, approve_hash=None):
    # Parse intent (could be JSON, YAML, or raw string/code)
    plan = None
    try:
        # Try YAML (which parses JSON as well)
        plan = yaml.safe_load(intent_str)
    except Exception:
        pass

    if not isinstance(plan, dict):
        # Raw string or invalid intent structure
        plan_dict = {"raw_intent": intent_str, "op": "invalid"}
        h = compute_hash(plan_dict)
        audit_entry = {"intent": intent_str, "plan": plan_dict, "hash": h, "status": "rejected", "reason": "invalid or unsafe intent format"}
        log_audit(audit_entry)
        print(f"Plan Hash: {h}")
        print("REJECTED: Invalid or unsafe intent format.")
        return

    op = plan.get('op')
    if op not in ALLOWED_OPS:
        h = compute_hash(plan)
        audit_entry = {"intent": intent_str, "plan": plan, "hash": h, "status": "rejected", "reason": f"operation '{op}' not in allowed contract"}
        log_audit(audit_entry)
        print(f"Plan Hash: {h}")
        print(f"REJECTED: Operation '{op}' is not permitted.")
        return

    method, path_template = ALLOWED_OPS[op]
    
    # Check if destructive (DELETE)
    is_destructive = (method == 'DELETE')

    h = compute_hash(plan)

    if is_destructive:
        if not approve_hash or approve_hash != h:
            audit_entry = {"intent": intent_str, "plan": plan, "hash": h, "status": "pending_approval", "reason": "destructive operation requires human approval hash"}
            log_audit(audit_entry)
            print(f"DESTRUCTIVE OPERATION DETECTED.")
            print(f"Plan Hash: {h}")
            print(f"To approve, run with: --approve {h} and set QUIZ_TOKEN_HUMANO")
            return

    # Execute request
    base_url = os.environ.get('QUIZ_URL', 'http://127.0.0.1:8000').rstrip('/')
    
    # Choose token: agent token for non-destructive, human token for approved destructive
    if is_destructive:
        token = os.environ.get('QUIZ_TOKEN_HUMANO', '')
    else:
        token = os.environ.get('QUIZ_TOKEN_AGENTE', '') or os.environ.get('QUIZ_TOKEN_HUMANO', '')

    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Token {token}'

    path_params = plan.get('path', {})
    url_path = path_template.format(**path_params)
    url = f"{base_url}/{url_path}"

    query = plan.get('query', {})
    body = plan.get('body', {})

    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, params=query)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=body)
        elif method in ('PUT', 'PATCH'):
            method_func = requests.put if method == 'PUT' else requests.patch
            response = method_func(url, headers=headers, json=body)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            response = None

        status = response.status_code if response else 500
        data = response.json() if response and response.text and response.headers.get('content-type', '').startswith('application/json') else (response.text if response else '')

        audit_entry = {
            "intent": intent_str,
            "plan": plan,
            "hash": h,
            "status": "executed",
            "status_code": status,
            "response": data
        }
        log_audit(audit_entry)
        print(f"Plan Hash: {h}")
        print(f"SUCCESS: Status {status}")
        print(data)

    except Exception as e:
        audit_entry = {
            "intent": intent_str,
            "plan": plan,
            "hash": h,
            "status": "error",
            "error": str(e)
        }
        log_audit(audit_entry)
        print(f"Plan Hash: {h}")
        print(f"ERROR: {e}")
