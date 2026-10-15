from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import jwt_required

skills_bp = Blueprint("skills", __name__, url_prefix="/api/skills")

SKILL_SUGGESTIONS = {
    "Software Engineering": ["JavaScript", "React", "Python", "Flask", "TypeScript", "HTML", "CSS", "Git", "REST APIs", "Node.js", "SQL", "Docker"],
    "Data & Analytics": ["SQL", "Python", "Pandas", "Excel", "Data Visualization", "Tableau", "Power BI", "Statistics", "Data Cleaning"],
    "AI / Machine Learning": ["Python", "NumPy", "Pandas", "Scikit-learn", "PyTorch", "Statistics", "Model Evaluation", "Vector Databases", "Prompt Engineering"],
    "Design & UI/UX": ["Figma", "User Research", "Wireframing", "Prototyping", "Accessibility", "Design Systems", "Usability Testing"],
    "Cloud & Infrastructure": ["Linux", "Docker", "AWS", "CI/CD", "Bash", "Kubernetes", "Terraform", "Git"],
    "Cybersecurity": ["Networking", "Linux", "Security Principles", "Vulnerability Assessment", "Wireshark", "OWASP", "SIEM"]
}

@skills_bp.get("")
@jwt_required
def get_user_skills():
    conn = get_db_connection()
    try:
        rows = conn.execute(
            "SELECT id, skill_name, proficiency, category, years_exp, created_at "
            "FROM user_skills WHERE user_id = ? ORDER BY proficiency DESC",
            (request.user_id,)
        ).fetchall()
        return jsonify({"skills": [dict(r) for r in rows]})
    finally:
        conn.close()

@skills_bp.post("")
@jwt_required
def add_user_skill():
    payload = request.get_json(silent=True) or {}
    skill_name = str(payload.get("skill_name", "")).strip()[:80]
    proficiency = int(payload.get("proficiency", 65))
    category = str(payload.get("category", "General")).strip()[:50]
    years_exp = float(payload.get("years_exp", 1.0))

    if not skill_name:
        return jsonify({"error": "Skill name is required."}), 400
    
    proficiency = max(5, min(100, proficiency))
    years_exp = max(0.1, min(20.0, years_exp))

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute("""
                INSERT INTO user_skills (user_id, skill_name, proficiency, category, years_exp)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id, skill_name) DO UPDATE SET
                    proficiency = excluded.proficiency,
                    category = excluded.category,
                    years_exp = excluded.years_exp
            """, (request.user_id, skill_name, proficiency, category, years_exp))
            skill_id = cursor.lastrowid
        return jsonify({
            "message": "Skill added successfully.",
            "skill": {
                "id": skill_id,
                "skill_name": skill_name,
                "proficiency": proficiency,
                "category": category,
                "years_exp": years_exp
            }
        }), 201
    finally:
        conn.close()

@skills_bp.put("/<int:skill_id>")
@jwt_required
def update_user_skill(skill_id):
    payload = request.get_json(silent=True) or {}
    proficiency = payload.get("proficiency")
    category = payload.get("category")
    years_exp = payload.get("years_exp")

    conn = get_db_connection()
    try:
        # Check ownership
        existing = conn.execute(
            "SELECT id FROM user_skills WHERE id = ? AND user_id = ?",
            (skill_id, request.user_id)
        ).fetchone()

        if not existing:
            return jsonify({"error": "Skill record not found or unauthorized."}), 404

        updates = []
        params = []
        if proficiency is not None:
            updates.append("proficiency = ?")
            params.append(max(5, min(100, int(proficiency))))
        if category is not None:
            updates.append("category = ?")
            params.append(str(category).strip()[:50])
        if years_exp is not None:
            updates.append("years_exp = ?")
            params.append(max(0.1, min(20.0, float(years_exp))))

        if not updates:
            return jsonify({"message": "No changes submitted."})

        params.extend([skill_id, request.user_id])
        with conn:
            conn.execute(f"UPDATE user_skills SET {', '.join(updates)} WHERE id = ? AND user_id = ?", params)

        return jsonify({"message": "Skill updated successfully."})
    finally:
        conn.close()

@skills_bp.delete("/<int:skill_id>")
@jwt_required
def delete_user_skill(skill_id):
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                "DELETE FROM user_skills WHERE id = ? AND user_id = ?",
                (skill_id, request.user_id)
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Skill not found or unauthorized."}), 404
        return jsonify({"message": "Skill removed successfully."})
    finally:
        conn.close()

@skills_bp.get("/suggestions")
def get_skill_suggestions():
    return jsonify({"categories": SKILL_SUGGESTIONS})
