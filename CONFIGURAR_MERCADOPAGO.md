# 🔧 Como Configurar Mercado Pago - Passo a Passo

## 📝 Guia Completo para Iniciantes

Este guia vai te ajudar a configurar o Mercado Pago no Eternize v3 do zero, mesmo que você nunca tenha usado antes.

---

## 🎯 Passo 1: Criar Conta no Mercado Pago (5 minutos)

### 1.1 Acessar o Site
1. Abra seu navegador
2. Acesse: https://www.mercadopago.com.br
3. Clique em "Criar conta"

### 1.2 Preencher Dados
- **Email:** Seu email profissional
- **Senha:** Crie uma senha forte
- **CPF/CNPJ:** Seu documento
- **Telefone:** Para verificação

### 1.3 Verificar Email
1. Abra seu email
2. Clique no link de verificação
3. Confirme sua conta

---

## 🔑 Passo 2: Obter Credenciais (3 minutos)

### 2.1 Acessar Área de Desenvolvedores
1. Faça login no Mercado Pago
2. Acesse: https://www.mercadopago.com.br/developers
3. Clique em "Suas integrações"

### 2.2 Criar Aplicação
1. Clique em "Criar aplicação"
2. Preencha:
   - **Nome:** Eternize v3
   - **Descrição:** Sistema de pagamento para eventos
   - **Modelo de integração:** Checkout Pro
3. Clique em "Criar aplicação"

### 2.3 Copiar Credenciais de TESTE

**IMPORTANTE:** Comece sempre com credenciais de TESTE!

1. Na sua aplicação, vá para "Credenciais"
2. Selecione "Credenciais de teste"
3. Copie:
   - **Access Token:** `TEST-1234567890-123456-abcdef...`
   - **Public Key:** `TEST-abcdef12-3456-7890...`

📋 **Salve essas credenciais em um lugar seguro!**

---

## ⚙️ Passo 3: Configurar no Projeto (2 minutos)

### 3.1 Abrir Arquivo de Configuração

No seu projeto Eternize v3, abra o arquivo:
```
eternize-v3/server/.env
```

Se o arquivo não existir, copie o exemplo:
```bash
cp server/.env.example server/.env
```

### 3.2 Colar Credenciais

Edite o arquivo `.env` e cole suas credenciais:

```bash
# ===== MERCADO PAGO - TESTE =====
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
MERCADO_PAGO_PUBLIC_KEY=TEST-abcdef12-3456-7890-abcd-ef1234567890

# ===== APLICAÇÃO =====
APP_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

**⚠️ ATENÇÃO:**
- Substitua `TEST-1234...` pelas suas credenciais reais
- NÃO compartilhe essas credenciais
- NÃO faça commit do arquivo `.env` no Git

### 3.3 Atualizar Public Key no Frontend

Edite o arquivo `eternize-v3/js/payment.js`:

Procure por:
```javascript
const publicKey = 'APP_USR-YOUR-PUBLIC-KEY';
```

Substitua por:
```javascript
const publicKey = 'TEST-sua-public-key-aqui';
```

---

## 🧪 Passo 4: Testar (5 minutos)

### 4.1 Iniciar Servidor

```bash
# Terminal 1 - Backend
cd eternize-v3/server
npm install
npm start

# Terminal 2 - Frontend
cd eternize-v3
npm run serve
```

### 4.2 Acessar Página de Planos

1. Abra o navegador
2. Acesse: `http://localhost:8000/plans.html`
3. Clique em "Assinar Premium"

### 4.3 Fazer Pagamento de Teste

Use o cartão de teste:
- **Número:** 5031 4332 1540 6351
- **Nome:** APRO
- **CVV:** 123
- **Validade:** 11/25

✅ **Se funcionou:** Você será redirecionado para `/payment-success`  
❌ **Se não funcionou:** Veja a seção de Troubleshooting abaixo

---

## 🌐 Passo 5: Configurar Webhook (3 minutos)

### 5.1 O Que é Webhook?

Webhook é uma URL que o Mercado Pago chama quando um pagamento é processado. É essencial para ativar o premium automaticamente.

### 5.2 Configurar no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá para sua aplicação
3. Clique em "Webhooks"
4. Clique em "Configurar notificações"
5. Cole a URL:
   ```
   https://eternize-v3.vercel.app/api/webhook/mercadopago
   ```
6. Selecione eventos:
   - ✅ payment.created
   - ✅ payment.updated
7. Clique em "Salvar"

### 5.3 Testar Webhook Localmente (Opcional)

Para testar localmente, use ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Copiar URL gerada (ex: https://abc123.ngrok.io)
# Usar no webhook: https://abc123.ngrok.io/api/webhook/mercadopago
```

---

## 🚀 Passo 6: Ir para Produção (10 minutos)

### 6.1 Obter Credenciais de Produção

**IMPORTANTE:** Só faça isso quando estiver pronto para receber pagamentos reais!

1. No Mercado Pago Developers
2. Vá para "Credenciais"
3. Selecione "Credenciais de produção"
4. Copie:
   - **Access Token:** `APP_USR-1234567890...`
   - **Public Key:** `APP_USR-abcdef12...`

### 6.2 Configurar na Vercel

```bash
# Adicionar variáveis de ambiente
vercel env add MERCADO_PAGO_ACCESS_TOKEN
# Cole: APP_USR-seu-token-de-producao

vercel env add MERCADO_PAGO_PUBLIC_KEY
# Cole: APP_USR-sua-public-key-de-producao

vercel env add APP_URL
# Cole: https://eternize-v3.vercel.app
```

### 6.3 Deploy

```bash
vercel --prod
```

### 6.4 Atualizar Webhook

1. No Mercado Pago, edite o webhook
2. Atualize a URL para:
   ```
   https://eternize-v3.vercel.app/api/webhook/mercadopago
   ```

---

## 🐛 Troubleshooting

### Problema 1: "Erro ao criar pagamento"

**Causa:** Credenciais inválidas

**Solução:**
1. Verifique se copiou as credenciais corretamente
2. Confirme que está usando credenciais de TESTE
3. Verifique se não há espaços extras
4. Reinicie o servidor

### Problema 2: "Webhook não recebe notificações"

**Causa:** URL do webhook incorreta

**Solução:**
1. Verifique a URL no painel Mercado Pago
2. Confirme que a URL está acessível
3. Use ngrok para testar localmente
4. Verifique logs do servidor

### Problema 3: "Pagamento não ativa premium"

**Causa:** Webhook não está processando corretamente

**Solução:**
1. Verifique logs do servidor
2. Teste manualmente:
   ```bash
   curl -X POST http://localhost:3000/api/webhook/test-webhook \
     -H "Content-Type: application/json" \
     -d '{"userId":"test123","action":"activate_premium"}'
   ```
3. Verifique se o userId está correto

### Problema 4: "Public Key inválida no frontend"

**Causa:** Public Key não foi atualizada

**Solução:**
1. Edite `js/payment.js`
2. Substitua a Public Key
3. Limpe o cache do navegador (Ctrl+Shift+R)

---

## 📋 Checklist Final

Antes de considerar a configuração completa, verifique:

### Ambiente de Teste
- [ ] Conta Mercado Pago criada
- [ ] Aplicação criada no painel
- [ ] Credenciais de teste copiadas
- [ ] Arquivo `.env` configurado
- [ ] Public Key atualizada no frontend
- [ ] Servidor iniciado sem erros
- [ ] Pagamento de teste funcionando
- [ ] Redirecionamento para success funcionando

### Ambiente de Produção
- [ ] Credenciais de produção obtidas
- [ ] Variáveis configuradas na Vercel
- [ ] Deploy realizado
- [ ] Webhook configurado
- [ ] Pagamento real testado
- [ ] Email de confirmação funcionando
- [ ] Premium ativando corretamente

---

## 💡 Dicas Importantes

### Segurança
1. **NUNCA** compartilhe suas credenciais
2. **NUNCA** faça commit do arquivo `.env`
3. **SEMPRE** use HTTPS em produção
4. **SEMPRE** valide dados no backend

### Boas Práticas
1. Comece com credenciais de TESTE
2. Teste todo o fluxo antes de produção
3. Monitore os logs regularmente
4. Mantenha backup das configurações

### Suporte
Se precisar de ajuda:
- 📖 [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)
- 💬 [Fórum de Desenvolvedores](https://www.mercadopago.com.br/developers/pt/support)
- 📧 Email: developers@mercadopago.com

---

## 🎉 Pronto!

Se você seguiu todos os passos, seu sistema de pagamento está configurado e funcionando!

**Próximos Passos:**
1. Personalize os valores dos planos
2. Adicione mais métodos de pagamento
3. Configure emails de confirmação
4. Implemente analytics
5. Crie campanhas de marketing

---

**Configuração Mercado Pago** ✅  
**Tempo total:** ~30 minutos  
**Dificuldade:** Fácil  

*Agora você está pronto para monetizar seu SaaS! 💰*

---

## 📞 Precisa de Ajuda?

### Suporte Eternize
- 📧 Email: dev@eternize.com.br
- 📱 WhatsApp: (31) 99999-9999
- 💬 Discord: https://discord.gg/eternize

### Suporte Mercado Pago
- 📖 Docs: https://www.mercadopago.com.br/developers
- 💬 Fórum: https://www.mercadopago.com.br/developers/pt/support
- 📧 Email: developers@mercadopago.com

---

*Boa sorte com seu SaaS! 🚀*