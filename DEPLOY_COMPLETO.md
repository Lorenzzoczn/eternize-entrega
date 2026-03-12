# 🚀 Deploy Completo - Eternize (Frontend + Backend)

## 📋 Arquitetura de Deploy

```
┌─────────────────────────────────────────────┐
│                                             │
│  Frontend (Netlify)                         │
│  https://eternize.netlify.app               │
│  - HTML, CSS, JavaScript                    │
│  - Interface do usuário                     │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ API Calls
                   │
┌──────────────────▼──────────────────────────┐
│                                             │
│  Backend (Render/Railway)                   │
│  https://eternize-api.onrender.com          │
│  - Node.js + Express                        │
│  - Upload para S3                           │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ Upload
                   │
┌──────────────────▼──────────────────────────┐
│                                             │
│  Storage S3 (AWS/Backblaze/R2)              │
│  https://bucket.s3.amazonaws.com            │
│  - Armazenamento de fotos                   │
│  - URLs públicas                            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Opções de Deploy

### Opção 1: Deploy Completo (Recomendado)
**Frontend no Netlify + Backend no Render + S3**

✅ Todas as funcionalidades
✅ Compartilhamento real
✅ URLs públicas
✅ Escalável
💰 Custo: Grátis (Render) + S3 (~$1-5/mês)

### Opção 2: Apenas Frontend (Atual)
**Frontend no Netlify + IndexedDB**

✅ Funciona offline
✅ Sem custo
❌ Sem compartilhamento real
❌ Fotos apenas locais

---

## 📦 OPÇÃO 1: Deploy Completo

### Passo 1: Deploy do Backend (Render)

#### 1.1. Preparar Repositório

```bash
cd eternize-checkout
git add .
git commit -m "Deploy completo"
git push
```

#### 1.2. Criar Web Service no Render

1. Acesse [render.com](https://render.com)
2. New + → Web Service
3. Conecte seu repositório GitHub
4. Configure:

```
Name: eternize-api
Region: Oregon (US West)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

#### 1.3. Variáveis de Ambiente

Adicione no Render:

```env
PORT=3000
NODE_ENV=production

# S3 (Configure suas credenciais)
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_BUCKET=seu-bucket-eternize
S3_REGION=us-east-1
S3_ACCESS_KEY=sua_access_key
S3_SECRET_KEY=sua_secret_key
S3_PUBLIC_URL=https://seu-bucket.s3.amazonaws.com

# CORS (URL do seu Netlify)
FRONTEND_URL=https://seu-site.netlify.app
```

#### 1.4. Deploy

Clique em "Create Web Service" e aguarde ~3 minutos.

Sua API estará em: `https://eternize-api.onrender.com`

---

### Passo 2: Configurar S3

Escolha um provedor e configure:

#### AWS S3 (Mais popular)
1. Crie bucket no [console.aws.amazon.com/s3](https://console.aws.amazon.com/s3)
2. Desmarque "Block all public access"
3. Adicione bucket policy (público)
4. Crie Access Key no IAM
5. Configure no Render

#### Backblaze B2 (Mais barato)
1. Crie bucket em [backblaze.com/b2](https://backblaze.com/b2)
2. Configure como "Public"
3. Gere Application Key
4. Configure no Render

**Guia completo:** `../eternize-backend/CONFIGURAR_S3.md`

---

### Passo 3: Atualizar Frontend

#### 3.1. Atualizar URL da API

Edite `js/api-backend.js`:

```javascript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://eternize-api.onrender.com/api'; // ← Sua URL do Render
```

#### 3.2. Commit e Push

```bash
git add js/api-backend.js
git commit -m "Atualizar URL da API"
git push
```

#### 3.3. Deploy no Netlify

O Netlify fará deploy automático!

---

### Passo 4: Testar

1. Acesse seu site no Netlify
2. Crie um álbum
3. Adicione uma foto
4. Verifique se foto foi para S3
5. Compartilhe o link
6. Teste em outro dispositivo

---

## 📦 OPÇÃO 2: Apenas Frontend (Modo Atual)

Se você quer manter apenas no Netlify sem backend:

### O que funciona:
- ✅ Criar páginas
- ✅ Upload de fotos (IndexedDB)
- ✅ Galeria local
- ✅ QR Code
- ✅ Funciona offline

### Limitações:
- ❌ Fotos não são compartilháveis
- ❌ Funciona apenas no mesmo navegador
- ❌ Sem URLs públicas

### Como usar:

O sistema já está configurado para funcionar assim! Quando o backend não está disponível, ele usa IndexedDB automaticamente.

**Nenhuma configuração adicional necessária.**

---

## 🔧 Configuração Netlify

### netlify.toml

Já está configurado! Mas se precisar ajustar:

```toml
[build]
  publish = "."
  command = "echo 'Site estático'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## 🔄 Fluxo de Deploy

### Desenvolvimento Local

```bash
# Terminal 1: Backend
cd eternize-checkout
npm run server

# Terminal 2: Frontend
npm run frontend

# Ou tudo junto:
npm run dev:all
```

### Produção

```bash
# 1. Commit
git add .
git commit -m "Atualização"
git push

# 2. Deploy automático
# - Netlify: Frontend
# - Render: Backend
```

---

## 💰 Custos

### Opção 1: Deploy Completo

| Serviço | Custo | Detalhes |
|---------|-------|----------|
| Netlify | Grátis | 100GB bandwidth/mês |
| Render | Grátis | 750h/mês, sleep após 15min |
| S3 (AWS) | ~$1-5/mês | $0.023/GB armazenamento |
| S3 (Backblaze) | ~$0.50/mês | $0.005/GB armazenamento |

**Total: $0.50 - $5/mês**

### Opção 2: Apenas Frontend

| Serviço | Custo |
|---------|-------|
| Netlify | Grátis |

**Total: $0/mês**

---

## 🐛 Troubleshooting

### Backend não responde (Render)
- **Causa:** Cold start (sleep após 15min)
- **Solução:** Primeira requisição demora 30-60s
- **Alternativa:** Use UptimeRobot para manter ativo

### CORS Error
- **Causa:** URL do frontend não configurada
- **Solução:** Adicione `FRONTEND_URL` no Render

### Upload falha
- **Causa:** S3 não configurado
- **Solução:** Verifique credenciais no Render

### Fotos não aparecem
- **Causa:** Backend offline
- **Solução:** Sistema usa IndexedDB automaticamente

---

## ✅ Checklist de Deploy

### Backend (Render)
- [ ] Repositório no GitHub
- [ ] Web Service criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] S3 configurado
- [ ] Deploy concluído
- [ ] API respondendo (teste /api/health)

### Frontend (Netlify)
- [ ] URL da API atualizada
- [ ] Commit e push feito
- [ ] Deploy automático concluído
- [ ] Site acessível
- [ ] Funcionalidades testadas

### Testes
- [ ] Criar álbum funciona
- [ ] Upload funciona
- [ ] Fotos aparecem
- [ ] Compartilhamento funciona
- [ ] Teste em outro dispositivo

---

## 🎯 Recomendação

**Para uso real (compartilhamento entre dispositivos):**
→ Use **Opção 1** (Deploy Completo)

**Para testes/demonstração:**
→ Use **Opção 2** (Apenas Frontend) - já está funcionando!

---

## 📞 Suporte

### Logs do Render
```
Dashboard → Seu serviço → Logs
```

### Logs do Netlify
```
Dashboard → Seu site → Deploys → Deploy log
```

### Testar API
```bash
curl https://eternize-api.onrender.com/api/health
```

---

## 🎉 Pronto!

Escolha a opção que melhor se adequa ao seu caso e siga o guia!

**Opção 1:** Deploy completo com backend
**Opção 2:** Apenas frontend (já funciona no Netlify)
