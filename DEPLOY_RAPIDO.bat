@echo off
chcp 65001 >nul
cls

REM ═══════════════════════════════════════════════════════════════
REM   🚀 ETERNIZE - SCRIPT DE DEPLOY RÁPIDO NO VERCEL
REM ═══════════════════════════════════════════════════════════════

echo ═══════════════════════════════════════════════════════════════
echo   🚀 ETERNIZE - DEPLOY NO VERCEL
echo ═══════════════════════════════════════════════════════════════
echo.

REM Verificar se está na pasta correta
if not exist "vercel.json" (
    echo ❌ Erro: vercel.json não encontrado!
    echo    Execute este script na pasta eternize-final
    pause
    exit /b 1
)

echo ✅ Pasta correta detectada!
echo.

REM Verificar se Vercel CLI está instalado
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Instalando Vercel CLI...
    call npm i -g vercel
    echo ✅ Vercel CLI instalado!
    echo.
)

REM Menu de opções
echo Escolha o método de deploy:
echo.
echo 1) Deploy Direto (CLI)
echo 2) Deploy via GitHub
echo 3) Cancelar
echo.
set /p opcao="Opção (1-3): "

if "%opcao%"=="1" goto deploy_cli
if "%opcao%"=="2" goto deploy_github
if "%opcao%"=="3" goto cancelar
goto opcao_invalida

:deploy_cli
echo.
echo ═══════════════════════════════════════════════════════════════
echo   📦 DEPLOY DIRETO VIA CLI
echo ═══════════════════════════════════════════════════════════════
echo.

REM Login no Vercel
echo 🔐 Fazendo login no Vercel...
call vercel login

echo.
echo 🚀 Iniciando deploy de produção...
call vercel --prod

echo.
echo ═══════════════════════════════════════════════════════════════
echo   ✅ DEPLOY CONCLUÍDO!
echo ═══════════════════════════════════════════════════════════════
echo.
echo Seu site está no ar! 🎉
echo.
goto fim

:deploy_github
echo.
echo ═══════════════════════════════════════════════════════════════
echo   📦 DEPLOY VIA GITHUB
echo ═══════════════════════════════════════════════════════════════
echo.

REM Verificar se Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git não está instalado!
    echo    Instale o Git e tente novamente.
    echo    Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Inicializar Git se necessário
if not exist ".git" (
    echo 📦 Inicializando repositório Git...
    git init
    echo ✅ Git inicializado!
    echo.
)

REM Adicionar arquivos
echo 📦 Adicionando arquivos...
git add .

REM Commit
echo 📦 Fazendo commit...
git commit -m "Deploy Eternize - Versão completa funcional"

REM Perguntar URL do repositório
echo.
echo Crie um repositório no GitHub:
echo https://github.com/new
echo.
set /p repo_url="Cole a URL do repositório (ex: https://github.com/usuario/eternize.git): "

if "%repo_url%"=="" (
    echo ❌ URL não fornecida!
    pause
    exit /b 1
)

REM Adicionar remote
echo 📦 Conectando ao GitHub...
git remote add origin "%repo_url%" 2>nul
if %errorlevel% neq 0 (
    git remote set-url origin "%repo_url%"
)

REM Push
echo 📦 Enviando código para GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Código enviado para GitHub!
echo.
echo Agora:
echo 1. Acesse: https://vercel.com
echo 2. Faça login com GitHub
echo 3. Clique em 'New Project'
echo 4. Selecione seu repositório
echo 5. Clique em 'Deploy'
echo.
echo ═══════════════════════════════════════════════════════════════
goto fim

:cancelar
echo.
echo ❌ Deploy cancelado.
pause
exit /b 0

:opcao_invalida
echo.
echo ❌ Opção inválida!
pause
exit /b 1

:fim
echo.
echo ═══════════════════════════════════════════════════════════════
echo   📚 PRÓXIMOS PASSOS
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Acesse sua URL do Vercel
echo 2. Teste todas as funcionalidades
echo 3. Compartilhe com usuários
echo.
echo Documentação:
echo - README.md
echo - COMO_USAR.md
echo - DEPLOY_VERCEL_AGORA.md
echo.
echo ═══════════════════════════════════════════════════════════════
echo   🎉 PRONTO!
echo ═══════════════════════════════════════════════════════════════
echo.
pause