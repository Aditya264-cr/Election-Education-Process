import json
import sys
import os

def audit_geo_json(file_path):
    print(f"Auditing {file_path}...")
    if not os.path.exists(file_path):
        print(f"❌ ERROR: File {file_path} not found.")
        return False
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    for feature in data['features']:
        props = feature['properties']
        pc_name = props.get('pc_name')
        lgd_code = props.get('lgd_code')
        ac_no = props.get('ac_no')
        
        if not lgd_code or not lgd_code.startswith('LGD-'):
            print(f"❌ ERROR: Missing or invalid LGD code for {pc_name}")
            return False
        if not ac_no:
            print(f"❌ ERROR: Missing AC Number for {pc_name}")
            return False
            
    print("✅ Geo-spatial audit passed.")
    return True

def audit_legal_rules():
    print("Auditing Legal Rules...")
    # Mocking the import to check rule structure
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    try:
        from app.agents.constitutional_compliance import LEGAL_RULES
        for rule_id, rule in LEGAL_RULES.items():
            if 'source_ids' not in rule or 'source_metadata' not in rule:
                print(f"❌ ERROR: Rule {rule_id} missing source metadata/pedigree.")
                return False
        print("✅ Legal logic audit passed.")
        return True
    except Exception as e:
        print(f"❌ ERROR: Failed to load LEGAL_RULES: {e}")
        return False

if __name__ == "__main__":
    geo_ok = audit_geo_json('frontend/src/data/india_pc_2019.json')
    legal_ok = audit_legal_rules()
    
    if geo_ok and legal_ok:
        print("🚀 Sovereign Audit Successful. SIP Protocol Active.")
        sys.exit(0)
    else:
        print("🛑 Sovereign Audit Failed. Integrity Compromised.")
        sys.exit(1)
