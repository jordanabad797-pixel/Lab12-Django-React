import sys
import argparse
from agent.gateway import process_intent

def main():
    parser = argparse.ArgumentParser(description="AI Agent Gateway")
    parser.add_argument('--intent', type=str, required=True, help='Intent string (JSON or YAML)')
    parser.add_argument('--approve', type=str, help='Approval hash for destructive operations')

    args = parser.parse_args()
    process_intent(args.intent, args.approve)

if __name__ == '__main__':
    main()
