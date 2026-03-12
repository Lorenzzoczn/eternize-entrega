# 🚀 Deploy no Netlify - Eternize

## ✅ Checklist de Deploy

### Arquivos de Configuração Criados
- [x] `netlify.toml` - Configuração principal
- [x] `_redirects` - Regras de redirecionamento
- [x] `.gitignore` - Arquivos ignorados

---

## 📋 Passo a Passo para Deploy

### Opção 1: Deploy via Git (Recomendado)

1. **Inicialize o Git (se ainda não fez)**
   ```bash
   cd eternize-checkout
   git init
   git add .
   git commit -m "Deploy inicial Eternize"
   ```

2. **Crie um repositório no GitHub**
   - Acesse github.com
   - Crie novo repositório
   - Não inicialize com README

3. **Conecte e faça push**
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/eternize.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy no Netlify**
   - Acesse netlify.com
   - Clique em "Add new site" → "Import an existing project"
   - Conecte com GitHub
   - Selecione o repositório
   - Configure:
     - Build command: (deixe vazio)
     - Publish directory: `.` ou `/`
   - Clique em "Deploy site"

### Opção 2: Deploy Manual (Drag & Drop)

1. **Acesse Netlify**
   - Vá para netlify.com
   - Faça login

2. **Arraste a pasta**
   - Na página inicial, arraste a pasta `eternize-checkout`
   - Ou clique em "Add new site" → "Deploy manually"

3. **Aguarde o deploy**
   - Netlify vai processar e publicar
   - Você receberá uma URL: `https://seu-site.netlify.app`

---

## 🔧 Configurações Importantes

### 1. Nome do Site
```
Site settings → General → Site details → Change site name
Exemplo: eternize-app.netlify.app
```

### 2. Domínio Customizado (Opcional)
```
Site settings → Domain management → Add custom domain
Exemplo: eternize.com.br
```

### 3. HTTPS
```
✅ Habilitado automaticamente pelo Netlify
```

### 4. Variáveis de Ambiente (Se necessário)
```
Site settings → Build & deploy → Environment → Environment variables
```

---

## 🎯 URLs do Site

Após o deploy, seu site terá estas páginas:

### Páginas Principais
- `https://seu-site.netlify.app/` - Home
- `https://seu-site.netlify.app/create.html` - Criar página
- `https://seu-site.netlify.app/view.html?id=XXX` - Ver página
- `https://seu-site.netlify.app/login.html` - Login
- `https://seu-site.netlify.app/register.html` - Registro
- `https://seu-site.netlify.app/dashboard.html` - Dashboard

### Páginas de Ajuda
- `https://seu-site.netlify.app/START_HERE.html` - Início
- `https://seu-site.netlify.app/GUIA_RAPIDO.html` - Guia
- `https://seu-site.netlify.app/AJUDA_CONTA.html` - Ajuda

---

## ✅ Verificação Pós-Deploy

### Teste estas funcionalidades:

1. **Navegação**
   - [ ] Home carrega corretamente
   - [ ] Todos os links funcionam
   - [ ] Menu de navegação funciona

2. **Sistema de Conta**
   - [ ] Criar conta funciona
   - [ ] Login funciona
   - [ ] Dashboard carrega

3. **Upload e Galeria**
   - [ ] Upload de fotos funciona
   - [ ] Preview aparece
   - [ ] Galeria exibe fotos

4. **Link e QR Code**
   - [ ] Gera link único
   - [ ] QR Code aparece
   - [ ] Link compartilhável funciona
   - [ ] Página view.html carrega

5. **Responsividade**
   - [ ] Mobile funciona
   - [ ] Tablet funciona
   - [ ] Desktop funciona

---

## 🐛 Problemas Comuns

### 1. Página 404
**Problema:** Ao acessar URLs diretas, aparece 404
**Solução:** Verifique se `_redirects` está na raiz

### 2. CSS não carrega
**Problema:** Página sem estilo
**Solução:** Verifique caminhos relativos nos arquivos HTML

### 3. JavaScript não funciona
**Problema:** Funcionalidades não respondem
**Solução:** Abra o Console (F12) e verifique erros

### 4. IndexedDB não funciona
**Problema:** Fotos não salvam
**Solução:** Verifique se HTTPS está habilitado

### 5. Links quebrados
**Problema:** Links não funcionam
**Solução:** Use caminhos relativos (sem `/` no início)

---

## 🔍 Comandos Úteis

### Testar localmente antes do deploy
```bash
# Instalar servidor local
npm install -g http-server

# Rodar servidor
cd eternize-checkout
http-server -p 8080

# Acessar
http://localhost:8080
```

### Verificar links quebrados
```bash
# Instalar verificador
npm install -g broken-link-checker

# Verificar site
blc https://seu-site.netlify.app -ro
```

---

## 📊 Otimizações Aplicadas

### Performance
- [x] Cache de assets (CSS, JS)
- [x] Headers de segurança
- [x] Compressão automática (Netlify)
- [x] CDN global (Netlify)

### SEO
- [x] Meta tags configuradas
- [x] URLs amigáveis
- [x] Sitemap (criar se necessário)
- [x] Robots.txt (criar se necessário)

### Segurança
- [x] HTTPS forçado
- [x] Headers de segurança
- [x] XSS Protection
- [x] Content Security Policy

---

## 🎨 Customizações Pós-Deploy

### 1. Adicionar Analytics
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### 2. Adicionar Favicon
```html
<link rel="icon" type="image/png" href="/favicon.png">
```

### 3. Adicionar Meta Tags
```html
<meta property="og:title" content="Eternize - Eternize Seus Momentos">
<meta property="og:description" content="Sistema de upload e compartilhamento de fotos">
<meta property="og:image" content="https://seu-site.netlify.app/preview.jpg">
```

---

## 🚀 Deploy Contínuo

### Configurar Auto-Deploy
1. Conecte repositório GitHub
2. Netlify detecta mudanças automaticamente
3. Faz deploy a cada push

### Branch Deploy
```
main → Produção (seu-site.netlify.app)
develop → Preview (develop--seu-site.netlify.app)
```

---

## 📞 Suporte

### Logs do Netlify
```
Site settings → Deploys → Deploy log
```

### Status do Deploy
```
https://app.netlify.com/sites/SEU_SITE/deploys
```

### Documentação Netlify
```
https://docs.netlify.com
```

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Site carrega em HTTPS
- [ ] Todas as páginas funcionam
- [ ] Upload de fotos funciona
- [ ] QR Code gera corretamente
- [ ] Links compartilháveis funcionam
- [ ] Responsivo em mobile
- [ ] Sem erros no console
- [ ] Performance boa (Lighthouse)
- [ ] SEO básico configurado
- [ ] Analytics configurado (opcional)

---

## 🎉 Pronto!

Seu site está otimizado e pronto para o Netlify!

**URL de exemplo:** `https://eternize-app.netlify.app`

**Próximos passos:**
1. Faça o deploy
2. Teste todas as funcionalidades
3. Configure domínio customizado (opcional)
4. Compartilhe com o mundo! 🚀
