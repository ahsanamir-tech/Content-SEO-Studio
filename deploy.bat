@echo off
echo =======================================
echo Deploying your project directly to Vercel!
echo =======================================
echo.
echo Please wait... Vercel may ask you to log in via your browser.
echo.
call npx vercel --prod
echo.
pause
