import uuid
import json
from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import jwt_required
from ai_service import generate_assistant_response, get_ai_status, generate_proactive_insights

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")

SUGGESTED_PROMPTS = [
    "What should I prioritize with my hours available this week?",
    "Which careers best fit my current competencies?",
    "Why is my match score what it is for my target role?",
    "What skills am I missing for a Machine Learning Intern?",
    "How can I improve my project for my portfolio?",
    "Explain REST APIs in simple language.",
    "Create a realistic four-week study plan for Python and SQL.",
    "Give me practice technical and behavioral interview questions.",
    "Draft a concise outreach message to an engineer for a referral."
]

def parse_role_row(row):
    data = dict(row)
    data["responsibilities"] = json.loads(data.get("responsibilities_json", "[]"))
    data["skills"] = json.loads(data.get("skills_json", "[]"))
    data["related_skills"] = json.loads(data.get("related_skills_json", "[]"))
    data["learning"] = json.loads(data.get("learning_json", "[]"))
    data["resources"] = json.loads(data.get("resources_json", "[]"))
    return data

@chat_bp.get("/status")
def ai_status():
    """Returns AI capability transparency status."""
    return jsonify(get_ai_status())

@chat_bp.get("/suggested-prompts")
def suggested_prompts():
    return jsonify({"prompts": SUGGESTED_PROMPTS})

@chat_bp.get("/proactive-insights")
@jwt_required
def get_proactive_insights():
    conn = get_db_connection()
    try:
        user_row = conn.execute(
            "SELECT u.full_name, p.education, p.field_of_study, p.stage, p.target_role, "
            "p.learning_style, p.weekly_hours, p.portfolio_projects "
            "FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?",
            (request.user_id,)
        ).fetchone()

        skills_rows = conn.execute(
            "SELECT skill_name, proficiency FROM user_skills WHERE user_id = ?",
            (request.user_id,)
        ).fetchall()

        task_rows = conn.execute(
            "SELECT id, title, status, priority, estimated_duration FROM learning_tasks WHERE user_id = ? ORDER BY recommended_order ASC",
            (request.user_id,)
        ).fetchall()

        catalogue_rows = conn.execute("SELECT * FROM career_roles").fetchall()
        catalogue = [parse_role_row(r) for r in catalogue_rows]

        profile_context = {
            "full_name": user_row["full_name"] if user_row else "Learner",
            "education": user_row["education"] if user_row else "",
            "field_of_study": user_row["field_of_study"] if user_row else "",
            "stage": user_row["stage"] if user_row else "Student",
            "target_role": user_row["target_role"] if user_row else "",
            "learning_style": user_row["learning_style"] if user_row and user_row["learning_style"] else "Hands-on Projects",
            "weekly_hours": int(user_row["weekly_hours"]) if user_row and user_row["weekly_hours"] else 10,
            "portfolio_projects": user_row["portfolio_projects"] if user_row and user_row["portfolio_projects"] else "",
            "skills": [s["skill_name"] for s in skills_rows],
            "tasks": [dict(t) for t in task_rows]
        }

        insights = generate_proactive_insights(profile_context, catalogue)
        return jsonify({"insights": insights})
    finally:
        conn.close()

@chat_bp.post("/role-advice")
@jwt_required
def get_role_advice():
    """Generates focused, personalized AI mentor advice for a specific career role."""
    payload = request.get_json(silent=True) or {}
    role_id = payload.get("role_id")
    if not role_id:
        return jsonify({"error": "role_id is required."}), 400

    conn = get_db_connection()
    try:
        role_row = conn.execute("SELECT * FROM career_roles WHERE id = ?", (role_id,)).fetchone()
        if not role_row:
            return jsonify({"error": "Role not found."}), 404
        role_data = parse_role_row(role_row)

        user_row = conn.execute(
            "SELECT u.full_name, p.education, p.field_of_study, p.stage, p.weekly_hours, p.learning_style "
            "FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?",
            (request.user_id,)
        ).fetchone()

        skills_rows = conn.execute(
            "SELECT skill_name, proficiency FROM user_skills WHERE user_id = ?",
            (request.user_id,)
        ).fetchall()

        user_skills = [s["skill_name"] for s in skills_rows]
        user_skills_lower = {s.lower() for s in user_skills}
        role_skills = role_data.get("skills", [])
        matched = [s for s in role_skills if s.lower() in user_skills_lower]
        missing = [s for s in role_skills if s.lower() not in user_skills_lower]

        weekly_hours = user_row["weekly_hours"] if user_row and user_row["weekly_hours"] else 10
        user_name = user_row["full_name"].split()[0] if user_row and user_row["full_name"] else "Learner"

        advice_lines = [
            f"### AI Career Mentor Evaluation: **{role_data['title']}**\n",
            f"Hello {user_name}! Here is an objective, personalized assessment of your alignment with the **{role_data['title']}** path:\n",
            f"#### 1. Baseline Competency Overlap ({len(matched)} of {len(role_skills)} skills):",
            f"- **Demonstrated Skills**: `{', '.join(matched) if matched else 'None recorded yet'}`.",
            f"- **High-Priority Gaps**: `{', '.join(missing) if missing else 'All foundational skills matched!'}`.\n",
            "#### 2. Strategic Preparation Guidance:",
            f"- Hiring teams prioritize candidates who prove {missing[0] if missing else 'advanced domain knowledge'} with active code artifacts rather than passive tutorial completion.",
            f"- Calibrated to your **{weekly_hours} hours/week** schedule, spending 4 weeks on hands-on project milestones will make you competitive for entry-level applicant pools.\n",
            "#### 3. Recommended Immediate Action:",
            f"- Add a practical milestone for **{missing[0] if missing else 'portfolio deployment'}** to your learning roadmap."
        ]

        actions = []
        if missing:
            actions.append({
                "type": "create_task",
                "label": f"+ Add '{missing[0]}' Milestone to Roadmap",
                "payload": {
                    "title": f"Master {missing[0]} for {role_data['title']}",
                    "explanation": f"Hands-on portfolio milestone addressing key gap in {missing[0]}.",
                    "priority": "High",
                    "estimated_duration": "45 mins",
                    "skill_category": "Skill Development",
                    "related_role_id": role_id
                }
            })
        actions.append({"label": "View Learning Roadmap", "route": "/roadmap"})
        actions.append({"label": "Open Consultation Room", "route": "/chat"})

        return jsonify({
            "advice": "\n".join(advice_lines),
            "matched_skills": matched,
            "missing_skills": missing,
            "actions": actions,
            "role": role_data
        })
    finally:
        conn.close()

@chat_bp.get("/conversations")
@jwt_required
def get_conversations():
    conn = get_db_connection()
    try:
        rows = conn.execute("""
            SELECT c.id, c.title, c.created_at, c.updated_at,
                   (SELECT COUNT(*) FROM conversation_messages m WHERE m.conversation_id = c.id) as message_count
            FROM conversations c
            WHERE c.user_id = ?
            ORDER BY c.updated_at DESC
        """, (request.user_id,)).fetchall()
        return jsonify({"conversations": [dict(r) for r in rows]})
    finally:
        conn.close()

@chat_bp.post("/conversations")
@jwt_required
def create_conversation():
    payload = request.get_json(silent=True) or {}
    title = str(payload.get("title", "New Career Conversation")).strip()[:80]
    conv_id = str(uuid.uuid4())

    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                "INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)",
                (conv_id, request.user_id, title)
            )
            # Add an initial greeting message
            conn.execute("""
                INSERT INTO conversation_messages (conversation_id, user_id, role, content)
                VALUES (?, ?, 'assistant', 'Hello! I am your CareerPath AI Coach. Ask me anything about career matching, skill gaps, learning plans, resume guidance, or interview prep.')
            """, (conv_id, request.user_id))
        return jsonify({"conversation": {"id": conv_id, "title": title}}), 201
    finally:
        conn.close()

@chat_bp.put("/conversations/<conv_id>")
@jwt_required
def rename_conversation(conv_id):
    payload = request.get_json(silent=True) or {}
    title = str(payload.get("title", "")).strip()[:80]
    if not title:
        return jsonify({"error": "Conversation title cannot be empty."}), 400

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                "UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
                (title, conv_id, request.user_id)
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Conversation not found or unauthorized."}), 404
        return jsonify({"message": "Conversation renamed successfully."})
    finally:
        conn.close()

@chat_bp.delete("/conversations/<conv_id>")
@jwt_required
def delete_conversation(conv_id):
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                "DELETE FROM conversations WHERE id = ? AND user_id = ?",
                (conv_id, request.user_id)
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Conversation not found or unauthorized."}), 404
        return jsonify({"message": "Conversation deleted successfully."})
    finally:
        conn.close()

@chat_bp.get("/conversations/<conv_id>/messages")
@jwt_required
def get_messages(conv_id):
    conn = get_db_connection()
    try:
        # Check ownership
        conv = conn.execute(
            "SELECT id, title FROM conversations WHERE id = ? AND user_id = ?",
            (conv_id, request.user_id)
        ).fetchone()

        if not conv:
            return jsonify({"error": "Conversation not found or unauthorized."}), 404

        rows = conn.execute("""
            SELECT id, role, content, metadata_json, created_at
            FROM conversation_messages
            WHERE conversation_id = ? AND user_id = ?
            ORDER BY id ASC
        """, (conv_id, request.user_id)).fetchall()

        messages = []
        for r in rows:
            m = dict(r)
            m["metadata"] = json.loads(m.get("metadata_json", "{}"))
            m.pop("metadata_json", None)
            messages.append(m)

        return jsonify({"conversation": dict(conv), "messages": messages})
    finally:
        conn.close()

@chat_bp.post("/conversations/<conv_id>/messages")
@jwt_required
def send_message(conv_id):
    payload = request.get_json(silent=True) or {}
    content = str(payload.get("content", "")).strip()

    if not content:
        return jsonify({"error": "Message content cannot be empty."}), 400

    conn = get_db_connection()
    try:
        # Check conversation ownership
        conv = conn.execute(
            "SELECT id, title FROM conversations WHERE id = ? AND user_id = ?",
            (conv_id, request.user_id)
        ).fetchone()

        if not conv:
            return jsonify({"error": "Conversation not found or unauthorized."}), 404

        # Fetch user profile context for AI
        user_row = conn.execute(
            "SELECT u.full_name, p.education, p.field_of_study, p.stage, p.target_role, "
            "p.learning_style, p.weekly_hours, p.portfolio_projects "
            "FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?",
            (request.user_id,)
        ).fetchone()

        skills_rows = conn.execute(
            "SELECT skill_name, proficiency FROM user_skills WHERE user_id = ?",
            (request.user_id,)
        ).fetchall()

        task_rows = conn.execute(
            "SELECT id, title, status, priority, estimated_duration FROM learning_tasks WHERE user_id = ? ORDER BY recommended_order ASC LIMIT 8",
            (request.user_id,)
        ).fetchall()

        saved_rows = conn.execute(
            "SELECT r.title FROM saved_careers s JOIN career_roles r ON s.role_id = r.id WHERE s.user_id = ?",
            (request.user_id,)
        ).fetchall()

        catalogue_rows = conn.execute("SELECT * FROM career_roles").fetchall()
        catalogue = [parse_role_row(r) for r in catalogue_rows]

        profile_context = {
            "full_name": user_row["full_name"] if user_row else "Learner",
            "education": user_row["education"] if user_row else "",
            "field_of_study": user_row["field_of_study"] if user_row else "",
            "stage": user_row["stage"] if user_row else "Student",
            "target_role": user_row["target_role"] if user_row else "",
            "learning_style": user_row["learning_style"] if user_row and user_row["learning_style"] else "Hands-on Projects",
            "weekly_hours": int(user_row["weekly_hours"]) if user_row and user_row["weekly_hours"] else 10,
            "portfolio_projects": user_row["portfolio_projects"] if user_row and user_row["portfolio_projects"] else "",
            "skills": [s["skill_name"] for s in skills_rows],
            "tasks": [dict(t) for t in task_rows],
            "saved_careers": [s["title"] for s in saved_rows],
            "interests": []
        }

        # 1. Save user message
        with conn:
            conn.execute("""
                INSERT INTO conversation_messages (conversation_id, user_id, role, content)
                VALUES (?, ?, 'user', ?)
            """, (conv_id, request.user_id, content))

            # Auto-title conversation from first user query if still default
            if conv["title"] == "New Career Conversation":
                new_title = (content[:35] + "...") if len(content) > 35 else content
                conn.execute(
                    "UPDATE conversations SET title = ? WHERE id = ?",
                    (new_title, conv_id)
                )

        # 2. Retrieve recent message history
        history_rows = conn.execute("""
            SELECT role, content FROM conversation_messages
            WHERE conversation_id = ? AND user_id = ?
            ORDER BY id ASC
        """, (conv_id, request.user_id)).fetchall()
        conversation_history = [dict(r) for r in history_rows]

        # 3. Generate response via AI Service
        ai_response = generate_assistant_response(conversation_history, profile_context, catalogue)

        # 4. Save assistant response
        meta_json = json.dumps({
            "provider": ai_response.get("provider"),
            "model": ai_response.get("model"),
            "is_generative": ai_response.get("is_generative", False),
            "actions": ai_response.get("actions", [])
        })

        with conn:
            cursor = conn.execute("""
                INSERT INTO conversation_messages (conversation_id, user_id, role, content, metadata_json)
                VALUES (?, ?, 'assistant', ?, ?)
            """, (conv_id, request.user_id, ai_response["content"], meta_json))
            msg_id = cursor.lastrowid

            conn.execute(
                "UPDATE conversations SET updated_at = datetime('now') WHERE id = ?",
                (conv_id,)
            )

        return jsonify({
            "message": {
                "id": msg_id,
                "role": "assistant",
                "content": ai_response["content"],
                "metadata": {
                    "provider": ai_response.get("provider"),
                    "model": ai_response.get("model"),
                    "is_generative": ai_response.get("is_generative", False),
                    "actions": ai_response.get("actions", [])
                }
            }
        }), 201
    finally:
        conn.close()
