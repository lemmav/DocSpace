@echo off

PUSHD %~dp0..
call runasadmin.bat "%~dpnx0"

if %errorlevel% == 0 (
	for /R "run\" %%f in (*.bat) do (
		call sc stop "Onlyoffice%%~nf"
		call sc start "Onlyoffice%%~nf"
	)      
)

echo.
pause