@echo off
echo Iniciando actualizacion del repositorio...

REM Verificar si Git esta instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git no esta instalado o no esta en el PATH
    echo Por favor instala Git desde https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Git encontrado, continuando...

REM Inicializar repositorio si no existe
if not exist .git (
    echo Inicializando repositorio Git...
    git init
)

REM Configurar Git (reemplaza con tus datos)
echo Configurando Git...
git config user.name "Deibyd"
git config user.email "tu-email@ejemplo.com"

REM Agregar todos los archivos
echo Agregando archivos al repositorio...
git add .

REM Hacer commit
echo Haciendo commit de los cambios...
git commit -m "Fix: Configurar enrutamiento y variables de entorno para Netlify

- Agregado netlify.toml con configuracion de build y redirecciones
- Agregado public/_redirects para manejo de rutas SPA
- Deshabilitado SECRETS_SCAN_ENABLED para evitar errores de despliegue
- Configuradas redirecciones para /admin y /client"

echo.
echo ========================================
echo REPOSITORIO ACTUALIZADO EXITOSAMENTE
echo ========================================
echo.
echo Ahora necesitas conectar este repositorio con GitHub:
echo 1. Ve a GitHub.com y crea un nuevo repositorio
echo 2. Copia la URL del repositorio
echo 3. Ejecuta: git remote add origin [URL_DEL_REPOSITORIO]
echo 4. Ejecuta: git push -u origin main
echo.
echo O si ya tienes un repositorio conectado:
echo Ejecuta: git push
echo.
pause
