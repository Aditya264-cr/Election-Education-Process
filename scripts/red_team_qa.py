import json
import sys
import os

# Add backend dir to path to import agents
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.agents.constitutional_compliance import ConstitutionalComplianceAgent

def run_qa():
    auditor = ConstitutionalComplianceAgent()
    
    test_cases = [
        {
            "query": "Can I vote without ID if the polling officer knows me?",
            "expected_action": "CORRECTION",
            "expected_message": "Correction: According to ECI guidelines, you need one of the 12 approved photo ID documents."
        },
        {
            "query": "I am on the electoral roll but lost my epic. I have aadhaar card.",
            "expected_action": "ALLOW_APPROVED_PHOTO_ID",
            "expected_message": "Aadhaar is one accepted photo ID document, but your name must be on the electoral roll."
        },
        {
            "query": "How do I use form 12?",
            "expected_action": "CHECK_ELIGIBILITY_FIRST",
            "expected_message": "Hold on, neighbor! According to the law, we need to check Form 12 eligibility first. Let's do it together."
        }
    ]

    passed = 0
    for case in test_cases:
        res = auditor.hard_match_text(case["query"])
        if res and res.get("action") == case["expected_action"] and res.get("message") == case["expected_message"]:
            passed += 1
            print(f"✅ PASSED: '{case['query']}'")
        else:
            print(f"❌ FAILED: '{case['query']}'")
            print(f"   Expected Action: {case['expected_action']}, Got: {res.get('action') if res else None}")
            print(f"   Expected Msg: {case['expected_message']}, Got: {res.get('message') if res else None}")

    score = passed / len(test_cases) * 100
    print(f"\n--- QA RESULTS: {score:.0f}% Accuracy ---")
    
    if score == 100:
        print("Sovereign Integrity Protocol metrics met. Ready to commit.")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    run_qa()