# 🎯 Sistema Eternize Completo - Frontend + Backend

Sistema integrado com frontend estático e backend Node.js + S3.

## 📦 Estrutura do Projeto

```
eternize-checkout/
├── server/                    # Backend Node.js
│   ├── index.js              # Servidor Express
│   ├── routes.js             # Rotas da API
│   ├── s3.js                 # Upload S3
│   ├── package.json          # Dependências backend
│   └── .env                  # Configurações S3
│
├── js/                        # Frontend JavaScript
│   ├── api-backend.js        # Cliente API backend
│   ├── gallery-backend.js    # Galeria com S3
│   ├── create-backend.js     # Criar álbum com backend
│   ├── storage.js            # IndexedDB (fallback)
│   ├── gallery.js            # Galeria local
│   └── ...                   # Outros scripts
│
├── css/                       # Estilos
├── *.html                     # Páginas HTML
└── package.json              # Dependências do projeto
```

## 🚀 Como Rodar

### 1. Instalar Dependências

```bash
cd eternize-checkout
npm install
```

### 2. Configurar S3

Copie o arquivo de exemplo:

```bash
cd server
cp .env.example .env
```

Edite `server/.env` com suas credenciais S3:

```env
PORT=3000
NODE_ENV=development

S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_BUCKET=seu-bucket-eternize
S3_REGION=us-east-1
S3_ACCESS_KEY=sua_access_key
S3_SECRET_KEY=sua_secret_key
S3_PUBLIC_URL=https://seu-bucket.s3.amazonaws.com

FRONTEND_URL=http://localhost:5500
```

### 3. Iniciar o Sistema

**Opção 1: Rodar tudo junto (Recomendado)**

```bash
npm run dev:all
```

Isso inicia:
- Backend em `http://localhost:3000`
- Frontend em `http://localhost:5500`

**Opção 2: Rodar separadamente**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run frontend
```

### 4. Acessar

Abra o navegador em: `http://localhost:5500`

## 🎯 Funcionalidades

### Sistema Híbrido

O sistema funciona em **dois modos**:

1. **Com Backend (S3)** - Modo completo
   - Upload para S3
   - URLs públicas
   - Compartilhamento real
   - Escalável

2. **Sem Backend (IndexedDB)** - Modo offline
   - Fallback automático
   - Armazenamento local
   - Funciona sem servidor
   - Ideal para testes

### Detecção Automática

O sistema detecta automaticamente se o backend está disponível:

```javascript
const backendAvailable = await isBackendAvailable();
```

Se o backend não estiver disponível, usa IndexedDB automaticamente.

## 📡 API Endpoints

### POST /api/album
Criar novo álbum

**Response:**
```json
{
  "success": true,
  "albumId": "uuid-aqui"
}
```

### POST /api/upload/:albumId
Upload de foto para S3

**Body:** `multipart/form-data` com campo `file`

**Response:**
```json
{
  "success": true,
  "url": "https://bucket.s3.amazonaws.com/albums/uuid/foto.jpg",
  "albumId": "uuid"
}
```

### GET /api/album/:albumId
Buscar fotos do álbum

**Response:**
```json
{
  "success": true,
  "albumId": "uuid",
  "photos": ["url1", "url2"],
  "photoDetails": [...],
  "totalPhotos": 2
}
```

### GET /api/health
Health check

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-03T...",
  "albums": 5
}
```

## 🔧 Configuração

### Variáveis de Ambiente

Edite `server/.env`:

```env
# Servidor
PORT=3000
NODE_ENV=production

# S3 (AWS / Backblaze / Cloudflare R2 / DigitalOcean)
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_BUCKET=seu-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=sua_key
S3_SECRET_KEY=sua_secret
S3_PUBLIC_URL=https://seu-bucket.s3.amazonaws.com

# CORS
FRONTEND_URL=http://localhost:5500
```

### Configurar S3

Veja guia completo em: `../eternize-backend/CONFIGURAR_S3.md`

Provedores suportados:
- AWS S3
- Backblaze B2
- Cloudflare R2
- DigitalOcean Spaces

## 🌐 Deploy

### Backend

**Render (Gratuito):**
1. Faça push para GitHub
2. Conecte no Render
3. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Adicione variáveis de ambiente

**Railway (Gratuito):**
1. Conecte repositório
2. Configure root directory: `server`
3. Adicione variáveis de ambiente

### Frontend

**Netlify:**
1. Conecte repositório
2. Configure:
   - Publish directory: `.`
   - Build command: (vazio)
3. Atualize `js/api-backend.js` com URL do backend

**Vercel:**
1. Conecte repositório
2. Deploy automático
3. Configure variáveis se necessário

## 🔗 Integração

### Atualizar URL da API

Após deploy do backend, atualize em `js/api-backend.js`:

```javascript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://seu-backend.onrender.com/api'; // URL do backend em produção
```

### CORS

O backend já está configurado para aceitar requisições do frontend.

Se necessário, atualize em `server/index.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  // ...
}));
```

## 🧪 Testar

### Teste Local

1. Inicie backend e frontend
2. Abra `http://localhost:5500`
3. Crie um álbum
4. Adicione fotos
5. Verifique se fotos aparecem
6. Teste compartilhamento

### Teste em Produção

1. Deploy backend
2. Deploy frontend
3. Atualize URL da API
4. Teste fluxo completo

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verifique porta
lsof -i :3000

# Ou mude a porta
PORT=3001 npm start
```

### CORS Error
- Verifique `FRONTEND_URL` no `.env`
- Confirme URL da API no frontend

### Upload falha
- Verifique credenciais S3
- Confirme permissões do bucket
- Teste credenciais localmente

### Frontend não conecta
- Verifique se backend está rodando
- Confirme URL da API
- Veja console do navegador (F12)

## 📊 Comparação de Modos

| Recurso | Com Backend (S3) | Sem Backend (IndexedDB) |
|---------|------------------|-------------------------|
| Upload | S3 | Local |
| Compartilhamento | Real | Mesmo dispositivo |
| URLs | Públicas | Base64 |
| Escalabilidade | Alta | Limitada |
| Custo | S3 | Grátis |
| Offline | Não | Sim |

## ✅ Checklist

- [ ] Backend instalado
- [ ] S3 configurado
- [ ] Backend rodando
- [ ] Frontend rodando
- [ ] Criar álbum funciona
- [ ] Upload funciona
- [ ] Fotos aparecem
- [ ] Compartilhamento funciona
- [ ] Deploy backend OK
- [ ] Deploy frontend OK

## 🎉 Pronto!

Seu sistema está completo e funcionando!

**Modo desenvolvimento:**
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5500`

**Modo produção:**
- Backend: `https://seu-backend.onrender.com`
- Frontend: `https://seu-site.netlify.app`
