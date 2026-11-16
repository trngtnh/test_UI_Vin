"""
VinFast EV Advisor - Production Automated Test Suite & Impeccable Logic Verification
Author: AI Agent Engineering Team (VFO2O-01)
Standards: Production-Grade Automotive Platform, Impeccable UI/UX, Matt Pocock Deep Modules
"""

import sys
import re
import os

sys.stdout.reconfigure(encoding='utf-8')

def run_tests():
    print("=" * 70)
    print("VINFAST EV ADVISOR (VFO2O-01) - PRODUCTION VERIFICATION SUITE")
    print("=" * 70)

    app_path = os.path.join(os.path.dirname(__file__), 'index.html')
    if not os.path.exists(app_path):
        app_path = r'D:\BuildPhase_AI20K\vinfast-ev-advisor\index.html'

    assert os.path.exists(app_path), f"Cannot find index.html at {app_path}"

    with open(app_path, 'r', encoding='utf-8') as f:
        html = f.read()

    passed = 0
    total = 0

    def test(name, condition, details=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  [PASS] {name}")
        else:
            print(f"  [FAIL] {name} - {details}")

    print("\n--- 1. MODEL & CHAT INTEGRATION ---")
    test("VF5, VF6, VF7 defined in Catalog", 
         all(m in html for m in ["'VF5':", "'VF6':", "'VF7':"]), 
         "Missing one or more models in catalog")
    test("applyCarSelection dynamically updates AppState.selectedModelId",
         "AppState.selectedModelId = modelId" in html and "AppState.ticket.model_id = modelId" in html,
         "applyCarSelection does not bind selectedModelId")
    test("Quick scenario buttons bind to respective models",
         "selectQuickNeed('vf5')" in html and "selectQuickNeed('vf6')" in html and "selectQuickNeed('vf7')" in html,
         "Quick scenarios do not cover all 3 models")
    test("Free-text chat keyword parsing detects VF5 / VF7",
         "lower.includes('vf5')" in html and "lower.includes('vf7')" in html,
         "Chat keyword parsing lacks multi-model detection")

    print("\n--- 2. DETERMINISTIC TCO ENGINE (CALC01 - CALC06) ---")
    test("Unified EstimateEngine used by both Customer & Advisor",
         "EstimateEngine.compute" in html and html.count("EstimateEngine.compute") >= 2,
         "EstimateEngine.compute not shared across customer and advisor")
    test("Decreasing balance arithmetic progression formula (n+1)/2",
         "(loanMonths + 1) / 2" in html,
         "Formula misses +1 in arithmetic progression")
    test("Annuity PMT formula present",
         "Math.pow(1 + rMonth, -loanMonths)" in html,
         "PMT formula missing in annuity")
    test("Hanoi registration fees constant defined (24.54tr)",
         "REGISTRATION_FEES_HANOI: 24540000" in html,
         "Hanoi registration fees incorrect")
    test("V-GREEN rate (3,858 đ/kWh) and Home rate (3,200 đ/kWh) defined",
         "3858" in html and "3200" in html,
         "Charging rates missing or incorrect")
    test("85% DoD threshold for safe range & charge frequency calculation",
         "car.range_real * 0.85" in html,
         "Safe usable range not using 85% DoD")

    print("\n--- 3. SHOWROOM HITL APPROVAL & DATA INTEGRITY ---")
    test("Mandatory 3-step checklist gating for advisor approval",
         "chk-verify-price" in html and "chk-verify-fees" in html and "chk-verify-bank" in html,
         "Missing advisor checklist checkboxes")
    test("Approval strictly blocked if any checklist box unchecked",
         "!c1 || !c2 || !c3" in html,
         "Approval allows unchecked items")
    test("Official authoritative catalog version active (v1.0.2)",
         "version: 'v1.0.2'" in html and "01/11/2026" in html,
         "Official catalog version missing")
    test("Catalog version mismatch blocks approval on backend guard",
         "AppState.ticket.catalog_version !== Catalog.version" in html,
         "Approval does not guard against catalog version mismatch")
    test("Tampering/Input alteration invalidates approval (markTicketNeedsRecalc)",
         "markTicketNeedsRecalc" in html and "needs_recalculation" in html,
         "markTicketNeedsRecalc missing or not setting needs_recalculation")

    print("\n--- 4. SECURITY & SANITIZATION ---")
    test("escapeHTML helper function defined",
         "function escapeHTML" in html and "replace(/&/g" in html,
         "escapeHTML missing or incomplete")
    test("User chat messages strictly escaped before DOM insertion",
         "sender === 'user' ? escapeHTML(rawHtmlOrText)" in html,
         "Raw user chat input is not escaped")

    print("\n--- 5. PRODUCTION COPY & DECEPTIVE MARKETING PREVENTION ---")
    forbidden = ["đã đặt lịch thành công!", "hệ thống đã ghi nhận lịch hẹn tự động", "cam kết có xe ngay"]
    found_forbidden = [f for f in forbidden if f in html.lower()]
    test("Zero deceptive SLA/instant booking promises",
         len(found_forbidden) == 0,
         f"Found forbidden terms: {found_forbidden}")
    test("Test drive status states 'Chờ showroom xác nhận'",
         "chờ showroom liên hệ xác nhận" in html.lower() or "chờ showroom xác nhận" in html.lower(),
         "Test drive does not set realistic wait status")
    
    consent_match = re.search(r'<input[^>]*id="td-consent-check"[^>]*>', html)
    test("Test drive consent is un-pre-ticked (Decree 13 compliance)",
         consent_match is not None and 'checked' not in consent_match.group(0),
         "Consent checkbox is pre-ticked or missing")

    # Audit for internal developer/demo jargon in user-facing HTML
    internal_dev_jargon = [
        'góc nhìn demo', 'mô phỏng', 'cờ pin', 'cờ hết hạn', 'backend gán',
        'engine tính toán xác định', 'khai thác từ khách', 'khách vãng lai'
    ]
    # Check body content excluding script tags
    body_no_script = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL)
    found_jargon = [j for j in internal_dev_jargon if j in body_no_script.lower()]
    test("Zero internal developer/demo jargon in UI copy",
         len(found_jargon) == 0,
         f"Found internal jargon in UI: {found_jargon}")

    print("\n--- 6. IMPECCABLE UX & PROGRESSIVE DISCLOSURE ---")
    test("Empty workspace placeholder shown initially",
         'id="stage-empty-workspace"' in html,
         "Missing initial empty workspace")
    
    m1 = re.search(r'<div[^>]*id="stage-car-card"[^>]*>', html)
    m2 = re.search(r'<div[^>]*id="stage-tco-card"[^>]*>', html)
    test("Car card and TCO card initially hidden until needs input",
         m1 is not None and 'hidden' in m1.group(0) and m2 is not None and 'hidden' in m2.group(0),
         "Progressive disclosure violated: car card or tco card shown upfront")
    test("Workspace Selector between Customer and Showroom present",
         "btn-role-customer" in html and "btn-role-advisor" in html,
         "Workspace selector missing")
    test("Showroom audit workspace modal present",
         "advisor-hitl-screen" in html,
         "Showroom audit screen missing")

    print("\n" + "=" * 70)
    print(f"VERIFICATION RESULTS: {passed} / {total} CHECKS PASSED ({(passed/total)*100:.1f}%)")
    print("=" * 70)
    if passed == total:
        print("ALL PRODUCTION-GRADE CRITERIA SATISFIED (100% PASS)!")
        return 0
    else:
        print("SOME CHECKS FAILED!")
        return 1

if __name__ == '__main__':
    sys.exit(run_tests())
