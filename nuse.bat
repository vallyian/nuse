@echo off

set debugger=%2
if "%debugger%"=="true" echo [34m[debug] debugger = '%debugger%' [0m

::env
if "%nuseDir%"=="" (
    if "%debugger%"=="true" echo [34m[debug] nuseDir == '' [0m
    set nuseDir "%userprofile%\.nuse"
    setx nuseDir "%userprofile%\.nuse"
    set "PATH=%userprofile%\.nuse;%path%"
)
set "nodeDistUrl=https://nodejs.org/dist"
set "nuseDirFile=%nuseDir%\v"

::install nuse
if not exist "%nuseDir%" (
    if "%debugger%"=="true" echo [34m[debug] nuseDir '%nuseDir%' not exist [0m
    mkdir "%nuseDir%"
    set "nuseInitRegistry=1"
)
pushd "%~dp0"
set "currentPath=%~dp0%~nx0"
if "%debugger%"=="true" echo [34m[debug] currentPath = '%currentPath%' [0m
if not exist "%nuseDir%\nuse.bat" (
    if "%debugger%"=="true" echo [34m[debug] nuse.bat '%nuseDir%\nuse.bat' not exist [0m
    copy "%~dp0%~nx0" "%nuseDir%\nuse.bat" >nul
    set "nuseInitRegistry=1"
)
popd
if not exist "%nuseDir%\nuse.ps1" (
    if "%debugger%"=="true" echo [34m[debug] nuse.ps1 '%nuseDir%\nuse.ps1' not exist [0m
    echo nuse.bat @args > "%nuseDir%\nuse.ps1"
    set "nuseInitRegistry=1"
)
if not exist "%nuseDir%\node-latest.exe" (
    echo getting latest node executable %nodeDistUrl%/latest/win-x64/node.exe ...
    if "%debugger%"=="true" echo [34m[debug] curl  '%nodeDistUrl%/latest/win-x64/node.exe' -o '%nuseDir%\node-latest.exe' [0m
    curl "%nodeDistUrl%/latest/win-x64/node.exe" -o "%nuseDir%\node-latest.exe" >nul
    set "nuseInitRegistry=1"
)
if not exist "%nuseDir%\n-use.js" (
    echo getting nuse runner https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js ...
    if "%debugger%"=="true" echo [34m[debug] curl https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js -o '%nuseDir%\n-use.js' [0m
    curl https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js -o "%nuseDir%\n-use.js" >nul
    set "nuseInitRegistry=1"
)

::get wanted node version
if "%debugger%"=="true" echo [34m[debug] call '%nuseDir%\node-latest.exe' '%nuseDir%\n-use.js' '%1' [0m
"%nuseDir%\node-latest.exe" "%nuseDir%\n-use.js" "%1" || exit /b 1

::set new node path
set /p nodeDir=<"%nuseDirFile%"
if "%debugger%"=="true" echo [34m[debug] nodeDir = '%nodeDir%' [0m
setx nodeDir "%nodeDir%" >nul
set "PATH=%nodeDir%;%path%"

::print versions
for /F "tokens=*" %%x in ('node -v') do (set nodever=%%x)
for /F "tokens=*" %%x in ('npm -v') do (set npmver=%%x)
for /F %%a in ('echo prompt $E ^| cmd') do @set "ESC=%a"
echo [33mnode: %nodever%[0m
echo [33m npm: v%npmver%[0m

::cleanup
if not "%currentPath%"=="%nuseDir%\nuse.bat" (
if not "%nuseDir%"=="." (
    if "%debugger%"=="true" echo [34m[debug] currentPath '%currentPath%' != '%nuseDir%\nuse.bat' [0m
    if "%debugger%"=="true" echo [34m[debug] del '%currentPath%' [0m
	del "%currentPath%"
	exit
)
)
