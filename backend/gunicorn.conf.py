import os

# Gunicorn configuration for production deployment (Render / Railway / Containers)
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"
workers = int(os.getenv("WEB_CONCURRENCY", "2"))
threads = 4
timeout = 120
accesslog = "-"
errorlog = "-"
