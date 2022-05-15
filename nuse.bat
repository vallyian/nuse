@echo off

::env
set "nodeDistUrl=https://nodejs.org/dist"
set "nuseDirFile=%userprofile%\.nuse\v"

::install nuse
if not exist "%userprofile%\.nuse" (
    mkdir "%userprofile%\.nuse"
    set "nuseInitRegistry=1"
)
pushd "%~dp0"
set "currentPath=%~dp0%~nx0"
if not exist "%userprofile%\.nuse\nuse.bat" (
    copy "%~dp0%~nx0" "%userprofile%\.nuse\nuse.bat" >nul
    set "nuseInitRegistry=1"
)
popd
if not exist "%userprofile%\.nuse\nuse.ps1" (
    echo nuse.bat @args > "%userprofile%\.nuse\nuse.ps1"
    set "nuseInitRegistry=1"
)
if not exist "%userprofile%\.nuse\node-latest.exe" (
    echo getting latest node executable %nodeDistUrl%/latest/win-x64/node.exe ...
    curl "%nodeDistUrl%/latest/win-x64/node.exe" -o "%userprofile%\.nuse\node-latest.exe" >nul
    set "nuseInitRegistry=1"
)
if not exist "%userprofile%\.nuse\n-use.js" (
    echo getting nuse runner https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js ...
    curl https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js -o "%userprofile%\.nuse\n-use.js" >nul
    set "nuseInitRegistry=1"
)
if "%nuseDir%"=="" (
    setx nuseDir "%userprofile%\.nuse"
    set "PATH=%userprofile%\.nuse;%path%"
)

::get wanted node version
"%userprofile%\.nuse\node-latest.exe" "%userprofile%\.nuse\n-use.js" "%1" || exit /b 1

::set new node path
set /p nodeDir=<"%nuseDirFile%"
setx nodeDir "%nodeDir%" >nul
set "PATH=%nodeDir%;%path%"

::print versions
for /F "tokens=*" %%x in ('node -v') do (set nodever=%%x)
for /F "tokens=*" %%x in ('npm -v') do (set npmver=%%x)
for /F %%a in ('echo prompt $E ^| cmd') do @set "ESC=%a"
echo [33mnode: %nodever%[0m
echo [33m npm: v%npmver%[0m

::cleanup
if not "%currentPath%"=="%userprofile%\.nuse\nuse.bat" (
	del "%currentPath%"
	exit
)
