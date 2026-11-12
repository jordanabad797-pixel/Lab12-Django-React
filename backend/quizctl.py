#!/usr/bin/env python
import os
import sys
import argparse
import requests

def get_exit_code(status_code):
    """
    TODO(equipo): Map HTTP status code to exit code according to lab specifications.
    0: funcionó (2xx)
    1: otro error o mal uso
    2: validación (HTTP 400)
    3: no permitido (HTTP 401 o 403)
    4: no existe (HTTP 404)
    5: error del servidor (5xx)
    6: no hay conexión
    """
    if 200 <= status_code < 300:
        return 0
    if status_code == 400:
        return 2
    if status_code in (401, 403):
        return 3
    if status_code == 404:
        return 4
    if 500 <= status_code < 600:
        return 5
    return 1

def build_question_body(exam_id, text, choices):
    """
    TODO(equipo): Build the request body dictionary for creating a new question with choices.
    Choices input format from CLI: "Choice text:ok" or "Choice text" (where ':ok' means is_correct=True).
    """
    formatted_choices = []
    for choice_str in choices:
        if ':' in choice_str:
            c_text, marker = choice_str.rsplit(':', 1)
            is_correct = (marker.strip().lower() == 'ok')
        else:
            c_text = choice_str
            is_correct = False
        formatted_choices.append({
            "text": c_text.strip(),
            "is_correct": is_correct
        })
    
    return {
        "exam": int(exam_id),
        "text": text,
        "choices": formatted_choices
    }

def main():
    parser = argparse.ArgumentParser(description="Quiz Console Client (quizctl)")
    parser.add_argument('resource', nargs='?', choices=['exams', 'questions', 'choices', 'ops'], help='Resource to operate on')
    parser.add_argument('action', nargs='?', choices=['list', 'create', 'delete', 'detail'], help='Action to perform')
    parser.add_argument('id', nargs='?', type=int, help='Resource ID')
    parser.add_argument('--exam', type=int, help='Exam ID for question creation/filtering')
    parser.add_argument('--text', type=str, help='Question or Exam text')
    parser.add_argument('--choice', action='append', help='Choice text (e.g. "Answer:ok")')
    parser.add_argument('--search', type=str, help='Search query')
    parser.add_argument('--json', action='store_true', help='Output JSON format')
    parser.add_argument('--dry-run', action='store_true', help='Dry run: print request without sending')

    args = parser.parse_args()

    base_url = os.environ.get('QUIZ_URL', 'http://127.0.0.1:8000')
    token = os.environ.get('QUIZ_TOKEN', '')

    headers = {
        'Content-Type': 'application/json',
    }
    if token:
        headers['Authorization'] = f'Token {token}'

    if args.resource == 'ops':
        print("Available operations in OpenAPI contract:")
        print(" - exams list / create / detail / delete")
        print(" - questions list / create / detail / delete")
        print(" - choices list / create / detail / delete")
        sys.exit(0)

    if not args.resource or not args.action:
        parser.print_help()
        sys.exit(1)

    endpoint_map = {
        'exams': 'api/exams/',
        'questions': 'api/questions/',
        'choices': 'api/choices/'
    }

    url = f"{base_url.rstrip('/')}/{endpoint_map.get(args.resource, '')}"

    params = {}
    if args.search:
        params['search'] = args.search
    if args.exam and args.resource == 'questions':
        params['exam'] = args.exam

    body = None
    if args.action == 'create':
        if args.resource == 'questions':
            body = build_question_body(args.exam, args.text, args.choice or [])
        elif args.resource == 'exams':
            body = {"title": args.text, "description": ""}

    if args.action == 'delete' and args.id:
        url = f"{url}{args.id}/"

    if args.action == 'detail' and args.id:
        url = f"{url}{args.id}/"

    if args.dry_run:
        print(f"[DRY-RUN] Method: {args.action.upper() if args.action != 'list' else 'GET'}")
        print(f"[DRY-RUN] URL: {url}")
        if params:
            print(f"[DRY-RUN] Params: {params}")
        if body:
            print(f"[DRY-RUN] Body: {body}")
        sys.exit(0)

    try:
        if args.action == 'list':
            response = requests.get(url, headers=headers, params=params)
        elif args.action == 'detail':
            response = requests.get(url, headers=headers)
        elif args.action == 'create':
            response = requests.post(url, headers=headers, json=body)
        elif args.action == 'delete':
            response = requests.delete(url, headers=headers)
        else:
            print(f"Unknown action {args.action}")
            sys.exit(1)

        print(f"Status: {response.status_code}")
        if response.text:
            try:
                print(response.json())
            except Exception:
                print(response.text)

        sys.exit(get_exit_code(response.status_code))

    except requests.exceptions.ConnectionError:
        print("Error: No connection to server.")
        sys.exit(6)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
