@echo off
echo.
echo ============================================
echo   Smart Job Applier -- Setup Script
echo ============================================
echo.

node -v >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Download it from https://nodejs.org
  pause
  exit /b 1
)
echo Node.js detected.

echo.
echo Installing root dependencies...
npm install

echo.
echo Installing server dependencies...
cd server
npm install
cd ..

echo.
echo Installing client dependencies...
cd client
npm install
cd ..

echo.
if not exist server\.env (
  copy server\.env.example server\.env
  echo Created server\.env -- please fill in your API keys.
) else (
  echo server\.env already exists -- skipping.
)

if not exist client\.env (
  copy client\.env.example client\.env
  echo Created client\.env
) else (
  echo client\.env already exists -- skipping.
)

echo.
echo ============================================
echo   Setup complete!
echo ============================================
echo.
echo Next steps:
echo   1. Edit server\.env and add your API keys
echo   2. Run: npm run dev
echo.
echo App will be available at:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
pause
