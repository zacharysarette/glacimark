@echo off
setlocal

:: Usage: release.bat 0.2.0
:: Builds the app, commits, pushes, and creates a GitHub Release with installers.

if "%~1"=="" (
    echo Usage: release.bat ^<version^>
    echo Example: release.bat 0.2.0
    exit /b 1
)

set VERSION=%~1
set TAG=v%VERSION%
set NSIS=src-tauri\target\release\bundle\nsis\Planning Central_%VERSION%_x64-setup.exe
set MSI=src-tauri\target\release\bundle\msi\Planning Central_%VERSION%_x64_en-US.msi

echo.
echo === Planning Central Release %TAG% ===
echo.

:: Step 1: Build
echo [1/4] Building...
call npx tauri build
if errorlevel 1 (
    echo Build failed.
    exit /b 1
)

:: Step 2: Verify installers exist
if not exist "%NSIS%" (
    echo NSIS installer not found: %NSIS%
    exit /b 1
)
if not exist "%MSI%" (
    echo MSI installer not found: %MSI%
    exit /b 1
)

:: Step 3: Commit and push
echo.
echo [2/4] Committing and pushing...
git add -A
git commit -m "Release %TAG%"
git push origin master

:: Step 4: Create GitHub Release
echo.
echo [3/4] Creating GitHub Release %TAG%...
gh release create %TAG% ^
    "%NSIS%#Planning Central Installer (NSIS)" ^
    "%MSI%#Planning Central Installer (MSI)" ^
    --title "Planning Central %TAG%" ^
    --notes "Planning Central %TAG% — Windows x64 installers. Run the NSIS .exe (recommended) or MSI to install."

if errorlevel 1 (
    echo Release creation failed.
    exit /b 1
)

echo.
echo [4/4] Done! Release published at:
echo https://github.com/zacharysarette/planning-central/releases/tag/%TAG%
echo.
