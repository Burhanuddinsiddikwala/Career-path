# CareerPath AI - Backend Dockerfile
# Production-ready Python container with non-root user and gunicorn WSGI server

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000 \
    FLASK_ENV=production

WORKDIR /app

# Install system dependencies (curl for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt gunicorn>=21.2.0

# Copy application source code
COPY . .

# Create directory for SQLite storage and assign ownership to non-root user
RUN mkdir -p /app/data && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 5000

# Health check against backend health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT}/api/health || exit 1

# Production WSGI startup with gunicorn
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers 2 --threads 4 --timeout 120 app:app"]
