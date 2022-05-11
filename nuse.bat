@echo off

pushd %~dp0
if "%nuseDir%" neq "%~dp0" (
    set "nuseDir=%~dp0"
    setx nuseDir "%nuseDir%" >nul
)
popd
@REM if not exist ( curl https://raw.githubusercontent.com/vallyian/main/nuse.js -o "%nuseDir%\\nuse.js" )

::add to user path %nuseDir%;%nodeDir%;%path%
::setx a ^%nodeDir^%

set "nodeDistUrl=https://nodejs.org/dist"
set "nuseDirFile=%nuseDir%\\v"
set "wantedVersion=%1"

set nodeLatestExe="%nuseDir%\\latest.exe"
%nodeLatestExe% -v 1>NUL 2>NUL || (
    echo getting latest node executable %nodeDistUrl%/latest/win-x64/node.exe ...
    curl %nodeDistUrl%/latest/win-x64/node.exe -o %nodeLatestExe% 
)
%nodeLatestExe% "%nuseDir%\\nuse.js" || exit /b 1

set /p nodeDir=<"%nuseDirFile%"
setx nodeDir "%nodeDir%" >nul
if "%envpath%"=="" ( set "envpath=%path%" )
set "PATH=%nodeDir%;%envpath%"

node -v
