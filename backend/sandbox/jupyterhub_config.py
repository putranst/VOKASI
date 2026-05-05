# JupyterHub configuration for VOKASI2 Sandboxes
import os

c.JupyterHub.ip = "0.0.0.0"
c.JupyterHub.port = 8080
c.JupyterHub.base_url = "/"

# Use local spawner (each user gets a separate process)
c.JupyterHub.spawner_class = "localprocess"

# Single-user server configuration
c.SingleUserNotebookApp.default_url = "/lab"

# Auth: use token auth from VOKASI2 backend
c.JupyterHub.api_token = os.environ.get("JUPYTERHUB_API_TOKEN", "")

# Security
c.JupyterHub.cookie_secret = os.environ.get("COOKIE_SECRET", "dev-secret-change-in-prod")
c.JupyterHub.cleanup_servers = True
c.JupyterHub.cleanup_proxy = True

# Scaling
c.JupyterHub.concurrent_spawn_limit = 100
c.JupyterHub.active_server_window = 30

# Redis for state
c.JupyterHub.db_url = os.environ.get("REDIS_URL", "redis://localhost:6379")