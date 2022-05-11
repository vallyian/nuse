@echo off


pushd %~dp0
if "%nuseDir%" neq "%~dp0" (
    set "nuseDir=%~dp0"
    setx nuseDir %~dp0 >nul
)
popd
if not exist "%nuseDir%\nuse.js" curl https://raw.githubusercontent.com/vallyian/nuse/main/nuse.js -o "%nuseDir%\nuse.js"

set "nodeDistUrl=https://nodejs.org/dist"
set "nuseDirFile=%nuseDir%\v"
set "wantedVersion=%1"

set nodeLatestExe="%nuseDir%\latest.exe"
%nodeLatestExe% -v 1>NUL 2>NUL || (
    echo getting latest node executable %nodeDistUrl%/latest/win-x64/node.exe ...
    curl %nodeDistUrl%/latest/win-x64/node.exe -o %nodeLatestExe% 
)
%nodeLatestExe% "%nuseDir%\nuse.js" || exit /b 1

set /p nodeDir=<"%nuseDirFile%"
setx nodeDir "%nodeDir%" >nul
if "%envpath%"=="" set "envpath=%path%"
set "PATH=%nodeDir%;%envpath%"

node -v
