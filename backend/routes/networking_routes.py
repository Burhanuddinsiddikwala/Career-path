from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import jwt_required

networking_bp = Blueprint("networking", __name__, url_prefix="/api/networking")

NETWORKING_TEMPLATES = [
    {
        "id": "intro-chat",
        "title": "Informational Coffee Chat Request",
        "category": "Initial Outreach",
        "subject": "Quick question from an aspiring {target_role} student",
        "body": "Hi {name},\n\nI hope you're having a wonderful week! I came across your profile and was really inspired by your work at {organization}, especially around {topic}.\n\nI am currently preparing for entry-level roles in {field} and would love to ask 2 brief questions about how your team approaches real-world challenges.\n\nWould you have 10 minutes for a virtual coffee chat sometime next week? No pressure at all if your calendar is full!\n\nWarm regards,\n{my_name}"
    },
    {
        "id": "internship-referral",
        "title": "Internship / Role Referral Request",
        "category": "Referral",
        "subject": "Inquiry regarding the {role_title} role at {organization}",
        "body": "Hi {name},\n\nI noticed that {organization} is currently accepting applications for the {role_title} position. Having built several projects in {skills}, I am very interested in contributing to your team's mission.\n\nI would be extremely grateful for any advice on applying or consideration for an internal employee referral. I have attached my resume and GitHub for your convenience.\n\nThank you so much for your time and guidance!\n\nBest,\n{my_name}"
    },
    {
        "id": "linkedin-connect",
        "title": "Short LinkedIn Connection Note (<300 chars)",
        "category": "LinkedIn Invite",
        "subject": "Connecting on LinkedIn",
        "body": "Hi {name}, I'm an aspiring {target_role} following your insightful work at {organization}. I'd love to connect and follow your journey in tech!\n\nBest, {my_name}"
    },
    {
        "id": "post-meeting-followup",
        "title": "Follow-Up After Coffee Chat or Interview",
        "category": "Follow-Up",
        "subject": "Thank you for the chat! - {my_name}",
        "body": "Hi {name},\n\nThank you so much for taking the time to speak with me today! Your advice regarding {topic} gave me clear clarity on what projects to prioritize next.\n\nI will keep you posted on my progress as I build out my latest portfolio milestone. Thanks again for your generous mentorship!\n\nSincerely,\n{my_name}"
    }
]

@networking_bp.get("/contacts")
@jwt_required
def get_contacts():
    status = request.args.get("status")
    q = request.args.get("q", "").strip().lower()

    query = "SELECT * FROM networking_records WHERE user_id = ?"
    params = [request.user_id]

    if status and status != "all":
        query += " AND status = ?"
        params.append(status)
    if q:
        query += " AND (lower(contact_name) LIKE ? OR lower(organization) LIKE ? OR lower(role_title) LIKE ?)"
        wildcard = f"%{q}%"
        params.extend([wildcard, wildcard, wildcard])

    query += " ORDER BY created_at DESC"

    conn = get_db_connection()
    try:
        rows = conn.execute(query, params).fetchall()
        return jsonify({"contacts": [dict(r) for r in rows]})
    finally:
        conn.close()

@networking_bp.post("/contacts")
@jwt_required
def add_contact():
    payload = request.get_json(silent=True) or {}
    contact_name = str(payload.get("contact_name", "")).strip()[:100]
    organization = str(payload.get("organization", "")).strip()[:100]
    role_title = str(payload.get("role_title", "")).strip()[:100]
    status = str(payload.get("status", "Identified")).strip()[:50]
    email = str(payload.get("email", "")).strip()[:120]
    linkedin_url = str(payload.get("linkedin_url", "")).strip()[:200]
    notes = str(payload.get("notes", "")).strip()[:500]
    follow_up_date = str(payload.get("follow_up_date", "")).strip()[:30]

    if not contact_name or not organization:
        return jsonify({"error": "Contact name and organization are required."}), 400

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute("""
                INSERT INTO networking_records (
                    user_id, contact_name, organization, role_title, status,
                    email, linkedin_url, notes, follow_up_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                request.user_id, contact_name, organization, role_title,
                status, email, linkedin_url, notes, follow_up_date
            ))
            contact_id = cursor.lastrowid
        return jsonify({"message": "Contact added to networking list.", "contact_id": contact_id}), 201
    finally:
        conn.close()

@networking_bp.put("/contacts/<int:contact_id>")
@jwt_required
def update_contact(contact_id):
    payload = request.get_json(silent=True) or {}
    conn = get_db_connection()
    try:
        # Check ownership
        existing = conn.execute(
            "SELECT id FROM networking_records WHERE id = ? AND user_id = ?",
            (contact_id, request.user_id)
        ).fetchone()

        if not existing:
            return jsonify({"error": "Contact record not found or unauthorized."}), 404

        fields = ["contact_name", "organization", "role_title", "status",
                  "email", "linkedin_url", "notes", "follow_up_date"]
        updates = []
        params = []

        for field in fields:
            if field in payload:
                updates.append(f"{field} = ?")
                params.append(payload[field])

        if not updates:
            return jsonify({"message": "No fields to update."})

        updates.append("updated_at = datetime('now')")
        params.extend([contact_id, request.user_id])

        with conn:
            conn.execute(f"UPDATE networking_records SET {', '.join(updates)} WHERE id = ? AND user_id = ?", params)

        return jsonify({"message": "Contact updated successfully."})
    finally:
        conn.close()

@networking_bp.delete("/contacts/<int:contact_id>")
@jwt_required
def delete_contact(contact_id):
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                "DELETE FROM networking_records WHERE id = ? AND user_id = ?",
                (contact_id, request.user_id)
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Contact not found or unauthorized."}), 404
        return jsonify({"message": "Contact removed successfully."})
    finally:
        conn.close()

@networking_bp.get("/templates")
def get_templates():
    return jsonify({
        "templates": NETWORKING_TEMPLATES,
        "note": "Copy these professional templates to your clipboard. Personalize the bracketed sections before sending."
    })
