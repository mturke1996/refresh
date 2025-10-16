@echo off
echo Uploading to GitHub...
git add .
git commit -m "Fix: TypeScript build errors and type safety"
git push
echo Done!
pause

