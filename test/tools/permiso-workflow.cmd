@echo off
rem Agrega a la sesion de GitHub el permiso "workflow" (necesario para subir .github/workflows/pages.yml).
rem Muestra un codigo para confirmar en https://github.com/login/device. Uso: test\tools\permiso-workflow.cmd
"C:\Program Files\GitHub CLI\gh.exe" auth refresh --hostname github.com --scopes workflow < nul
