@echo off
setlocal

:: ============================================================================
:: Polar Markdown — Windows Release Script
:: ============================================================================
::
:: SAFETY: This script contains NO secrets or credentials. It relies on:
::   - npx tauri build   (local build)
::   - git                (commit + push)
::   - gh CLI             (create/upload GitHub Release — uses your logged-in session)
::
:: PREREQUISITES:
::   - Node.js v20+, Rust (stable), Tauri CLI prerequisites (WebView2, VS Build Tools)
::   - GitHub CLI (`gh`) installed and authenticated (`gh auth login`)
::   - Working directory is the repo root with a clean or staged working tree
::
:: USAGE:
::   release.bat <version>       e.g.  release.bat 0.2.0
::
:: MULTI-PLATFORM WORKFLOW (order doesn't matter):
::   Windows:  release.bat 0.2.0              — creates tag + release (or uploads to existing)
::   macOS:    git pull && ./release.sh 0.2.0  — uploads macOS artifacts
::   Linux:    git pull && ./release.sh 0.2.0  — uploads Linux artifacts
::   Whichever platform runs first creates the release; the rest upload artifacts.
:: ============================================================================

if "%~1"=="" (
    echo Usage: release.bat ^<version^>
    echo Example: release.bat 0.2.0
    exit /b 1
)

set VERSION=%~1
set TAG=v%VERSION%
set NSIS=src-tauri\target\release\bundle\nsis\Polar Markdown_%VERSION%_x64-setup.exe
set MSI=src-tauri\target\release\bundle\msi\Polar Markdown_%VERSION%_x64_en-US.msi

echo.
echo === Polar Markdown Release %TAG% ===
echo.

:: Step 0: Switch to master and pull latest
echo [0/5] Switching to master and pulling latest...
git checkout master
if errorlevel 1 (
    echo Failed to checkout master.
    exit /b 1
)
git fetch origin
git pull origin master
if errorlevel 1 (
    echo Failed to pull latest master.
    exit /b 1
)

:: Step 1: Build
echo [1/5] Building...
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
echo [2/5] Committing and pushing...
git add -A
git commit -m "Release %TAG%"
git push origin master

:: Step 4: Check if tag/release already exists (another platform may have created it)
echo.
echo [3/5] Checking for existing release...
gh release view %TAG% >nul 2>&1
if not errorlevel 1 (
    echo Release %TAG% already exists — uploading Windows artifacts...
    echo.
    echo [4/5] Uploading artifacts to existing release...
    gh release upload %TAG% "%NSIS%#Polar Markdown Installer (NSIS)" "%MSI%#Polar Markdown Installer (MSI)" --clobber
    if errorlevel 1 (
        echo Upload failed.
        exit /b 1
    )
    goto :done
)

:: Step 5: Create new GitHub Release
echo.
echo [4/5] Creating GitHub Release %TAG%...
gh release create %TAG% ^
    "%NSIS%#Polar Markdown Installer (NSIS)" ^
    "%MSI%#Polar Markdown Installer (MSI)" ^
    --title "Polar Markdown %TAG%" ^
    --notes "Polar Markdown %TAG% — Windows x64 installers. Run the NSIS .exe (recommended) or MSI to install."

if errorlevel 1 (
    echo Release creation failed.
    exit /b 1
)

:done
echo.
echo [5/5] Done! Release published at:
echo https://github.com/zacharysarette/planning-central/releases/tag/%TAG%
echo.
