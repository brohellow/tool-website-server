@echo off
cd /d "%~dp0"

echo Step 1: Adding remote repository...
git remote add origin https://github.com/brohello/tool-website.git

echo.
echo Step 2: Renaming branch to main...
git branch -M main

echo.
echo Step 3: Pushing code to GitHub...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo SUCCESS! Code pushed to GitHub.
) else (
    echo FAILED! Please try SSH method:
    echo 1. Add SSH key to GitHub settings
    echo 2. Run: git remote remove origin
    echo 3. Run: git remote add origin git@github.com:brohello/tool-website.git
    echo 4. Run: git push -u origin main
)

echo.
pause
