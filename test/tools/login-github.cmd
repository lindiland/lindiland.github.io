@echo off
rem Inicia sesion en GitHub sin preguntas: muestra el codigo de 8 caracteres y espera a que se confirme
rem en https://github.com/login/device. Luego configura git para usar esa sesion. Uso: test\tools\login-github.cmd
"C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com --git-protocol https --web --skip-ssh-key < nul
"C:\Program Files\GitHub CLI\gh.exe" auth setup-git
"C:\Program Files\GitHub CLI\gh.exe" auth status
