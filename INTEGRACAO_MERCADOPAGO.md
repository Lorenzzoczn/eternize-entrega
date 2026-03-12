# 💳 Integração Mercado Pago - Eternize v3

## 🎯 Visão Geral

Sistema completo de pagamento integrado com Mercado Pago para monetização do Eternize v3. Permite que usuários façam upgrade para planos premium e desbloqueiem recursos exclusivos.

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Estrutura de Planos](#estrutura-de-planos)
3. [Fluxo de Pagamento](#fluxo-de-pagamento)
4. [Endpoints da API](#endpoints-da-api)
5. [Webhooks](#webhooks)
6. [Frontend](#frontend)
7. [Segurança](#segurança)
8. [Deploy](#deploy)
9. [Testes](#testes)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Configuração Inicial

### 1. Criar Conta no Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma conta ou faça login
3. Vá para "Suas integrações"
4. Crie uma nova aplicação

### 2. Obter Credenciais

**Credenciais de Teste:**
- Access Token: `TEST-xxxx-xxxx-xxxx-xxxx`
- Public Key: `TEST-xxxx-xxxx-xxxx-xxxx`

**Credenciais de Produção:**
- Access Token: `APP_USR-xxxx-xxxx-xxxx-xxxx`
- Public Key: `APP_USR-xxxx-xxxx-xxxx-xxxx`

### 3. Configurar Variáveis de Ambiente

Edite `server/.env`:

```bash
# Mercado Pago - Teste
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
MERCADO_PAGO_PUBLIC_KEY=TEST-abcdef12-3456-7890-abcd-ef1234567890

# Mercado Pago - Produção (quando estiver pronto)
# MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
# MERCADO_PAGO_PUBLIC_KEY=APP_USR-abcdef12-3456-7890-abcd-ef1234567890

# URL da aplicação
APP_URL=https://eternize-v3.vercel.app
```

### 4. Instalar Dependências

```bash
cd server
npm install mercadopago
```

---

## 💎 Estrutura de Planos

### Plano Básico (Gratuito)
- ✅ 1 evento ativo
- ✅ Até 50 fotos por evento
- ✅ QR Code padrão
- ✅ Galeria pública
- ❌ Personalização de QR
- ❌ Download de fotos
- ❌ Galeria privada

### Plano Premium Mensal (R$ 29,90/mês)
- ✅ Eventos ilimitados
- ✅ Upload ilimitado de fotos
- ✅ QR Code personalizado
- ✅ Galeria privada
- ✅ Download de todas as fotos
- ✅ Temas exclusivos
- ✅ Suporte prioritário
- ✅ Sem marca d'água

### Plano Premium Anual (R$ 299,90/ano)
- ✅ Todos os recursos do Premium Mensal
- ✅ Economize R$ 59,90 (17% de desconto)
- ✅ R$ 24,99/mês

### Plano Vitalício (R$ 497,00 - pagamento único)
- ✅ Todos os recursos Premium
- ✅ Acesso vitalício
- ✅ Atualizações gratuitas
- ✅ Sem mensalidades

---

## 🔄 Fluxo de Pagamento

### 1. Usuário Seleciona Plano
```
Página de Planos → Botão "Assinar Premium" → Verificação de Login
```

### 2. Criação da Preferência
```javascript
POST /api/create-payment
{
  "plan": "premium-monthly",
  "userId": "user123",
  "userEmail": "user@example.com",
  "userName": "João Silva"
}

Response:
{
  "success": true,
  "preferenceId": "123456789-abcd-efgh-ijkl-123456789012",
  "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

### 3. Redirecionamento para Checkout
```
Frontend → Redireciona para initPoint → Checkout Mercado Pago
```

### 4. Processamento do Pagamento
```
Usuário paga → Mercado Pago processa → Webhook notifica backend
```

### 5. Ativação do Premium
```
Webhook recebe notificação → Verifica pagamento → Ativa premium → Atualiza banco
```

### 6. Retorno ao Site
```
Mercado Pago → Redireciona para /payment-success → Mostra confirmação
```

---

## 🔌 Endpoints da API

### POST /api/create-payment
Cria preferência de pagamento no Mercado Pago.

**Request:**
```json
{
  "plan": "premium-monthly",
  "userId": "user123",
  "userEmail": "user@example.com",
  "userName": "João Silva"
}
```

**Response:**
```json
{
  "success": true,
  "preferenceId": "123456789-abcd-efgh-ijkl-123456789012",
  "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

### GET /api/payment-status/:paymentId
Verifica status de um pagamento específico.

**Response:**
```json
{
  "success": true,
  "status": "approved",
  "approved": true,
  "details": {
    "statusDetail": "accredited",
    "transactionAmount": 29.90,
    "dateApproved": "2025-01-11T10:30:00Z"
  }
}
```

### GET /api/payment-history/:userId
Retorna histórico de pagamentos do usuário.

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "123456789",
      "status": "approved",
      "statusDetail": "accredited",
      "amount": 29.90,
      "dateCreated": "2025-01-11T10:00:00Z",
      "dateApproved": "2025-01-11T10:30:00Z",
      "description": "Eternize Premium - Mensal"
    }
  ]
}
```

### POST /api/webhook/mercadopago
Recebe notificações do Mercado Pago.

**Request (do Mercado Pago):**
```json
{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

**Ações:**
- `payment.approved` → Ativa premium do usuário
- `payment.rejected` → Notifica falha
- `payment.pending` → Aguarda confirmação

### GET /api/webhook/check-premium/:userId
Verifica status premium do usuário.

**Response:**
```json
{
  "success": true,
  "isPremium": true,
  "plan": "premium",
  "planType": "premium-monthly",
  "expiresAt": "2025-02-11T10:30:00Z",
  "isExpired": false,
  "features": {
    "unlimitedEvents": true,
    "customQRCode": true,
    "privateGallery": true,
    "downloadPhotos": true,
    "prioritySupport": true
  }
}
```

---

## 🔔 Webhooks

### Configurar Webhook no Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá para sua aplicação
3. Clique em "Webhooks"
4. Adicione a URL: `https://eternize-v3.vercel.app/api/webhook/mercadopago`
5. Selecione eventos:
   - `payment.created`
   - `payment.updated`

### Eventos Processados

**payment.approved**
```javascript
{
  type: 'payment',
  data: { id: '123456789' }
}
→ Ativa premium do usuário
→ Atualiza banco de dados
→ Envia email de confirmação (opcional)
```

**payment.rejected**
```javascript
{
  type: 'payment',
  data: { id: '123456789' }
}
→ Registra falha
→ Notifica usuário (opcional)
```

**payment.pending**
```javascript
{
  type: 'payment',
  data: { id: '123456789' }
}
→ Aguarda confirmação
→ Mantém status pendente
```

### Testar Webhook Localmente

Use [ngrok](https://ngrok.com/) para expor localhost:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# URL gerada: https://abc123.ngrok.io
# Webhook URL: https://abc123.ngrok.io/api/webhook/mercadopago
```

---

## 🎨 Frontend

### Página de Planos (`plans.html`)

**Recursos:**
- Toggle mensal/anual
- Cards de planos com animações
- Comparação de recursos
- FAQ
- Integração com Mercado Pago SDK

### Sistema de Pagamento (`js/payment.js`)

**Funcionalidades:**
- Verificação de login
- Criação de preferência
- Redirecionamento para checkout
- Processamento de retorno
- Verificação de status premium

### Páginas de Retorno

**payment-success.html**
- Confirmação de pagamento aprovado
- Lista de recursos desbloqueados
- Botão para dashboard

**payment-failure.html**
- Mensagem de falha
- Possíveis motivos
- Botão para tentar novamente

**payment-pending.html**
- Informação sobre pagamento pendente
- Tempo estimado de aprovação
- Instruções de acompanhamento

---

## 🔒 Segurança

### Validações Implementadas

1. **Verificação de Login**
   - Usuário deve estar autenticado
   - Token de sessão válido

2. **Validação de Planos**
   - Apenas planos válidos aceitos
   - Preços fixos no backend

3. **Webhook Security**
   - Validação de origem
   - Verificação de assinatura (recomendado)
   - Rate limiting

4. **Dados Sensíveis**
   - Access Token apenas no backend
   - Public Key apenas no frontend
   - Nunca expor credenciais

### Boas Práticas

```javascript
// ❌ NUNCA FAZER
const accessToken = 'APP_USR-123456...'; // No frontend

// ✅ CORRETO
// Backend: process.env.MERCADO_PAGO_ACCESS_TOKEN
// Frontend: Apenas Public Key para SDK
```

---

## 🚀 Deploy

### Vercel

1. **Configurar Variáveis de Ambiente**
```bash
vercel env add MERCADO_PAGO_ACCESS_TOKEN
vercel env add MERCADO_PAGO_PUBLIC_KEY
vercel env add APP_URL
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configurar Webhook**
- URL: `https://seu-projeto.vercel.app/api/webhook/mercadopago`
- Adicionar no painel do Mercado Pago

### Netlify

1. **Configurar Variáveis**
- Site Settings → Environment Variables
- Adicionar todas as variáveis do `.env`

2. **Deploy**
```bash
netlify deploy --prod
```

---

## 🧪 Testes

### Cartões de Teste

**Aprovado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO
```

**Rejeitado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: OTHE
```

**Pendente:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: PEND
```

### Testar Fluxo Completo

1. **Criar Pagamento**
```bash
curl -X POST http://localhost:3000/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "premium-monthly",
    "userId": "test123",
    "userEmail": "test@example.com",
    "userName": "Test User"
  }'
```

2. **Simular Webhook**
```bash
curl -X POST http://localhost:3000/api/webhook/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "action": "activate_premium"
  }'
```

3. **Verificar Premium**
```bash
curl http://localhost:3000/api/webhook/check-premium/test123
```

---

## 🐛 Troubleshooting

### Problema: Webhook não recebe notificações

**Soluções:**
1. Verificar URL do webhook no painel Mercado Pago
2. Confirmar que a URL está acessível publicamente
3. Verificar logs do servidor
4. Testar com ngrok localmente

### Problema: Pagamento não ativa premium

**Soluções:**
1. Verificar logs do webhook
2. Confirmar que o userId está correto
3. Verificar conexão com banco de dados
4. Testar endpoint `/webhook/test-webhook`

### Problema: Erro ao criar preferência

**Soluções:**
1. Verificar Access Token
2. Confirmar formato dos dados
3. Verificar rate limits
4. Testar com credenciais de teste

### Problema: Redirecionamento não funciona

**Soluções:**
1. Verificar `APP_URL` no `.env`
2. Confirmar `back_urls` na preferência
3. Testar URLs manualmente
4. Verificar CORS

---

## 📊 Monitoramento

### Métricas Importantes

- Taxa de conversão (visitantes → pagantes)
- Taxa de aprovação de pagamentos
- Tempo médio de ativação
- Churn rate (cancelamentos)
- MRR (Monthly Recurring Revenue)

### Logs Recomendados

```javascript
// Criar pagamento
console.log('Payment created:', { userId, plan, preferenceId });

// Webhook recebido
console.log('Webhook received:', { type, paymentId, status });

// Premium ativado
console.log('Premium activated:', { userId, planType, expiresAt });
```

---

## 💡 Dicas de Monetização

### Estratégias de Conversão

1. **Trial Gratuito**
   - Oferecer 7 dias de premium grátis
   - Aumenta conversão em ~30%

2. **Desconto no Anual**
   - 17% de desconto já implementado
   - Incentiva compromisso de longo prazo

3. **Upsell no Limite**
   - Mostrar modal quando atingir limite
   - "Você atingiu o limite de 1 evento. Upgrade agora!"

4. **Social Proof**
   - "Mais de 1.000 usuários premium"
   - Depoimentos de clientes

5. **Urgência**
   - "Oferta por tempo limitado"
   - "Últimas vagas com desconto"

### Otimizações

- A/B test de preços
- Oferecer plano trimestral
- Programa de afiliados
- Cupons de desconto
- Cashback para renovação

---

## 📞 Suporte

### Documentação Oficial
- [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [API Reference](https://www.mercadopago.com.br/developers/pt/reference)

### Contato Eternize
- 📧 Email: dev@eternize.com.br
- 📱 WhatsApp: (31) 99999-9999
- 💬 Discord: https://discord.gg/eternize

---

**Sistema de Pagamento Mercado Pago** ✅  
Integração completa e pronta para produção!

*Desenvolvido com ❤️ pela equipe Eternize*