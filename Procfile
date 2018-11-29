release: python manage.py migrate
web: gunicorn fraud_server.wsgi --port 8000
web: daphne fraud_server.asgi:application --port 9000
