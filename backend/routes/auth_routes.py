import re
from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import hash_password, check_password, generate_token, jwt_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()
    full_name = str(payload.get("full_name", "")).strip()
    password = str(payload.get("password", ""))
    confirm_password = str(payload.get("confirm_password", ""))

    if not email or not full_name or not password:
        return jsonify({"error": "Full name, email, and password are required."}), 400
    
    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please provide a valid email address."}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400
    
    if confirm_password and password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    conn = get_db_connection()
    try:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            return jsonify({"error": "An account with this email address already exists."}), 409
        
        pwd_hash = hash_password(password)
        with conn:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)",
                (email, pwd_hash, full_name)
            )
            user_id = cursor.lastrowid
            # Initialize empty profile
            conn.execute(
                "INSERT INTO user_profiles (user_id, stage, preferred_location, experience_level) VALUES (?, 'Student', 'Remote', 'Entry-level')",
                (user_id,)
            )
            # Add a welcome notification
            conn.execute(
                "INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)",
                (user_id, "Welcome to CareerPath AI!", "Start by completing your onboarding profile to unlock personalized career matching.", "/onboarding")
            )

        token = generate_token(user_id, email)
        return jsonify({
            "message": "Account created successfully.",
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "onboarding_completed": False
            }
        }), 201
    finally:
        conn.close()

@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT u.id, u.email, u.password_hash, u.full_name, p.onboarding_completed "
            "FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.email = ?",
            (email,)
        ).fetchone()

        if not user or not check_password(password, user["password_hash"]):
            return jsonify({"error": "Invalid email address or password."}), 401

        token = generate_token(user["id"], user["email"])
        return jsonify({
            "message": "Login successful.",
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "onboarding_completed": bool(user["onboarding_completed"])
            }
        })
    finally:
        conn.close()

@auth_bp.get("/me")
@jwt_required
def get_current_user():
    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT u.id, u.email, u.full_name, u.created_at, "
            "p.education, p.field_of_study, p.stage, p.preferred_location, "
            "p.experience_level, p.short_term_goal, p.long_term_goal, "
            "p.target_role, p.onboarding_completed, "
            "p.learning_style, p.weekly_hours, p.portfolio_projects "
            "FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?",
            (request.user_id,)
        ).fetchone()

        if not user:
            return jsonify({"error": "User account not found."}), 404

        skills = conn.execute(
            "SELECT id, skill_name, proficiency, category, years_exp FROM user_skills WHERE user_id = ?",
            (request.user_id,)
        ).fetchall()

        return jsonify({
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "created_at": user["created_at"],
                "profile": {
                    "education": user["education"] or "",
                    "field_of_study": user["field_of_study"] or "",
                    "stage": user["stage"] or "Student",
                    "preferred_location": user["preferred_location"] or "Remote",
                    "experience_level": user["experience_level"] or "Entry-level",
                    "short_term_goal": user["short_term_goal"] or "",
                    "long_term_goal": user["long_term_goal"] or "",
                    "target_role": user["target_role"] or "",
                    "learning_style": user["learning_style"] or "Hands-on Projects",
                    "weekly_hours": int(user["weekly_hours"] or 10),
                    "portfolio_projects": user["portfolio_projects"] or "",
                    "onboarding_completed": bool(user["onboarding_completed"])
                },
                "skills": [dict(s) for s in skills]
            }
        })
    finally:
        conn.close()

@auth_bp.put("/password")
@jwt_required
def update_password():
    payload = request.get_json(silent=True) or {}
    old_password = str(payload.get("old_password", ""))
    new_password = str(payload.get("new_password", ""))

    if not old_password or not new_password:
        return jsonify({"error": "Both current password and new password are required."}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long."}), 400

    conn = get_db_connection()
    try:
        user = conn.execute("SELECT password_hash FROM users WHERE id = ?", (request.user_id,)).fetchone()
        if not user or not check_password(old_password, user["password_hash"]):
            return jsonify({"error": "Current password entered is incorrect."}), 400

        new_hash = hash_password(new_password)
        with conn:
            conn.execute(
                "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
                (new_hash, request.user_id)
            )

        return jsonify({"message": "Password updated successfully."})
    finally:
        conn.close()

@auth_bp.post("/reset-data")
@jwt_required
def reset_account_data():
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM user_skills WHERE user_id = ?", (request.user_id,))
            conn.execute("DELETE FROM saved_careers WHERE user_id = ?", (request.user_id,))
            conn.execute("DELETE FROM learning_tasks WHERE user_id = ?", (request.user_id,))
            conn.execute("DELETE FROM networking_records WHERE user_id = ?", (request.user_id,))
            conn.execute("DELETE FROM conversations WHERE user_id = ?", (request.user_id,))
            conn.execute("DELETE FROM notifications WHERE user_id = ?", (request.user_id,))
            conn.execute(
                "UPDATE user_profiles SET target_role='', short_term_goal='', long_term_goal='', onboarding_completed=0 WHERE user_id = ?",
                (request.user_id,)
            )
        return jsonify({"message": "Account activity and learning data reset successfully."})
    finally:
        conn.close()
