@echo off
git init
git add .
git commit -m "Initial commit: Refresh Cafe website"
git branch -M main
git remote add origin https://github.com/mturke1996/refresh.git
git push -u origin main
pause

