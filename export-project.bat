@echo off
setlocal enabledelayedexpansion

echo 🚀 AI-Powered SaleGuru CRM Export Script
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

:menu
echo.
echo Choose an export option:
echo 1) Create production build only
echo 2) Create deployment package (ZIP)
echo 3) Create Docker image
echo 4) Prepare for Vercel deployment
echo 5) Prepare for Netlify deployment
echo 6) Create source code archive
echo 7) Export everything
echo 8) Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto build_only
if "%choice%"=="2" goto deployment_package
if "%choice%"=="3" goto docker_image
if "%choice%"=="4" goto vercel_prep
if "%choice%"=="5" goto netlify_prep
if "%choice%"=="6" goto source_archive
if "%choice%"=="7" goto export_all
if "%choice%"=="8" goto exit
echo ❌ Invalid choice. Please try again.
goto menu

:build_only
echo 📦 Creating production build...
if exist dist rmdir /s /q dist
if not exist node_modules (
    echo 📥 Installing dependencies...
    npm install
)
npm run build
if exist dist (
    echo ✅ Production build created successfully!
    echo 📁 Build location: ./dist
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)
goto end

:deployment_package
call :build_only
echo 📦 Creating deployment package...
set PACKAGE_NAME=saleguru-crm-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set PACKAGE_NAME=%PACKAGE_NAME: =0%
mkdir %PACKAGE_NAME%
xcopy /e /i dist %PACKAGE_NAME%\dist
copy package.json %PACKAGE_NAME%\
copy package-lock.json %PACKAGE_NAME%\
copy README.md %PACKAGE_NAME%\
copy DEPLOYMENT.md %PACKAGE_NAME%\
copy DEPLOYMENT_CHECKLIST.md %PACKAGE_NAME%\
copy .env.example %PACKAGE_NAME%\
if exist vercel.json copy vercel.json %PACKAGE_NAME%\
if exist netlify.toml copy netlify.toml %PACKAGE_NAME%\
if exist Dockerfile copy Dockerfile %PACKAGE_NAME%\
if exist docker-compose.yml copy docker-compose.yml %PACKAGE_NAME%\
if exist nginx.conf copy nginx.conf %PACKAGE_NAME%\
powershell Compress-Archive -Path %PACKAGE_NAME% -DestinationPath %PACKAGE_NAME%.zip
rmdir /s /q %PACKAGE_NAME%
echo ✅ Deployment package created: %PACKAGE_NAME%.zip
goto end

:docker_image
call :build_only
echo 🐳 Creating Docker image...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    goto end
)
docker build -t saleguru-crm:latest .
echo ✅ Docker image created: saleguru-crm:latest
echo 📋 To run the container:
echo    docker run -p 80:80 saleguru-crm:latest
goto end

:vercel_prep
call :build_only
echo ⚡ Preparing for Vercel deployment...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing Vercel CLI...
    npm install -g vercel
)
echo ✅ Vercel CLI ready!
echo 📋 To deploy:
echo    vercel
goto end

:netlify_prep
call :build_only
echo 🌐 Preparing for Netlify deployment...
netlify --version >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing Netlify CLI...
    npm install -g netlify-cli
)
echo ✅ Netlify CLI ready!
echo 📋 To deploy:
echo    netlify deploy --prod --dir=dist
goto end

:source_archive
echo 📦 Creating source code archive...
set SOURCE_NAME=saleguru-crm-source-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set SOURCE_NAME=%SOURCE_NAME: =0%
powershell -Command "Get-ChildItem -Path . -Exclude node_modules,dist,.git,.env,*.log,.DS_Store | Compress-Archive -DestinationPath %SOURCE_NAME%.zip"
echo ✅ Source code archive created: %SOURCE_NAME%.zip
goto end

:export_all
call :build_only
call :deployment_package
call :docker_image
call :vercel_prep
call :netlify_prep
call :source_archive
goto end

:end
echo.
echo 🎉 Export completed successfully!
echo 📋 Next steps:
echo    1. Configure your environment variables
echo    2. Set up your Supabase project
echo    3. Deploy using your chosen method
echo    4. Follow the deployment checklist
pause
exit /b 0

:exit
echo 👋 Goodbye!
pause
exit /b 0 