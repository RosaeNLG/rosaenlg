@echo off
if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)

cd c:\rosaenlg\rosaenlg\packages\browser-ide-demo
mklink /D node_modules\vue-sidebar-menu c:\rosaenlg\rosaenlg\node_modules\vue-sidebar-menu

pause
