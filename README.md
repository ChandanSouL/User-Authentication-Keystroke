npm i --force
npm run start
npm run build

python manage.py makemigrations app
python manage.py migrate

python manage.py runserver