@echo off
setlocal EnableDelayedExpansion

::store current PATH
if "!envpath!"=="" set "envpath=%path%"

::set nuse dir
if "!nuseDir!"=="" (
    set "nuseDir=!userprofile!\.nuse"
    setx nuseDir "!nuseDir!"
    set "PATH=!nuseDir!;!envpath!"
)

::install nuse
if not exist "!nuseDir!" (
    mkdir "!nuseDir!"
    set "nuseInitRegistry=1"
)
pushd %~dp0
if not exist "!nuseDir!\nuse.bat" (
    copy "%~dp0%~nx0" "!nuseDir!\nuse.bat" >nul
    set "nuseInitRegistry=1"
)
popd
if not exist "!nuseDir!\n-use.js" (
    echo getting nuse runner https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js ...
    curl https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js -o "!nuseDir!\n-use.js" >nul
    set "nuseInitRegistry=1"
)

::env for js run
set "nodeDistUrl=https://nodejs.org/dist"
set "nuseDirFile=!nuseDir!\v"
set "wantedNodeVersion=%1"

::get latest node binary
"!nuseDir!\node-latest.exe" -v 1>nul 2>nul || (
    echo getting latest node executable !nodeDistUrl!/latest/win-x64/node.exe ...
    curl !nodeDistUrl!/latest/win-x64/node.exe -o "!nuseDir!\node-latest.exe" >nul
    set "nuseInitRegistry=1"
)

::get wanted node version
"!nuseDir!\node-latest.exe" "!nuseDir!\n-use.js" || exit /b 1

::set new node path
set /p nodeDir=<"!nuseDirFile!"
setx nodeDir "!nodeDir!" >nul
set "PATH=!nodeDir!;!envpath!"

::print version
node -v
