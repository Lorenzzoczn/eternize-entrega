## Deploy do Eternize na Hostinger (Node.js Web App)

Este guia descreve como colocar o **Eternize v3** em produção na Hostinger usando um aplicativo Node.js, servindo **frontend estático + backend Express** em um único projeto.

---

## 1. Estrutura do projeto

Diretório principal do Eternize:

- `eternize-v3/`
  - `index.html`, `*.html`, `css/`, `js/` → **frontend**
  - `server/` → **backend Node.js/Express**
    - `api.js` → entrypoint
    - `routes/*.js` → rotas da API
    - `firebase.js` → configuração Firebase Admin
    - `services/mercadoPagoService.js` → integração Mercado Pago

O backend (`server/api.js`) está configurado para:

- Usar `process.env.PORT` (ou `3000` por padrão).
- Servir arquivos estáticos do diretório pai (`eternize-v3/`), incluindo HTML/CSS/JS.
- Expor rotas da API sob `/api/...`.

---

## 2. Arquivo `.env` (backend)

Crie um arquivo `.env` dentro de `eternize-v3/server/` com as variáveis necessárias:

```env
NODE_ENV=production

# Porta fornecida pela Hostinger (normalmente você NÃO define aqui; Hostinger injeta)
# PORT=3000

# URL pública completa da aplicação (com https e domínio)
APP_URL=https://seu-dominio.com

# CORS: frontend rodando no mesmo domínio
CORS_ORIGIN=https://seu-dominio.com

# Firebase
FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
# Caminho absoluto no servidor para o arquivo de service account
GOOGLE_APPLICATION_CREDENTIALS=/home/seu-usuario/eternize/firebase-service-account.json

# Mercado Pago (use token de produção em produção)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Painel admin básico
ADMIN_API_KEY=uma_senha_forte_para_painel_admin
```

> Importante:
> - **Nunca** commite o `.env` nem o arquivo `firebase-service-account.json`.
> - O `GOOGLE_APPLICATION_CREDENTIALS` deve apontar para o caminho absoluto do arquivo no servidor.

---

## 3. Deploy na Hostinger (Node.js Web App)

### 3.1. Preparar arquivos locais

1. Certifique-se de que o projeto Eternize está completo em `eternize-v3/`.
2. Dentro de `eternize-v3/server/`, instale as dependências:

```bash
cd eternize-v3/server
npm install
```

3. Teste localmente:

```bash
npm run dev

# Acesse:
# - Frontend: http://localhost:3000
# - API:      http://localhost:3000/api/health
```

### 3.2. Enviar projeto para a Hostinger

1. No painel da Hostinger (hPanel), crie um **Novo App Node.js**.
2. Escolha o diretório onde o projeto ficará, por exemplo:
   - `/home/seu-usuario/eternize-v3`
3. Faça upload dos arquivos do projeto via FTP ou Git:
   - **Inclua**: tudo dentro de `eternize-v3/`
   - **Exclua**: `node_modules` (serão instalados no servidor).

### 3.3. Configurar o App Node.js

Na página do app Node.js:

- **Application root**: `eternize-v3/server`
- **Application startup file**: `api.js`
- **Node.js version**: 18+ (ou a mais recente disponível).

Na seção de variáveis de ambiente (Environment variables):

- Adicione todas as variáveis do `.env` (APP_URL, CORS_ORIGIN, FIREBASE_STORAGE_BUCKET, etc.).
- Não esqueça do `MERCADO_PAGO_ACCESS_TOKEN` e `ADMIN_API_KEY`.

Clique em **Instalar dependências** (ou rode `npm install` no terminal da Hostinger, dentro de `eternize-v3/server`).

Depois, clique em **Reiniciar app**.

---

## 4. Configuração de domínio e SSL

### 4.1. Apontar domínio para Hostinger

1. No painel de domínios da Hostinger:
   - Aponte o domínio (ex: `seu-dominio.com`) para o servidor da Hostinger (ou use o domínio que já veio configurado).
2. No hPanel, associe o domínio ao seu site / app Node.js conforme a documentação da Hostinger.

### 4.2. SSL (HTTPS)

1. No hPanel, acesse a seção **SSL**.
2. Ative o **SSL gratuito** (Let’s Encrypt) para o seu domínio.
3. Aguarde a emissão do certificado.

> Após o SSL estar ativo, garanta que:
> - `APP_URL` usa `https://seu-dominio.com`
> - `CORS_ORIGIN` usa `https://seu-dominio.com`

---

## 5. Webhook público do Mercado Pago

Com o app rodando em produção, o webhook exposto será:

```text
POST https://seu-dominio.com/api/webhook/mercadopago
```

### 5.1. Configurar no painel do Mercado Pago

1. Acesse o **Painel do Desenvolvedor** do Mercado Pago.
2. Vá em **Notificações Webhook**.
3. Em **URL de notificação**, informe:

```text
https://seu-dominio.com/api/webhook/mercadopago
```

4. Marque pelo menos o tópico **Pagamentos (payment)**.
5. Salve.

> Lembre-se de que:
> - O backend **sempre** consulta a API oficial do Mercado Pago para validar o pagamento.
> - O webhook responde `200` rapidamente, mesmo em caso de erro interno.

---

## 6. CORS e URLs

No backend, o CORS é configurado assim:

```js
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

Para produção:

- Defina `CORS_ORIGIN=https://seu-dominio.com` (ou o subdomínio do app).
- Se o frontend e backend estiverem no **mesmo domínio**, isso é suficiente.

URLs importantes:

- Frontend:
  - `https://seu-dominio.com/index.html` (landing)
  - `https://seu-dominio.com/plans.html` (planos)
  - `https://seu-dominio.com/checkout.html` (se existir)
  - `https://seu-dominio.com/admin.html` (painel admin)
- API:
  - `https://seu-dominio.com/api/health`
  - `https://seu-dominio.com/api/events`
  - `https://seu-dominio.com/api/upload`
  - `https://seu-dominio.com/api/payments/create-preference`
  - `https://seu-dominio.com/api/admin/events`

---

## 7. Checklist rápido de deploy

1. **Código**
   - [ ] `eternize-v3/` contém todos os HTML/CSS/JS e a pasta `server/`.
   - [ ] `server/api.js` usa `process.env.PORT || 3000`.
   - [ ] `server/api.js` serve estáticos de `path.join(__dirname, '..')`.

2. **Backend**
   - [ ] Em `eternize-v3/server`, executou `npm install`.
   - [ ] `package.json` tem `"start": "node api.js"`.

3. **Ambiente (.env / variáveis)**
   - [ ] `APP_URL` definido com `https://seu-dominio.com`.
   - [ ] `CORS_ORIGIN` definido com o mesmo domínio.
   - [ ] `FIREBASE_STORAGE_BUCKET` configurado.
   - [ ] `GOOGLE_APPLICATION_CREDENTIALS` apontando para o JSON de service account.
   - [ ] `MERCADO_PAGO_ACCESS_TOKEN` definido (sandbox em testes, produção depois).
   - [ ] `ADMIN_API_KEY` configurada com um valor forte.

4. **Hostinger**
   - [ ] App Node.js criado apontando para `eternize-v3/server`.
   - [ ] Startup file: `api.js`.
   - [ ] Dependências instaladas no servidor.
   - [ ] App reiniciado sem erros.

5. **Domínio e SSL**
   - [ ] Domínio apontando para o servidor Hostinger.
   - [ ] SSL ativo para o domínio.

6. **Mercado Pago**
   - [ ] URL do webhook configurada: `https://seu-dominio.com/api/webhook/mercadopago`.
   - [ ] Tópico de pagamentos habilitado.

Se todos os itens estiverem marcados, o Eternize estará pronto para rodar em produção na Hostinger com frontend + backend integrados, webhook de pagamento e Firebase funcionando.

