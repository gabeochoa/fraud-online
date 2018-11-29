release: python manage.py migrate
web: gunicorn fraud_server.asgi -k uvicorn.workers.UvicornWorker --forwarded-allow-ips "*"
