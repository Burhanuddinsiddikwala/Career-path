import json
from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import jwt_required
from matching import calculate_skill_alignment

roadmap_bp = Blueprint("roadmap", __name__, url_prefix="/api/roadmap")

@roadmap_bp.get("/tasks")
@jwt_required
def get_tasks():
    status = request.args.get("status")
    role_id = request.args.get("role_id")
    date_filter = request.args.get("date")

    query = "SELECT * FROM learning_tasks WHERE user_id = ?"
    params = [request.user_id]

    if status and status != "all":
        query += " AND status = ?"
        params.append(status)
    if role_id:
        query += " AND related_role_id = ?"
        params.append(role_id)
    if date_filter:
        query += " AND (start_date = ? OR due_date = ?)"
        params.extend([date_filter, date_filter])

    query += " ORDER BY recommended_order ASC, id ASC"

    conn = get_db_connection()
    try:
        rows = conn.execute(query, params).fetchall()
        tasks = [dict(r) for r in rows]
        
        # Summary statistics
        total = len(tasks)
        completed = sum(1 for t in tasks if t["status"] == "completed")
        pending = total - completed
        completion_pct = int(round((completed / total) * 100)) if total > 0 else 0

        return jsonify({
            "tasks": tasks,
            "stats": {
                "total": total,
                "completed": completed,
                "pending": pending,
                "completion_pct": completion_pct
            }
        })
    finally:
        conn.close()

@roadmap_bp.post("/tasks")
@jwt_required
def create_task():
    payload = request.get_json(silent=True) or {}
    title = str(payload.get("title", "")).strip()[:150]
    explanation = str(payload.get("explanation", "")).strip()[:400]
    skill_category = str(payload.get("skill_category", "Skill Development")).strip()[:60]
    priority = str(payload.get("priority", "Medium")).strip()[:20]
    estimated_duration = str(payload.get("estimated_duration", "30-45 mins")).strip()[:50]
    recommended_order = int(payload.get("recommended_order", 1))
    start_date = str(payload.get("start_date", "")).strip()[:30]
    due_date = str(payload.get("due_date", "")).strip()[:30]
    resource_url = str(payload.get("resource_url", "")).strip()[:250]
    resource_label = str(payload.get("resource_label", "")).strip()[:100]
    related_role_id = str(payload.get("related_role_id", "")).strip()[:60]

    if not title:
        return jsonify({"error": "Task title is required."}), 400

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute("""
                INSERT INTO learning_tasks (
                    user_id, title, explanation, skill_category, priority,
                    estimated_duration, recommended_order, status, start_date,
                    due_date, resource_url, resource_label, related_role_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
            """, (
                request.user_id, title, explanation, skill_category, priority,
                estimated_duration, recommended_order, start_date, due_date,
                resource_url, resource_label, related_role_id
            ))
            task_id = cursor.lastrowid
        return jsonify({"message": "Task added to roadmap.", "task_id": task_id}), 201
    finally:
        conn.close()

@roadmap_bp.put("/tasks/<int:task_id>")
@jwt_required
def update_task(task_id):
    payload = request.get_json(silent=True) or {}
    conn = get_db_connection()
    try:
        # Check ownership
        existing = conn.execute(
            "SELECT id, status FROM learning_tasks WHERE id = ? AND user_id = ?",
            (task_id, request.user_id)
        ).fetchone()

        if not existing:
            return jsonify({"error": "Task not found or unauthorized."}), 404

        fields = ["title", "explanation", "skill_category", "priority",
                  "estimated_duration", "recommended_order", "status",
                  "start_date", "due_date", "resource_url", "resource_label"]
        updates = []
        params = []

        for field in fields:
            if field in payload:
                updates.append(f"{field} = ?")
                params.append(payload[field])

        if not updates:
            return jsonify({"message": "No fields to update."})

        updates.append("updated_at = datetime('now')")
        params.extend([task_id, request.user_id])

        with conn:
            conn.execute(f"UPDATE learning_tasks SET {', '.join(updates)} WHERE id = ? AND user_id = ?", params)

        return jsonify({"message": "Task updated successfully."})
    finally:
        conn.close()

@roadmap_bp.delete("/tasks/<int:task_id>")
@jwt_required
def delete_task(task_id):
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                "DELETE FROM learning_tasks WHERE id = ? AND user_id = ?",
                (task_id, request.user_id)
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Task not found or unauthorized."}), 404
        return jsonify({"message": "Task deleted successfully."})
    finally:
        conn.close()

@roadmap_bp.post("/generate")
@jwt_required
def generate_roadmap():
    payload = request.get_json(silent=True) or {}
    role_id = payload.get("role_id")

    conn = get_db_connection()
    try:
        # Determine target role
        if not role_id:
            profile = conn.execute("SELECT target_role FROM user_profiles WHERE user_id = ?", (request.user_id,)).fetchone()
            if profile and profile["target_role"]:
                role_id = profile["target_role"]

        if not role_id:
            # Fall back to best matching role or first role
            role_row = conn.execute("SELECT id FROM career_roles LIMIT 1").fetchone()
            role_id = role_row["id"] if role_row else "data-analyst"

        role = conn.execute("SELECT * FROM career_roles WHERE id = ?", (role_id,)).fetchone()
        if not role:
            return jsonify({"error": f"Role '{role_id}' not found."}), 404

        learning_items = json.loads(role["learning_json"])
        resources = json.loads(role["resources_json"])
        skills = json.loads(role["skills_json"])

        # Fetch current user skills to prioritize missing
        user_skills_rows = conn.execute(
            "SELECT skill_name, proficiency FROM user_skills WHERE user_id = ?",
            (request.user_id,)
        ).fetchall()
        user_skills_dict = {r["skill_name"]: r["proficiency"] for r in user_skills_rows}
        alignment = calculate_skill_alignment(user_skills_dict, skills)
        missing_skills = alignment["missing_skills"]

        # Fetch existing task titles to prevent duplicate creations
        existing_titles = {
            r["title"] for r in conn.execute(
                "SELECT title FROM learning_tasks WHERE user_id = ?",
                (request.user_id,)
            ).fetchall()
        }

        created_count = 0
        with conn:
            # Create tasks from role learning plan
            for i, item in enumerate(learning_items, 1):
                title = f"{role['title']}: {item}"
                if title not in existing_titles:
                    res = resources[(i - 1) % len(resources)] if resources else {}
                    conn.execute("""
                        INSERT INTO learning_tasks (
                            user_id, title, explanation, skill_category, priority,
                            estimated_duration, recommended_order, status,
                            resource_url, resource_label, related_role_id
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
                    """, (
                        request.user_id,
                        title,
                        f"Practical milestone toward qualifying for {role['title']}.",
                        role["category"],
                        "High" if i == 1 else "Medium",
                        "45–60 mins",
                        i,
                        res.get("url", ""),
                        res.get("label", ""),
                        role["id"]
                    ))
                    created_count += 1

            # Create focused tasks for missing skills
            for j, missing in enumerate(missing_skills[:3], len(learning_items) + 1):
                title = f"Skill Focus: Practice {missing} fundamentals"
                if title not in existing_titles:
                    conn.execute("""
                        INSERT INTO learning_tasks (
                            user_id, title, explanation, skill_category, priority,
                            estimated_duration, recommended_order, status,
                            resource_url, resource_label, related_role_id
                        ) VALUES (?, ?, ?, ?, 'High', '1 hour', ?, 'pending', ?, ?, ?)
                    """, (
                        request.user_id,
                        title,
                        f"Bridge critical skill gap in {missing} to elevate match score for {role['title']}.",
                        "Core Skill",
                        j,
                        resources[0].get("url", "") if resources else "",
                        f"{missing} Learning Guide",
                        role["id"]
                    ))
                    created_count += 1

            # Notification
            conn.execute("""
                INSERT INTO notifications (user_id, title, message, link)
                VALUES (?, 'Roadmap Updated', ?, '/roadmap')
            """, (request.user_id, f"Generated {created_count} learning milestones for {role['title']}."))

        return jsonify({
            "message": f"Generated {created_count} personalized learning milestones for {role['title']}.",
            "role_title": role["title"],
            "tasks_created": created_count
        })
    finally:
        conn.close()
