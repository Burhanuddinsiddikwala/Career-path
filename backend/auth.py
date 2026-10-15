import os
import datetime
from functools import wraps
from flask import request, jsonify, g
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "careerpath-ai-dev-secret-key-change-in-prod-8247921")
TOKEN_EXPIRY_DAYS = int(os.getenv("TOKEN_EXPIRY_DAYS", "7"))

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2/SHA256 through Werkzeug."""
    return generate_password_hash(password, method="scrypt")

def check_password(password: str, password_hash: str) -> bool:
    """Verifies a password against the stored hash securely."""
    return check_password_hash(password_hash, password)

def generate_token(user_id: int, email: str) -> str:
    """Generates an expiring JWT token for authenticated requests."""
    payload = {
        "user_id": user_id,
        "email": email,
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=TOKEN_EXPIRY_DAYS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> dict:
    """Decodes and validates a JWT token."""
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

def jwt_required(f):
    """Decorator to protect routes requiring an authenticated user."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization format. Expected 'Bearer <token>'"}), 401
        
        token = parts[1]
        try:
            payload = decode_token(token)
            request.user_id = payload["user_id"]
            request.user_email = payload["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token."}), 401
        except Exception:
            return jsonify({"error": "Authentication verification failed."}), 401
            
        return f(*args, **kwargs)
    return decorated_function

def optional_jwt(f):
    """Decorator that extracts user_id if valid token provided, but does not block."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        request.user_id = None
        request.user_email = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                try:
                    payload = decode_token(parts[1])
                    request.user_id = payload.get("user_id")
                    request.user_email = payload.get("email")
                except Exception:
                    pass
        return f(*args, **kwargs)
    return decorated_function
