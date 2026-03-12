#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#   🚀 ETERNIZE - SCRIPT DE DEPLOY RÁPIDO NO VERCEL
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "  🚀 ETERNIZE - DEPLOY NO VERCEL"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar se está na pasta correta
if [ ! -f "vercel.json" ]; then
    echo "❌ Erro: vercel.json não encontrado!"
    echo "   Execute este script na pasta eternize-final"
    exit 1
fi

echo "✅ Pasta correta detectada!"
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm i -g vercel
    echo "✅ Vercel CLI instalado!"
    echo ""
fi

# Perguntar método de deploy
echo "Escolha o método de deploy:"
echo ""
echo "1) Deploy Direto (CLI)"
echo "2) Deploy via GitHub"
echo "3) Cancelar"
echo ""
read -p "Opção (1-3): " opcao

case $opcao in
    1)
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "  📦 DEPLOY DIRETO VIA CLI"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        
        # Login no Vercel
        echo "🔐 Fazendo login no Vercel..."
        vercel login
        
        echo ""
        echo "🚀 Iniciando deploy de produção..."
        vercel --prod
        
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "  ✅ DEPLOY CONCLUÍDO!"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        echo "Seu site está no ar! 🎉"
        echo ""
        ;;
        
    2)
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "  📦 DEPLOY VIA GITHUB"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        
        # Verificar se Git está instalado
        if ! command -v git &> /dev/null; then
            echo "❌ Git não está instalado!"
            echo "   Instale o Git e tente novamente."
            exit 1
        fi
        
        # Inicializar Git se necessário
        if [ ! -d ".git" ]; then
            echo "📦 Inicializando repositório Git..."
            git init
            echo "✅ Git inicializado!"
            echo ""
        fi
        
        # Adicionar arquivos
        echo "📦 Adicionando arquivos..."
        git add .
        
        # Commit
        echo "📦 Fazendo commit..."
        git commit -m "Deploy Eternize - Versão completa funcional"
        
        # Perguntar URL do repositório
        echo ""
        echo "Crie um repositório no GitHub:"
        echo "https://github.com/new"
        echo ""
        read -p "Cole a URL do repositório (ex: https://github.com/usuario/eternize.git): " repo_url
        
        if [ -z "$repo_url" ]; then
            echo "❌ URL não fornecida!"
            exit 1
        fi
        
        # Adicionar remote
        echo "📦 Conectando ao GitHub..."
        git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"
        
        # Push
        echo "📦 Enviando código para GitHub..."
        git branch -M main
        git push -u origin main
        
        echo ""
        echo "✅ Código enviado para GitHub!"
        echo ""
        echo "Agora:"
        echo "1. Acesse: https://vercel.com"
        echo "2. Faça login com GitHub"
        echo "3. Clique em 'New Project'"
        echo "4. Selecione seu repositório"
        echo "5. Clique em 'Deploy'"
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        ;;
        
    3)
        echo ""
        echo "❌ Deploy cancelado."
        exit 0
        ;;
        
    *)
        echo ""
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  📚 PRÓXIMOS PASSOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Acesse sua URL do Vercel"
echo "2. Teste todas as funcionalidades"
echo "3. Compartilhe com usuários"
echo ""
echo "Documentação:"
echo "- README.md"
echo "- COMO_USAR.md"
echo "- DEPLOY_VERCEL_AGORA.md"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🎉 PRONTO!"
echo "═══════════════════════════════════════════════════════════════"
echo ""