import os

AI_ENABLED = os.getenv("AI_ENABLED", "false").lower() == "true"
AI_PROVIDER = os.getenv("AI_PROVIDER", "none")
AI_MODEL = os.getenv("AI_MODEL", "placeholder")

def suggest_workers_stub(job, candidates):
    # Deterministic mock: rank by expertise match and availability
    ranked = sorted(candidates, key=lambda c: (-c.get('expertise_score', 0), c.get('name')))
    return [{
        'worker_id': c['id'],
        'score': c.get('expertise_score', 50),
        'reason': f"Expertise match: {c.get('expertise_score', 50)}"
    } for c in ranked[:5]]

def schedule_summary_stub(from_date, to_date, jobs):
    return f"Schedule summary from {from_date} to {to_date}: {len(jobs)} jobs."

def job_change_reason_check_stub(field, old_value, new_value, reason):
    if reason and len(reason) > 10:
        return {"ok": True, "message": "Reason accepted."}
    return {"ok": False, "message": "Reason too short."}
