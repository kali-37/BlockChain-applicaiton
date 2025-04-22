#!/bin/bash

echo "Waiting for MySQL database..."
while ! nc -z db 3306; do
  sleep 1
done
echo "Database is ready!"

cd xclera_backend

python manage.py migrate

python manage.py collectstatic --noinput

exec gunicorn blockchain.wsgi:application --bind 0.0.0.0:8000 --workers 3