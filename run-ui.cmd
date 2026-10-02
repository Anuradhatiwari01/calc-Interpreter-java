@echo off
rem Compiles CALC and starts the learning UI.  Usage: run-ui.cmd [port]
setlocal EnableDelayedExpansion
cd /d "%~dp0"
set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"
if not exist out mkdir out
rem javac argument file: one quoted path per line, forward slashes (the project path may contain spaces)
(for /r src %%f in (*.java) do (set "p=%%f" & echo "!p:\=/!")) > out\sources.txt
javac -d out @out\sources.txt || exit /b 1
echo.
echo Open http://localhost:%PORT% in your browser
java -cp out server.WebServer %PORT%
