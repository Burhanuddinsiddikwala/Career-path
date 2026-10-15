import json
from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import jwt_required, optional_jwt
from matching import rank_jobs, calculate_skill_alignment, build_explanation

career_bp = Blueprint("careers", __name__, url_prefix="/api/careers")

def parse_role_row(row):
    """Converts a SQLite row from career_roles into a clean Python dictionary."""
    data = dict(row)
    data["responsibilities"] = json.loads(data.get("responsibilities_json", "[]"))
    data["skills"] = json.loads(data.get("skills_json", "[]"))
    data["related_skills"] = json.loads(data.get("related_skills_json", "[]"))
    data["learning"] = json.loads(data.get("learning_json", "[]"))
    data["resources"] = json.loads(data.get("resources_json", "[]"))
    data.pop("responsibilities_json", None)
    data.pop("skills_json", None)
    data.pop("related_skills_json", None)
    data.pop("learning_json", None)
    data.pop("resources_json", None)
    return data

def get_user_skills_dict(conn, user_id):
    """Fetches user skills as a dict of skill_name -> proficiency."""
    if not user_id:
        return {}
    rows = conn.execute("SELECT skill_name, proficiency FROM user_skills WHERE user_id = ?", (user_id,)).fetchall()
    return {r["skill_name"]: r["proficiency"] for r in rows}

def get_user_saved_ids(conn, user_id):
    """Returns set of role_ids saved by the user."""
    if not user_id:
        return set()
    rows = conn.execute("SELECT role_id FROM saved_careers WHERE user_id = ?", (user_id,)).fetchall()
    return {r["role_id"] for r in rows}

@career_bp.get("")
@optional_jwt
def get_all_careers():
    q = request.args.get("q", "").strip().lower()
    category = request.args.get("category", "").strip()
    exp_level = request.args.get("experience", "").strip()

    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT * FROM career_roles ORDER BY title ASC").fetchall()
        roles = [parse_role_row(r) for r in rows]

        user_skills = get_user_skills_dict(conn, request.user_id)
        saved_ids = get_user_saved_ids(conn, request.user_id)

        # Apply filters
        filtered = []
        for role in roles:
            if category and category.lower() != "all" and role["category"].lower() != category.lower():
                continue
            if exp_level and exp_level.lower() not in role["experience_level"].lower():
                continue
            if q:
                search_text = f"{role['title']} {role['summary']} {' '.join(role['skills'])} {role['category']}".lower()
                if q not in search_text:
                    continue

            # Annotate with user match if skills exist
            if user_skills:
                alignment = calculate_skill_alignment(user_skills, role["skills"], role["related_skills"])
                role["match_score"] = alignment["score"]
                role["matched_skills"] = alignment["matched_skills"]
                role["missing_skills"] = alignment["missing_skills"]
            else:
                role["match_score"] = 0.0
                role["matched_skills"] = []
                role["missing_skills"] = role["skills"]

            role["is_saved"] = role["id"] in saved_ids
            filtered.append(role)

        # If user has skills and no explicit sort, sort by match score
        if user_skills:
            filtered.sort(key=lambda x: x["match_score"], reverse=True)

        return jsonify({
            "roles": filtered,
            "total": len(filtered),
            "disclaimer": "All role postings represent curated educational career profiles, not live commercial vacancies."
        })
    finally:
        conn.close()

@career_bp.get("/<role_id>")
@optional_jwt
def get_career_detail(role_id):
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM career_roles WHERE id = ?", (role_id,)).fetchone()
        if not row:
            return jsonify({"error": "Career role not found."}), 404

        role = parse_role_row(row)
        user_skills = get_user_skills_dict(conn, request.user_id)
        saved_ids = get_user_saved_ids(conn, request.user_id)

        alignment = calculate_skill_alignment(user_skills, role["skills"], role["related_skills"])
        role["match_score"] = alignment["score"]
        role["matched_skills"] = alignment["matched_skills"]
        role["missing_skills"] = alignment["missing_skills"]
        role["matched_related"] = alignment["matched_related"]
        role["missing_related"] = alignment["missing_related"]
        role["all_missing_prioritized"] = alignment["all_missing_prioritized"]
        role["is_saved"] = role["id"] in saved_ids
        role["explanation"] = build_explanation(
            role["title"],
            role["match_score"],
            alignment["matched_skills"],
            alignment["missing_skills"]
        )

        return jsonify({"role": role})
    finally:
        conn.close()

@career_bp.post("/match")
@optional_jwt
def match_careers():
    payload = request.get_json(silent=True) or {}
    skills_input = payload.get("skills")
    interests = payload.get("interests", [])
    location = str(payload.get("location", "Remote")).strip()
    use_semantic = bool(payload.get("use_semantic", False))

    conn = get_db_connection()
    try:
        # If skills not provided in payload, fall back to authenticated user skills
        if skills_input is None and request.user_id:
            user_skills = get_user_skills_dict(conn, request.user_id)
        elif isinstance(skills_input, list):
            user_skills = {s: 70 for s in skills_input if s}
        elif isinstance(skills_input, dict):
            user_skills = skills_input
        else:
            user_skills = {}

        if not user_skills:
            return jsonify({"error": "Please provide at least one skill to calculate career alignment."}), 400

        rows = conn.execute("SELECT * FROM career_roles").fetchall()
        catalogue = [parse_role_row(r) for r in rows]

        results = rank_jobs(
            {"skills": user_skills, "interests": interests, "location": location},
            catalogue,
            use_semantic=use_semantic
        )

        saved_ids = get_user_saved_ids(conn, request.user_id)
        for item in results:
            item["is_saved"] = item["id"] in saved_ids

        # Log match history if authenticated
        if request.user_id:
            with conn:
                conn.execute("""
                    INSERT INTO match_history (user_id, skills_json, interests_json, method, top_role)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    request.user_id,
                    json.dumps(list(user_skills.keys())),
                    json.dumps(interests),
                    results[0]["match_method"] if results else "none",
                    results[0]["title"] if results else None
                ))

        return jsonify({
            "results": results,
            "meta": {
                "count": len(results),
                "method": results[0]["match_method"] if results else "none",
                "notice": "Scores indicate profile-to-role similarity, not a probability of employment."
            }
        })
    finally:
        conn.close()

@career_bp.get("/saved")
@jwt_required
def get_saved_careers():
    conn = get_db_connection()
    try:
        rows = conn.execute("""
            SELECT s.id as saved_id, s.notes, s.created_at as saved_at, r.*
            FROM saved_careers s
            JOIN career_roles r ON s.role_id = r.id
            WHERE s.user_id = ?
            ORDER BY s.created_at DESC
        """, (request.user_id,)).fetchall()

        saved = []
        user_skills = get_user_skills_dict(conn, request.user_id)
        for r in rows:
            data = parse_role_row(r)
            data["saved_id"] = r["saved_id"]
            data["notes"] = r["notes"]
            data["saved_at"] = r["saved_at"]
            data["is_saved"] = True
            alignment = calculate_skill_alignment(user_skills, data["skills"], data["related_skills"])
            data["match_score"] = alignment["score"]
            data["matched_skills"] = alignment["matched_skills"]
            data["missing_skills"] = alignment["missing_skills"]
            saved.append(data)

        return jsonify({"saved_careers": saved})
    finally:
        conn.close()

@career_bp.post("/save")
@jwt_required
def save_career():
    payload = request.get_json(silent=True) or {}
    role_id = str(payload.get("role_id", "")).strip()
    notes = str(payload.get("notes", "")).strip()[:300]

    if not role_id:
        return jsonify({"error": "Role ID is required."}), 400

    conn = get_db_connection()
    try:
        role = conn.execute("SELECT title FROM career_roles WHERE id = ?", (role_id,)).fetchone()
        if not role:
            return jsonify({"error": "Career role not found."}), 404

        with conn:
            conn.execute("""
                INSERT INTO saved_careers (user_id, role_id, notes)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id, role_id) DO UPDATE SET notes = excluded.notes
            """, (request.user_id, role_id, notes))

        return jsonify({"message": f"{role['title']} saved to your career targets.", "is_saved": True})
    finally:
        conn.close()

@career_bp.delete("/saved/<role_id>")
@jwt_required
def unsave_career(role_id):
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                "DELETE FROM saved_careers WHERE user_id = ? AND role_id = ?",
                (request.user_id, role_id)
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Role not in saved list."}), 404

        return jsonify({"message": "Career role removed from saved list.", "is_saved": False})
    finally:
        conn.close()

@career_bp.get("/<role_id>/gap")
@jwt_required
def get_career_gap(role_id):
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM career_roles WHERE id = ?", (role_id,)).fetchone()
        if not row:
            return jsonify({"error": "Career role not found."}), 404

        role = parse_role_row(row)
        user_skills = get_user_skills_dict(conn, request.user_id)
        alignment = calculate_skill_alignment(user_skills, role["skills"], role["related_skills"])

        return jsonify({
            "role_id": role["id"],
            "role_title": role["title"],
            "match_score": alignment["score"],
            "matched_skills": alignment["matched_skills"],
            "missing_skills": alignment["missing_skills"],
            "matched_related": alignment["matched_related"],
            "missing_related": alignment["missing_related"],
            "prioritized_gaps": alignment["all_missing_prioritized"],
            "learning_recommendations": role["learning"],
            "resources": role["resources"]
        })
    finally:
        conn.close()
