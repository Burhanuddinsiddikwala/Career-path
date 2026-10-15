import json
from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import optional_jwt

search_bp = Blueprint("search", __name__, url_prefix="/api/search")

@search_bp.get("")
@optional_jwt
def global_search():
    q = request.args.get("q", "").strip().lower()
    if not q or len(q) < 2:
        return jsonify({"results": []})

    results = []
    conn = get_db_connection()
    try:
        # 1. Search Career Roles
        role_rows = conn.execute("""
            SELECT id, title, category, summary, skills_json FROM career_roles
        """).fetchall()

        for r in role_rows:
            skills = " ".join(json.loads(r["skills_json"]))
            haystack = f"{r['title']} {r['category']} {r['summary']} {skills}".lower()
            if q in haystack:
                results.append({
                    "type": "career",
                    "title": r["title"],
                    "subtitle": f"{r['category']} · Career Path",
                    "link": f"/careers?role={r['id']}",
                    "id": r["id"]
                })

        # 2. Search User's Learning Tasks (if logged in)
        if request.user_id:
            task_rows = conn.execute("""
                SELECT id, title, skill_category, status FROM learning_tasks
                WHERE user_id = ? AND (lower(title) LIKE ? OR lower(explanation) LIKE ?)
            """, (request.user_id, f"%{q}%", f"%{q}%")).fetchall()

            for t in task_rows:
                results.append({
                    "type": "task",
                    "title": t["title"],
                    "subtitle": f"Learning Task · {t['status'].capitalize()}",
                    "link": "/roadmap",
                    "id": t["id"]
                })

            # 3. Search User's Networking Contacts
            contact_rows = conn.execute("""
                SELECT id, contact_name, organization, role_title FROM networking_records
                WHERE user_id = ? AND (lower(contact_name) LIKE ? OR lower(organization) LIKE ?)
            """, (request.user_id, f"%{q}%", f"%{q}%")).fetchall()

            for c in contact_rows:
                results.append({
                    "type": "contact",
                    "title": c["contact_name"],
                    "subtitle": f"{c['role_title']} at {c['organization']}",
                    "link": "/networking",
                    "id": c["id"]
                })

        return jsonify({"results": results[:15], "query": q})
    finally:
        conn.close()
