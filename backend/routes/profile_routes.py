from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import jwt_required

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

def calculate_completion(user_dict, skills_count):
    """Calculates true dynamic profile completion percentage."""
    points = 0
    total = 8

    if user_dict.get("full_name"): points += 1
    if user_dict.get("education"): points += 1
    if user_dict.get("field_of_study"): points += 1
    if user_dict.get("target_role"): points += 1
    if user_dict.get("short_term_goal"): points += 1
    if user_dict.get("preferred_location"): points += 1
    if user_dict.get("learning_style"): points += 1
    if skills_count >= 3: points += 1

    return int(round((points / total) * 100))

@profile_bp.get("")
@jwt_required
def get_profile():
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT u.full_name, u.email, p.* FROM users u "
            "JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?",
            (request.user_id,)
        ).fetchone()

        if not row:
            return jsonify({"error": "Profile not found"}), 404

        skills_count = conn.execute(
            "SELECT COUNT(*) as count FROM user_skills WHERE user_id = ?",
            (request.user_id,)
        ).fetchone()["count"]

        profile_data = dict(row)
        completion_pct = calculate_completion(profile_data, skills_count)

        return jsonify({
            "profile": profile_data,
            "skills_count": skills_count,
            "completion_percentage": completion_pct
        })
    finally:
        conn.close()

@profile_bp.put("")
@jwt_required
def update_profile():
    payload = request.get_json(silent=True) or {}
    full_name = payload.get("full_name")
    education = str(payload.get("education", "")).strip()[:100]
    field_of_study = str(payload.get("field_of_study", "")).strip()[:100]
    stage = str(payload.get("stage", "Student")).strip()[:50]
    preferred_location = str(payload.get("preferred_location", "Remote")).strip()[:80]
    experience_level = str(payload.get("experience_level", "Entry-level")).strip()[:50]
    short_term_goal = str(payload.get("short_term_goal", "")).strip()[:200]
    long_term_goal = str(payload.get("long_term_goal", "")).strip()[:200]
    target_role = str(payload.get("target_role", "")).strip()[:100]
    learning_style = str(payload.get("learning_style", "Hands-on Projects")).strip()[:100]
    weekly_hours = int(payload.get("weekly_hours", 10))
    portfolio_projects = str(payload.get("portfolio_projects", "")).strip()[:500]

    conn = get_db_connection()
    try:
        with conn:
            if full_name:
                conn.execute(
                    "UPDATE users SET full_name = ?, updated_at = datetime('now') WHERE id = ?",
                    (str(full_name).strip(), request.user_id)
                )
            conn.execute("""
                UPDATE user_profiles SET
                    education = ?,
                    field_of_study = ?,
                    stage = ?,
                    preferred_location = ?,
                    experience_level = ?,
                    short_term_goal = ?,
                    long_term_goal = ?,
                    target_role = ?,
                    learning_style = ?,
                    weekly_hours = ?,
                    portfolio_projects = ?,
                    updated_at = datetime('now')
                WHERE user_id = ?
            """, (
                education, field_of_study, stage, preferred_location,
                experience_level, short_term_goal, long_term_goal,
                target_role, learning_style, weekly_hours, portfolio_projects,
                request.user_id
            ))
        return jsonify({"message": "Profile updated successfully."})
    finally:
        conn.close()

@profile_bp.post("/onboarding")
@jwt_required
def complete_onboarding():
    payload = request.get_json(silent=True) or {}
    education = str(payload.get("education", "")).strip()
    field_of_study = str(payload.get("field_of_study", "")).strip()
    stage = str(payload.get("stage", "Student")).strip()
    preferred_location = str(payload.get("preferred_location", "Remote")).strip()
    experience_level = str(payload.get("experience_level", "Entry-level")).strip()
    short_term_goal = str(payload.get("short_term_goal", "")).strip()
    long_term_goal = str(payload.get("long_term_goal", "")).strip()
    target_role = str(payload.get("target_role", "")).strip()
    learning_style = str(payload.get("learning_style", "Hands-on Projects")).strip()[:100]
    weekly_hours = int(payload.get("weekly_hours", 10))
    portfolio_projects = str(payload.get("portfolio_projects", "")).strip()[:500]
    skills = payload.get("skills", [])

    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                UPDATE user_profiles SET
                    education = ?,
                    field_of_study = ?,
                    stage = ?,
                    preferred_location = ?,
                    experience_level = ?,
                    short_term_goal = ?,
                    long_term_goal = ?,
                    target_role = ?,
                    learning_style = ?,
                    weekly_hours = ?,
                    portfolio_projects = ?,
                    onboarding_completed = 1,
                    updated_at = datetime('now')
                WHERE user_id = ?
            """, (
                education, field_of_study, stage, preferred_location,
                experience_level, short_term_goal, long_term_goal,
                target_role, learning_style, weekly_hours, portfolio_projects,
                request.user_id
            ))

            # Insert initial skills
            for item in skills:
                if isinstance(item, dict):
                    name = str(item.get("name", "")).strip()
                    prof = int(item.get("proficiency", 65))
                    cat = str(item.get("category", "General")).strip()
                elif isinstance(item, str):
                    name = item.strip()
                    prof = 65
                    cat = "General"
                else:
                    continue

                if name:
                    conn.execute("""
                        INSERT INTO user_skills (user_id, skill_name, proficiency, category)
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT(user_id, skill_name) DO UPDATE SET
                            proficiency = excluded.proficiency
                    """, (request.user_id, name, prof, cat))

            # Add confirmation notification
            conn.execute("""
                INSERT INTO notifications (user_id, title, message, link)
                VALUES (?, 'Profile Setup Complete', 'Your career recommendations and skill matches have been personalized.', '/dashboard')
            """, (request.user_id,))

        return jsonify({"message": "Onboarding completed successfully."})
    finally:
        conn.close()
