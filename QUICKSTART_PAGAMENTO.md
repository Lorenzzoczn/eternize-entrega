# ⚡ Quick Start - Sistema de Pagamento

## 🚀 Implementação em 5 Minutos

### 1️⃣ Obter Credenciais Mercado Pago (2 min)

1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Copie as credenciais de **TESTE**:
   - Access Token
   - Public Key

### 2️⃣ Configurar Ambiente (1 min)

```bash
# Editar server/.env
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-token-aqui
MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key-aqui
APP_URL=http://localhost:3000
```

### 3️⃣ Instalar Dependências (1 min)

```bash
cd server
npm install mercadopago
cd ..
```

### 4️⃣ Iniciar Servidor (30 seg)

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
npm run serve
```

### 5️⃣ Testar (30 seg)

1. Acesse: `http://localhost:8000/plans.html`
2. Clique em "Assinar Premium"
3. Use cartão de teste:
   - **Número:** 5031 4332 1540 6351
   - **CVV:** 123
   - **Validade:** 11/25
   - **Nome:** APRO

✅ **Pronto!** Sistema funcionando!

---

## 📋 Checklist de Deploy

### Antes de ir para Produção

- [ ] Trocar credenciais de TESTE por PRODUÇÃO
- [ ] Configurar webhook no Mercado Pago
- [ ] Atualizar `APP_URL` para domínio real
- [ ] Testar fluxo completo em produção
- [ ] Configurar emails de confirmação
- [ ] Adicionar analytics de conversão

### Variáveis de Ambiente (Vercel)

```bash
vercel env add MERCADO_PAGO_ACCESS_TOKEN
# Cole: APP_USR-seu-token-de-producao

vercel env add MERCADO_PAGO_PUBLIC_KEY
# Cole: APP_USR-sua-public-key-de-producao

vercel env add APP_URL
# Cole: https://eternize-v3.vercel.app
```

### Deploy

```bash
vercel --prod
```

---

## 🎯 Fluxo Simplificado

```
Usuário → Planos → Seleciona Premium → Login Check
    ↓
Backend cria preferência → Mercado Pago
    ↓
Usuário paga → Webhook notifica → Ativa Premium
    ↓
Redireciona → /payment-success → Dashboard
```

---

## 🧪 Cartões de Teste

| Status | Número | Nome |
|--------|--------|------|
| ✅ Aprovado | 5031 4332 1540 6351 | APRO |
| ❌ Rejeitado | 5031 4332 1540 6351 | OTHE |
| ⏳ Pendente | 5031 4332 1540 6351 | PEND |

**CVV:** 123  
**Validade:** 11/25

---

## 📊 Estrutura de Arquivos

```
eternize-v3/
├── server/
│   ├── services/
│   │   └── mercadoPagoService.js    # Lógica Mercado Pago
│   ├── routes/
│   │   ├── payment.js               # Rotas de pagamento
│   │   └── webhook.js               # Webhook handler
│   └── .env                         # Credenciais
├── js/
│   └── payment.js                   # Frontend pagamento
├── css/
│   └── plans.css                    # Estilos planos
├── plans.html                       # Página de planos
├── payment-success.html             # Sucesso
├── payment-failure.html             # Falha
└── payment-pending.html             # Pendente
```

---

## 🔧 Comandos Úteis

### Testar Criação de Pagamento
```bash
curl -X POST http://localhost:3000/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "premium-monthly",
    "userId": "test123",
    "userEmail": "test@example.com"
  }'
```

### Testar Ativação Premium
```bash
curl -X POST http://localhost:3000/api/webhook/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "action": "activate_premium"
  }'
```

### Verificar Status Premium
```bash
curl http://localhost:3000/api/webhook/check-premium/test123
```

---

## 💡 Dicas Rápidas

### Aumentar Conversão
1. Oferecer trial de 7 dias
2. Mostrar comparação de planos
3. Adicionar depoimentos
4. Criar urgência (oferta limitada)

### Evitar Problemas
1. Sempre usar HTTPS em produção
2. Validar webhook com assinatura
3. Implementar rate limiting
4. Logar todas as transações

### Monetização Inteligente
- **Plano Básico:** 1 evento (isca)
- **Premium:** Eventos ilimitados (conversão)
- **Anual:** Desconto de 17% (retenção)
- **Vitalício:** Pagamento único (LTV alto)

---

## 🆘 Problemas Comuns

### Webhook não funciona
```bash
# Usar ngrok para testar localmente
ngrok http 3000
# URL: https://abc123.ngrok.io/api/webhook/mercadopago
```

### Pagamento não ativa premium
```javascript
// Verificar logs do webhook
console.log('Webhook data:', req.body);
```

### Erro ao criar preferência
```javascript
// Verificar credenciais
console.log('Access Token:', process.env.MERCADO_PAGO_ACCESS_TOKEN);
```

---

## 📞 Suporte

- 📖 [Documentação Completa](INTEGRACAO_MERCADOPAGO.md)
- 🔗 [Mercado Pago Docs](https://www.mercadopago.com.br/developers)
- 💬 Discord: https://discord.gg/eternize

---

**Sistema pronto em 5 minutos!** ⚡

*Happy coding! 🚀*