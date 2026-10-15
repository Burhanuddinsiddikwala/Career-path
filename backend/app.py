import os
import re
import json
import logging
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from database import init_db, get_db_connection, DB_PATH
from matching import rank_jobs
from routes.auth_routes import auth_bp
from routes.profile_routes import profile_bp
from routes.skills_routes import skills_bp
from routes.career_routes import career_bp, parse_role_row
from routes.roadmap_routes import roadmap_bp
from routes.networking_routes import networking_bp
from routes.chat_routes import chat_bp
from routes.search_routes import search_bp
from routes.notification_routes import notification_bp

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# CORS configuration supporting configured frontend origins, production Vercel apps, and local dev
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
raw_origins = [o.strip().rstrip("/") for o in frontend_origin.split(",") if o.strip()]

default_origins = [
    "https://career-path-six-gamma.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:80",
    "http://localhost",
    "http://127.0.0.1:80",
    re.compile(r"^https://career-path-[a-zA-Z0-9\-_]+\.vercel\.app$")
]

allowed_origins = list(set(raw_origins + [o for o in default_origins if isinstance(o, str)])) + [o for o in default_origins if not isinstance(o, str)]

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 86400
        }
    }
)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(skills_bp)
app.register_blueprint(career_bp)
app.register_blueprint(roadmap_bp)
app.register_blueprint(networking_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(search_bp)
app.register_blueprint(notification_bp)

# Global error handlers
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": str(e.description or "Bad request")}), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    app.logger.exception("Internal server error")
    return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

# Health check endpoints for load balancers and monitoring
@app.route("/", methods=["GET", "HEAD"])
@app.route("/health", methods=["GET", "HEAD"])
@app.route("/api/health", methods=["GET", "HEAD"])
def health():
    return jsonify({
        "status": "ok",
        "service": "CareerPath AI API",
        "version": "1.0.0",
        "database": "connected"
    }), 200

@app.get("/api/jobs")
def legacy_jobs():
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT * FROM career_roles ORDER BY title ASC").fetchall()
        return jsonify({"jobs": [parse_role_row(r) for r in rows]})
    finally:
        conn.close()

@app.post("/api/match")
def legacy_match():
    payload = request.get_json(silent=True) or {}
    skills = payload.get("skills", [])
    interests = payload.get("interests", [])
    location = str(payload.get("location", "Any")).strip()[:100]
    use_semantic = bool(payload.get("use_semantic", False))

    if not isinstance(skills, list) or not isinstance(interests, list):
        return jsonify({"error": "skills and interests must be arrays"}), 400

    skills = [str(s).strip()[:80] for s in skills if str(s).strip()][:40]
    interests = [str(s).strip()[:100] for s in interests if str(s).strip()][:20]

    if not skills:
        return jsonify({"error": "Add at least one skill to get recommendations."}), 400

    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT * FROM career_roles").fetchall()
        catalogue = [parse_role_row(r) for r in rows]
        results = rank_jobs({"skills": skills, "interests": interests, "location": location}, catalogue, use_semantic)

        with conn:
            conn.execute(
                "INSERT INTO match_history (skills_json, interests_json, method, top_role) VALUES (?, ?, ?, ?)",
                (json.dumps(skills), json.dumps(interests), results[0]["match_method"] if results else "none", results[0]["title"] if results else None)
            )

        return jsonify({
            "results": results,
            "meta": {
                "method": results[0]["match_method"] if results else "none",
                "count": len(results),
                "location_filter_note": f"Location preference: {location}. Sample roles are not live vacancies.",
                "model_note": "Scores rank profile similarity; they are not probabilities of employment."
            }
        })
    except Exception as exc:
        app.logger.exception("Matching failed")
        return jsonify({"error": "Matching failed. Check backend logs and model setup."}), 500
    finally:
        conn.close()

@app.get("/api/history")
def legacy_history():
    conn = get_db_connection()
    try:
        rows = conn.execute(
            "SELECT id, created_at, method, top_role FROM match_history ORDER BY id DESC LIMIT 10"
        ).fetchall()
        return jsonify({"history": [dict(row) for row in rows]})
    finally:
        conn.close()

# Startup initialization
init_db()

if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0" if (os.getenv("PORT") or os.getenv("FLASK_ENV") == "production") else "127.0.0.1")
    port = int(os.getenv("PORT", os.getenv("FLASK_PORT", "5000")))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host=host, port=port, debug=debug)
