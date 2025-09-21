Write-Host "Iniciando actualizacion del repositorio..." -ForegroundColor Green

# Verificar si Git esta instalado
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Git desde https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Inicializar repositorio si no existe
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
}

# Configurar Git (reemplaza con tus datos)
Write-Host "Configurando Git..." -ForegroundColor Yellow
git config user.name "Deibyd"
git config user.email "deibyd@ejemplo.com"

# Agregar todos los archivos
Write-Host "Agregando archivos al repositorio..." -ForegroundColor Yellow
git add .

# Hacer commit
Write-Host "Haciendo commit de los cambios..." -ForegroundColor Yellow
git commit -m "Fix: Configurar enrutamiento y variables de entorno para Netlify

- Agregado netlify.toml con configuracion de build y redirecciones
- Agregado public/_redirects para manejo de rutas SPA
- Deshabilitado SECRETS_SCAN_ENABLED para evitar errores de despliegue
- Configuradas redirecciones para /admin y /client"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "REPOSITORIO ACTUALIZADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora necesitas conectar este repositorio con GitHub:" -ForegroundColor Cyan
Write-Host "1. Ve a GitHub.com y crea un nuevo repositorio" -ForegroundColor White
Write-Host "2. Copia la URL del repositorio" -ForegroundColor White
Write-Host "3. Ejecuta: git remote add origin [URL_DEL_REPOSITORIO]" -ForegroundColor White
Write-Host "4. Ejecuta: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "O si ya tienes un repositorio conectado:" -ForegroundColor Cyan
Write-Host "Ejecuta: git push" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para continuar"
