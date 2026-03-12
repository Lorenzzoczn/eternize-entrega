# 🚀 DEPLOY ETERNIZE V3 NA HOSTINGER

## 📋 Guia Completo de Instalação

Este guia vai te ajudar a colocar o Eternize v3 em produção na Hostinger em menos de 30 minutos.

---

## ✅ PRÉ-REQUISITOS

### 1. Conta na Hostinger
- Plano com suporte a Node.js (Business ou superior)
- Acesso ao painel de controle (hPanel)
- Acesso SSH habilitado

### 2. Domínio Configurado
- Domínio apontando para a Hostinger
- SSL/HTTPS configurado (Let's Encrypt gratuito)

---

## 📦 PASSO 1: PREPARAR ARQUIVOS

### 1.1 Baixar o Projeto
```bash
# Se estiver usando Git
git clone https://github.com/seu-usuario/eternize-v3.git
cd eternize-v3

# Ou baixar o ZIP e extrair
```

### 1.2 Instalar Dependências Localmente (opcional)
```bash
npm install
```

### 1.3 Criar Arquivo .env
```bash
cp .env.example .env
```

Editar `.env` com suas configurações:
```env
PORT=3000
NODE_ENV=production
APP_URL=https://seudominio.com
```

---

## 🌐 PASSO 2: CONFIGURAR HOSTINGER

### 2.1 Acessar hPanel
1. Faça login em: https://hpanel.hostinger.com
2. Vá em **Hospedagem** → Selecione seu domínio
3. Clique em **Avançado** → **Node.js**

### 2.2 Configurar Aplicação Node.js
1. Clique em **Criar Aplicação**
2. Preencha:
   - **Versão do Node.js**: 18.x ou superior
   - **Modo da Aplicação**: Production
   - **Diretório da Aplicação**: `/public_html/eternize` (ou outro)
   - **Arquivo de Inicialização**: `server.js`
   - **Porta**: 3000

3. Clique em **Criar**

---

## 📤 PASSO 3: UPLOAD DOS ARQUIVOS

### Opção A: Via FTP (Mais Fácil)

#### 3.1 Obter Credenciais FTP
1. No hPanel, vá em **Arquivos** → **Gerenciador de Arquivos**
2. Ou use **Contas FTP** para criar/ver credenciais

#### 3.2 Conectar via FileZilla
```
Host: ftp.seudominio.com
Usuário: seu_usuario_ftp
Senha: sua_senha_ftp
Porta: 21
```

#### 3.3 Upload dos Arquivos
1. Navegue até `/public_html/eternize/`
2. Faça upload de TODOS os arquivos do projeto:
   ```
   eternize-v3/
   ├── css/
   ├── js/
   ├── uploads/
   ├── data/
   ├── server.js
   ├── package.json
   ├── .env
   ├── index.html
   ├── evento.html
   ├── convite.html
   └── ... (todos os outros arquivos)
   ```

### Opção B: Via SSH (Avançado)

#### 3.1 Conectar via SSH
```bash
ssh usuario@seudominio.com
```

#### 3.2 Navegar até o Diretório
```bash
cd public_html
mkdir eternize
cd eternize
```

#### 3.3 Clonar Repositório
```bash
git clone https://github.com/seu-usuario/eternize-v3.git .
```

---

## 🔧 PASSO 4: INSTALAR DEPENDÊNCIAS

### 4.1 Via Terminal SSH
```bash
cd /home/usuario/public_html/eternize
npm install --production
```

### 4.2 Via hPanel
1. Vá em **Node.js** → Sua aplicação
2. Clique em **Instalar Dependências**
3. Aguarde a instalação

---

## ⚙️ PASSO 5: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 5.1 Via hPanel
1. Vá em **Node.js** → Sua aplicação
2. Clique em **Variáveis de Ambiente**
3. Adicione:
   ```
   PORT=3000
   NODE_ENV=production
   APP_URL=https://seudominio.com
   ```

### 5.2 Via SSH
```bash
nano .env
```

Adicione as variáveis e salve (Ctrl+X, Y, Enter)

---

## 🚀 PASSO 6: INICIAR APLICAÇÃO

### 6.1 Via hPanel
1. Vá em **Node.js** → Sua aplicação
2. Clique em **Iniciar Aplicação**
3. Aguarde o status mudar para **Running**

### 6.2 Via SSH
```bash
npm start
```

Ou para manter rodando em background:
```bash
nohup npm start > output.log 2>&1 &
```

---

## 🌍 PASSO 7: CONFIGURAR DOMÍNIO

### 7.1 Configurar Proxy Reverso
1. No hPanel, vá em **Avançado** → **Node.js**
2. Em sua aplicação, configure:
   - **Domínio**: seudominio.com
   - **Porta**: 3000

### 7.2 Configurar SSL
1. Vá em **Segurança** → **SSL/TLS**
2. Ative **Let's Encrypt** (gratuito)
3. Aguarde a ativação (5-10 minutos)

---

## ✅ PASSO 8: TESTAR APLICAÇÃO

### 8.1 Acessar URLs
```
https://seudominio.com
https://seudominio.com/evento/abc123xyz456
https://seudominio.com/convite.html
```

### 8.2 Criar Primeiro Evento
1. Acesse: `https://seudominio.com`
2. Clique em **Criar Minha Página**
3. Preencha os dados
4. Gere o QR Code
5. Teste o upload de fotos

---

## 📁 ESTRUTURA DE DIRETÓRIOS

Após o deploy, sua estrutura deve estar assim:

```
/home/usuario/public_html/eternize/
├── css/
│   ├── style.css
│   ├── convite.css
│   ├── evento.css
│   └── ...
├── js/
│   ├── convite-generator.js
│   ├── convite-presets.js
│   ├── evento-page.js
│   └── ...
├── uploads/
│   └── eventos/
│       └── (fotos dos eventos)
├── data/
│   ├── eventos.json
│   └── fotos.json
├── node_modules/
├── server.js
├── package.json
├── .env
├── index.html
├── evento.html
├── convite.html
└── ... (outros arquivos HTML)
```

---

## 🔍 VERIFICAR STATUS

### Via hPanel
1. **Node.js** → Sua aplicação
2. Verificar status: **Running** ✅

### Via SSH
```bash
# Ver processos Node.js
ps aux | grep node

# Ver logs
tail -f output.log

# Verificar porta
netstat -tulpn | grep 3000
```

---

## 🐛 TROUBLESHOOTING

### Problema: Aplicação não inicia

**Solução 1: Verificar logs**
```bash
cd /home/usuario/public_html/eternize
cat output.log
```

**Solução 2: Reinstalar dependências**
```bash
rm -rf node_modules
npm install --production
```

**Solução 3: Verificar permissões**
```bash
chmod -R 755 /home/usuario/public_html/eternize
```

### Problema: Erro 502 Bad Gateway

**Solução: Verificar se a aplicação está rodando**
```bash
ps aux | grep node
```

Se não estiver, iniciar:
```bash
npm start
```

### Problema: Upload de fotos não funciona

**Solução: Criar diretórios e permissões**
```bash
mkdir -p uploads/eventos
mkdir -p data
chmod -R 777 uploads
chmod -R 777 data
```

### Problema: Porta já em uso

**Solução: Mudar porta no .env**
```env
PORT=3001
```

E reiniciar a aplicação.

---

## 🔄 ATUALIZAR APLICAÇÃO

### Via FTP
1. Fazer backup dos arquivos atuais
2. Upload dos novos arquivos
3. Reiniciar aplicação no hPanel

### Via SSH
```bash
cd /home/usuario/public_html/eternize

# Backup
cp -r . ../eternize-backup

# Atualizar
git pull origin main

# Reinstalar dependências
npm install --production

# Reiniciar
npm start
```

---

## 📊 MONITORAMENTO

### Verificar Uso de Recursos
1. hPanel → **Estatísticas**
2. Monitorar:
   - CPU
   - RAM
   - Disco
   - Tráfego

### Logs de Acesso
```bash
tail -f /home/usuario/logs/access.log
```

### Logs de Erro
```bash
tail -f /home/usuario/logs/error.log
```

---

## 🔒 SEGURANÇA

### 1. Proteger Arquivos Sensíveis
```bash
chmod 600 .env
chmod 600 data/*.json
```

### 2. Configurar Firewall
No hPanel:
1. **Segurança** → **Firewall**
2. Permitir apenas portas necessárias

### 3. Backup Automático
1. hPanel → **Backups**
2. Ativar backup automático diário

---

## 📈 OTIMIZAÇÕES

### 1. Habilitar Compressão
Já está habilitado no código com `helmet` e `compression`.

### 2. Cache de Assets
Configurar no `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. CDN (Opcional)
Usar Cloudflare para:
- Cache global
- Proteção DDoS
- SSL gratuito

---

## 📞 SUPORTE

### Hostinger
- Chat: https://www.hostinger.com.br/contato
- Email: suporte@hostinger.com.br
- Telefone: 0800 591 8999

### Eternize
- Email: dev@eternize.com.br
- WhatsApp: (31) 99999-9999

---

## ✅ CHECKLIST FINAL

Antes de considerar o deploy completo, verifique:

- [ ] Aplicação Node.js criada no hPanel
- [ ] Todos os arquivos enviados via FTP/SSH
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Aplicação iniciada e rodando
- [ ] Domínio configurado e acessível
- [ ] SSL/HTTPS ativo
- [ ] Teste de criação de evento funcionando
- [ ] Teste de upload de fotos funcionando
- [ ] Teste de geração de QR Code funcionando
- [ ] Teste de convite personalizado funcionando
- [ ] Diretórios `uploads` e `data` com permissões corretas
- [ ] Backup configurado

---

## 🎉 PRONTO!

Seu Eternize v3 está agora rodando em produção na Hostinger!

**URLs para testar:**
- Landing Page: `https://seudominio.com`
- Criar Evento: `https://seudominio.com/create.html`
- Página de Evento: `https://seudominio.com/evento/{token}`
- Criar Convite: `https://seudominio.com/convite.html?token={token}`

**Próximos passos:**
1. Criar seu primeiro evento
2. Testar todo o fluxo
3. Compartilhar com amigos
4. Começar a eternizar momentos! ✨

---

*Desenvolvido com ❤️ pela equipe Eternize*
