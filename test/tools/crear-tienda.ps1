# Crea UNA VEZ la hoja "Lindi Tienda" con su Apps Script ligado y sube gas/ (docs/publicar.md, paso 1).
# Corre en la terminal de la dueña (sesión de clasp de informes.lindi@gmail.com). Uso: & .\test\tools\crear-tienda.ps1
# clasp create puede reemplazar appsscript.json con el de Google (sin los permisos limitados): se guarda y se restaura.
$ErrorActionPreference = 'Stop'
$gas = Join-Path $PSScriptRoot '..\..\gas' | Resolve-Path
Set-Location $gas
if (Test-Path '.clasp.json') { Write-Host 'Ya existe gas\.clasp.json: la tienda ya fue creada. No se crea otra.'; exit 1 }
$manifest = Get-Content 'appsscript.json' -Raw
clasp.cmd create --type sheets --title "Lindi Tienda" --rootDir .
if (-not (Test-Path '.clasp.json')) { Write-Host 'clasp no creó el proyecto.'; exit 1 }
[IO.File]::WriteAllText((Join-Path $gas 'appsscript.json'), $manifest, (New-Object Text.UTF8Encoding $false))
clasp.cmd push --force
Write-Host ''
Write-Host '--- Datos de la tienda (guardar en .env) ---'
Get-Content '.clasp.json'
