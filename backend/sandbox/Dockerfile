# VOKASI2 — Sandbox Worker Dockerfile
# PRD v2.3 §7.2: Docker-isolated code execution environment
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for Jupyter
RUN apt-get update && apt-get install -y \
    nodejs npm git curl wget \
    jupyter-core jupyter-nbconvert \
    && rm -rf /var/lib/apt/lists/*

# Install Python execution packages
RUN pip install --no-cache-dir \
    jupyterhub jupyterlab \
    ipykernel pandas numpy scikit-learn \
    sqlalchemy psycopg2-binary \
    python-dotenv redis \
    fastapi uvicorn \
    openai anthropic

# Configure JupyterHub
RUN mkdir -p /etc/jupyterhub /srv/jupyterhub
COPY jupyterhub_config.py /etc/jupyterhub/jupyterhub_config.py

# Non-root user for security
RUN useradd -m -s /bin/bash sandbox && mkdir -p /home/sandbox/work
USER sandbox

EXPOSE 8080

CMD ["python", "-m", "jupyterhub", "--config", "/etc/jupyterhub/jupyterhub_config.py"]