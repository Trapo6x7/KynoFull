@echo off
echo Application de la migration user_match...
cd DogWalkApi
php bin/console doctrine:migrations:migrate --no-interaction
echo.
echo Migration terminee!
pause
