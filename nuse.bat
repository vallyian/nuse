@echo off

set "nuseArg=%1"
set "nuseDebug=%2"

if "%nuseDebug%"=="true" @echo [34m[debug] nuseDebug = '%nuseDebug%' [0m

::env
if "%nuseDir%"=="" (
    if "%nuseDebug%"=="true" @echo [34m[debug] nuseDir = '%userprofile%\.nuse' [0m
    set "nuseDir=%userprofile%\.nuse"
    setx nuseDir "%userprofile%\.nuse"
    set "PATH=%userprofile%\.nuse;%path%"
)
set "nodeDistUrl=https://nodejs.org/dist"
set "nuseDirFile=%nuseDir%\v"

::install nuse
if not exist "%nuseDir%" (
    if "%nuseDebug%"=="true" @echo [34m[debug] mkdir '%nuseDir%' [0m
    mkdir "%nuseDir%"
    set "nuseInitRegistry=1"
)
pushd "%~dp0"
set "currentPath=%~dp0%~nx0"
if "%nuseDebug%"=="true" @echo [34m[debug] currentPath = '%currentPath%' [0m
if not exist "%nuseDir%\nuse.bat" (
    if "%nuseDebug%"=="true" @echo [34m[debug] copy '%currentPath%' '%nuseDir%\nuse.bat' [0m
    copy "%currentPath%" "%nuseDir%\nuse.bat" >nul
    set "nuseInitRegistry=1"
)
popd
if not exist "%nuseDir%\nuse.ps1" (
    if "%nuseDebug%"=="true" @echo [34m[debug] create '%nuseDir%\nuse.ps1' [0m
    @echo nuse.bat @args > "%nuseDir%\nuse.ps1"
    set "nuseInitRegistry=1"
)
if not exist "%nuseDir%\node-latest.exe" (
    @echo getting latest node executable %nodeDistUrl%/latest/win-x64/node.exe ...
    if "%nuseDebug%"=="true" @echo [34m[debug] target '%nuseDir%\node-latest.exe' [0m
    curl "%nodeDistUrl%/latest/win-x64/node.exe" -o "%nuseDir%\node-latest.exe" >nul
    set "nuseInitRegistry=1"
)
if not exist "%nuseDir%\n-use.js" (
    @echo getting nuse runner https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js ...
    if "%nuseDebug%"=="true" @echo [34m[debug] target '%nuseDir%\n-use.js' [0m
    curl https://raw.githubusercontent.com/vallyian/nuse/main/n-use.js -o "%nuseDir%\n-use.js" >nul
    set "nuseInitRegistry=1"
)

::get wanted node version
if "%nuseDebug%"=="true" @echo [34m[debug] call '%nuseDir%\node-latest.exe' '%nuseDir%\n-use.js' '%nuseArg' [0m
"%nuseDir%\node-latest.exe" "%nuseDir%\n-use.js" "%nuseArg%" || exit /b 1

::set new node path
set /p nodeDir=<"%nuseDirFile%"
if "%nuseDebug%"=="true" @echo [34m[debug] setx nodeDir '%nodeDir%' [0m
setx nodeDir "%nodeDir%" >nul
set "PATH=%nodeDir%;%path%"

::print versions
@echo|set /p="[33mnode: [0m"
for /F "tokens=*" %%x in ('node -v') do (set nodever=%%x)
@echo [33m%nodever%[0m
@echo|set /p="[33m npm: [0m"
for /F "tokens=*" %%x in ('npm -v') do (set npmver=%%x)
@echo [33mv%npmver%[0m

::cleanup
if not "%currentPath%"=="%nuseDir%\nuse.bat" (
if "%nuseDebug%"=="true" @echo [34m[debug] currentPath '%currentPath%' != '%nuseDir%\nuse.bat' [0m
if not "%nuseDir%"=="." (
    if "%nuseDebug%"=="true" @echo [34m[debug] del '%nuseDir%\nuse.bat' [0m
	del "%nuseDir%\nuse.bat"
    if "%nuseDebug%"=="true" @echo [34m[debug] copy '%currentPath%' '%nuseDir%\nuse.bat' [0m
    copy "%currentPath%" "%nuseDir%\nuse.bat" >nul
    if "%nuseDebug%"=="true" @echo [34m[debug] del '%currentPath%' [0m
	start cmd /c del "%currentPath%"
)
)
