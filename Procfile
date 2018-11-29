release: python manage.py migrate
web: gunicorn fraud_server.wsgi -b 0.0.0.0:8000 && daphne fraud_server.asgi:application --port 9000
