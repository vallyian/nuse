@echo off

::set nuse dir
if "%nuseDir%"=="" (
    set "nuseDir=%userprofile%\.nuse"
    setx nuseDir "%userprofile%\.nuse"
    set "PATH=%userprofile%\.nuse;%path%"
)

::install nuse
if not exist "%userprofile%\.nuse" (
    mkdir "%userprofile%\.nuse"
    set "nuseInitRegistry=1"
)
pushd "%~dp0"
if not exist "%userprofile%\.nuse\nuse.bat" (
    copy "%~dp0%~nx0" "%userprofile%\.nuse\nuse.bat" >nul
    set "nuseInitRegistry=1"
)
popd
if not exist "%userprofile%\.nuse\n-use.js" (
    echo getting nuse runner https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js ...
    curl https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js -o "%userprofile%\.nuse\n-use.js" >nul
    set "nuseInitRegistry=1"
)

::env for js run
set "nodeDistUrl=https://nodejs.org/dist"
set "nuseDirFile=%userprofile%\.nuse\v"
set "wantedNodeVersion=%1"

::get latest node binary
"%userprofile%\.nuse\node-latest.exe" -v 1>nul 2>nul || (
    echo getting latest node executable %nodeDistUrl%/latest/win-x64/node.exe ...
    curl "%nodeDistUrl%/latest/win-x64/node.exe" -o "%userprofile%\.nuse\node-latest.exe" >nul
    set "nuseInitRegistry=1"
)

::get wanted node version
"%userprofile%\.nuse\node-latest.exe" "%userprofile%\.nuse\n-use.js" || exit /b 1

::set new node path
set /p nodeDir=<"%nuseDirFile%"
setx nodeDir "%nodeDir%" >nul
set "PATH=%nodeDir%;%path%"

::print versions
FOR /F "tokens=*" %%x IN ('node -v') do (SET nodever=%%x)
FOR /F "tokens=*" %%x IN ('npm -v') do (SET npmver=%%x)
echo node: %nodever%
echo  npm: v%npmver%
