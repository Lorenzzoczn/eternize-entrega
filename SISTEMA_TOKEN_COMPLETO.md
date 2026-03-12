# 🔑 Sistema de Tokens Eternize v3

## Visão Geral

O Eternize v3 implementa um sistema avançado de tokens para QR Codes únicos, integrado com Firebase Storage e páginas públicas de memória. Este sistema permite que cada evento tenha um token único que direciona para uma página pública onde os convidados podem enviar fotos.

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **Token System** (`js/token-system.js`)
   - Geração de tokens únicos de 12 caracteres
   - Validação de formato de tokens
   - Sistema de temas (toy-story, princesas, neutro)
   - Rate limiting para uploads

2. **Firebase Integration** (`js/firebase-config.js`)
   - Firestore para metadados de eventos e fotos
   - Firebase Storage para armazenamento de imagens
   - Autenticação e segurança

3. **Backend API** (`server/api.js`)
   - Endpoints RESTful para CRUD de eventos e fotos
   - Upload seguro com validação
   - Rate limiting e segurança

4. **Admin Panel** (`admin.html`, `js/admin-panel.js`)
   - Interface para gerenciar eventos
   - Aprovação/rejeição de fotos
   - Geração de QR Codes estilizados
   - Estatísticas em tempo real

5. **Memoria Pages** (`js/memoria-page.js`, `css/memoria.css`)
   - Páginas públicas acessíveis via `/memoria/{token}`
   - Upload de fotos pelos convidados
   - Galeria responsiva com temas

## 🔄 Fluxo de Funcionamento

### 1. Criação de Evento
```
Admin Panel → Criar Evento → Gerar Token → Salvar no Firebase
```

### 2. Compartilhamento
```
QR Code Gerado → URL: /memoria/{token} → Compartilhamento
```

### 3. Upload de Fotos
```
Convidado → Escaneia QR → Acessa /memoria/{token} → Upload → Firebase Storage
```

### 4. Moderação
```
Admin Panel → Visualizar Fotos → Aprovar/Rejeitar → Atualizar Status
```

## 📊 Estrutura de Dados

### Eventos (Firestore Collection: `eventos`)
```javascript
{
  id: "event_1234567890",
  nome_evento: "Casamento da Maria",
  data_evento: "2025-08-20",
  token: "abc123xyz456",
  tema: "princesas",
  cores: {
    primaria: "#FFB6C1",
    secundaria: "#DDA0DD"
  },
  criado_em: "2025-01-11T10:00:00Z",
  ativo: true
}
```

### Fotos (Firestore Collection: `fotos`)
```javascript
{
  id: "photo_1234567890_abc",
  evento_id: "event_1234567890",
  token: "abc123xyz456",
  url: "https://storage.googleapis.com/...",
  storage_path: "eventos/abc123xyz456/photo.jpg",
  original_name: "IMG_001.jpg",
  size: 2048576,
  type: "image/jpeg",
  uploaded_by: "João Silva",
  message: "Momento especial!",
  criado_em: "2025-01-11T10:30:00Z",
  aprovado: false
}
```

## 🎨 Sistema de Temas

### Toy Story
- **Cores**: Dourado (#FFD700) + Vermelho (#FF0000)
- **Ícone**: 🚀
- **Background**: Gradiente dourado para vermelho

### Princesas
- **Cores**: Rosa claro (#FFB6C1) + Roxo claro (#DDA0DD)
- **Ícone**: 👑
- **Background**: Gradiente rosa para roxo

### Neutro
- **Cores**: Ouro fosco (#E4D9B6) + Rosa bebê (#FFD1DC)
- **Ícone**: ✨
- **Background**: Gradiente ouro para rosa

## 🔐 Segurança Implementada

### Rate Limiting
- **Uploads**: 50 por hora por IP
- **API Geral**: 100 requests por 15 minutos por IP
- **Token-based**: 50 uploads por hora por token

### Validações
- **Formato de Token**: Regex `/^[a-z0-9]{12}$/`
- **Tipos de Arquivo**: Apenas imagens
- **Tamanho**: Máximo 10MB por arquivo
- **Sanitização**: Inputs sanitizados (XSS protection)

### Headers de Segurança
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 🚀 Endpoints da API

### Eventos
```
POST /api/events          - Criar evento
GET  /api/events/:token   - Buscar evento por token
GET  /api/stats/:token    - Estatísticas do evento
```

### Fotos
```
POST   /api/upload              - Upload de foto
GET    /api/photos/:token       - Listar fotos por token
PATCH  /api/photos/:id/approve  - Aprovar foto
DELETE /api/photos/:id          - Deletar foto
```

### Páginas Públicas
```
GET /memoria/:token - Página pública do evento
GET /api/qr/:token  - Gerar QR Code
```

## 📱 URLs de Exemplo

### Desenvolvimento
```
http://localhost:3000/memoria/abc123xyz456
http://localhost:3000/api/events/abc123xyz456
http://localhost:3000/admin.html
```

### Produção
```
https://eternize-v3.vercel.app/memoria/abc123xyz456
https://eternize-v3.vercel.app/api/events/abc123xyz456
https://eternize-v3.vercel.app/admin.html
```

## 🛠️ Configuração do Firebase

### 1. Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie novo projeto
3. Ative Firestore Database
4. Ative Storage
5. Configure regras de segurança

### 2. Configurar Credenciais
```bash
# Copiar arquivo de exemplo
cp server/.env.example server/.env

# Editar com suas credenciais
nano server/.env
```

### 3. Regras do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /eventos/{eventId} {
      allow read, write: if true;
    }
    match /fotos/{photoId} {
      allow read, write: if true;
    }
  }
}
```

### 4. Regras do Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /eventos/{token}/{filename} {
      allow read, write: if true;
    }
  }
}
```

## 🚀 Deploy

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variáveis de ambiente no dashboard
```

### Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

## 📋 Checklist de Implementação

### ✅ Funcionalidades Implementadas
- [x] Sistema de tokens únicos
- [x] Integração Firebase Storage
- [x] Páginas públicas `/memoria/{token}`
- [x] Admin panel completo
- [x] Sistema de temas
- [x] QR Codes estilizados
- [x] Rate limiting
- [x] Validações de segurança
- [x] API RESTful completa
- [x] Upload seguro de fotos
- [x] Aprovação/moderação de fotos
- [x] Estatísticas em tempo real
- [x] Design responsivo
- [x] Configuração Vercel/Netlify

### 🔄 Próximas Melhorias
- [ ] Autenticação de admin
- [ ] Notificações push
- [ ] Backup automático
- [ ] Analytics avançado
- [ ] Compressão de imagens
- [ ] CDN para assets
- [ ] Testes automatizados
- [ ] Monitoramento de performance

## 🐛 Troubleshooting

### Problema: Token não encontrado
**Solução**: Verificar se o evento está ativo e o token é válido

### Problema: Upload falha
**Solução**: Verificar configuração Firebase e rate limits

### Problema: QR Code não gera
**Solução**: Verificar se a biblioteca QRCode.js está carregada

### Problema: Página /memoria não carrega
**Solução**: Verificar configuração de rewrites no vercel.json

## 📞 Suporte

Para suporte técnico ou dúvidas sobre implementação:
- 📧 Email: dev@eternize.com.br
- 📱 WhatsApp: (31) 99999-9999
- 🌐 Documentação: https://docs.eternize.com.br

---

**Eternize v3** - Sistema completo de QR Codes com tokens únicos e Firebase integration.
Desenvolvido com ❤️ pela equipe Eternize.