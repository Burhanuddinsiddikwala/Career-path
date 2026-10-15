from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import jwt_required

notification_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notification_bp.get("")
@jwt_required
def get_notifications():
    conn = get_db_connection()
    try:
        rows = conn.execute("""
            SELECT id, title, message, link, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC LIMIT 25
        """, (request.user_id,)).fetchall()
        
        unread_count = sum(1 for r in rows if not r["is_read"])
        return jsonify({
            "notifications": [dict(r) for r in rows],
            "unread_count": unread_count
        })
    finally:
        conn.close()

@notification_bp.put("/<int:notif_id>/read")
@jwt_required
def mark_read(notif_id):
    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
                (notif_id, request.user_id)
            )
        return jsonify({"message": "Marked as read."})
    finally:
        conn.close()

@notification_bp.post("/clear")
@jwt_required
def clear_all():
    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
                (request.user_id,)
            )
        return jsonify({"message": "All notifications marked as read."})
    finally:
        conn.close()
