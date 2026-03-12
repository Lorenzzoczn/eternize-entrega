# 🔥 Setup Firebase - Eternize v3

## Guia Completo de Configuração Firebase

Este guia te ajudará a configurar o Firebase para o sistema de tokens do Eternize v3.

## 📋 Pré-requisitos

- Conta Google
- Node.js 16+ instalado
- Projeto Eternize v3 clonado

## 🚀 Passo 1: Criar Projeto Firebase

### 1.1 Acessar Firebase Console
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar um projeto"
3. Nome do projeto: `eternize-v3-production`
4. Ative Google Analytics (opcional)
5. Clique em "Criar projeto"

### 1.2 Configurar Projeto
1. Aguarde a criação do projeto
2. Clique em "Continuar"
3. Você será redirecionado para o dashboard

## 🗄️ Passo 2: Configurar Firestore Database

### 2.1 Criar Database
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Iniciar no modo de teste"
4. Escolha a localização (recomendado: `southamerica-east1`)
5. Clique em "Concluído"

### 2.2 Configurar Regras de Segurança
1. Vá para a aba "Regras"
2. Substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Eventos - leitura pública, escrita restrita
    match /eventos/{eventId} {
      allow read: if true;
      allow write: if request.auth != null || 
                      (request.method == 'create' && 
                       resource == null);
    }
    
    // Fotos - leitura pública para aprovadas, escrita restrita
    match /fotos/{photoId} {
      allow read: if true;
      allow create: if request.resource.data.aprovado == false;
      allow update, delete: if request.auth != null;
    }
  }
}
```

3. Clique em "Publicar"

### 2.3 Criar Índices
1. Vá para a aba "Índices"
2. Crie os seguintes índices compostos:

**Índice 1: Eventos por token**
- Collection: `eventos`
- Campos: `token` (Ascending), `ativo` (Ascending)

**Índice 2: Fotos por token**
- Collection: `fotos`
- Campos: `token` (Ascending), `criado_em` (Descending)

**Índice 3: Fotos por token e aprovação**
- Collection: `fotos`
- Campos: `token` (Ascending), `aprovado` (Ascending), `criado_em` (Descending)

## 📁 Passo 3: Configurar Storage

### 3.1 Ativar Storage
1. No menu lateral, clique em "Storage"
2. Clique em "Começar"
3. Selecione "Iniciar no modo de teste"
4. Escolha a localização (mesma do Firestore)
5. Clique em "Concluído"

### 3.2 Configurar Regras de Storage
1. Vá para a aba "Regras"
2. Substitua o conteúdo por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Fotos de eventos
    match /eventos/{token}/{filename} {
      // Permitir leitura pública
      allow read: if true;
      
      // Permitir upload com validações
      allow write: if request.resource.size < 10 * 1024 * 1024 && // Max 10MB
                      request.resource.contentType.matches('image/.*') && // Apenas imagens
                      token.matches('[a-z0-9]{12}'); // Token válido
    }
  }
}
```

3. Clique em "Publicar"

## 🔑 Passo 4: Configurar Autenticação (Opcional)

### 4.1 Ativar Authentication
1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Vá para a aba "Sign-in method"

### 4.2 Configurar Provedores
1. Ative "Email/senha"
2. Ative "Google" (opcional)
3. Configure domínios autorizados

## 🛠️ Passo 5: Obter Credenciais

### 5.1 Configuração Web
1. No dashboard, clique no ícone de engrenagem ⚙️
2. Clique em "Configurações do projeto"
3. Vá para a aba "Geral"
4. Role até "Seus aplicativos"
5. Clique em "Adicionar aplicativo" → Web
6. Nome do app: `eternize-v3-web`
7. Marque "Configurar Firebase Hosting"
8. Clique em "Registrar aplicativo"

### 5.2 Copiar Configuração
Copie a configuração que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "eternize-v3-production.firebaseapp.com",
  projectId: "eternize-v3-production",
  storageBucket: "eternize-v3-production.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345"
};
```

### 5.3 Service Account (Backend)
1. Vá para "Configurações do projeto"
2. Aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Baixe o arquivo JSON
5. Renomeie para `firebase-service-account.json`
6. Coloque na pasta `server/`

## 🔧 Passo 6: Configurar Projeto

### 6.1 Atualizar Firebase Config
Edite `js/firebase-config.js`:

```javascript
const firebaseConfig = {
  // Cole sua configuração aqui
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

### 6.2 Configurar Variáveis de Ambiente
Crie `server/.env`:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=eternize-v3-production
FIREBASE_STORAGE_BUCKET=eternize-v3-production.appspot.com
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@eternize-v3-production.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 6.3 Instalar Dependências
```bash
# Instalar dependências do servidor
cd server
npm install

# Voltar para raiz e instalar dependências do cliente
cd ..
npm install
```

## 🧪 Passo 7: Testar Configuração

### 7.1 Teste Local
```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

### 7.2 Teste de Funcionalidades
1. Acesse `http://localhost:3000`
2. Crie um evento no admin panel
3. Teste upload de foto na página pública
4. Verifique se os dados aparecem no Firebase Console

### 7.3 Verificar Firebase Console
1. **Firestore**: Verifique se as collections `eventos` e `fotos` foram criadas
2. **Storage**: Verifique se a pasta `eventos/` foi criada com as fotos
3. **Authentication**: Se configurado, verifique usuários

## 🚀 Passo 8: Deploy em Produção

### 8.1 Configurar Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### 8.2 Configurar Variáveis de Ambiente na Vercel
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá para "Settings" → "Environment Variables"
4. Adicione todas as variáveis do arquivo `.env`

### 8.3 Configurar Domínios Autorizados
1. No Firebase Console, vá para "Authentication" → "Settings"
2. Em "Domínios autorizados", adicione:
   - `seu-projeto.vercel.app`
   - `seu-dominio-customizado.com` (se tiver)

## 🔒 Passo 9: Segurança em Produção

### 9.1 Atualizar Regras do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /eventos/{eventId} {
      allow read: if true;
      allow create: if isValidEventData();
      allow update, delete: if request.auth != null;
    }
    
    match /fotos/{photoId} {
      allow read: if resource.data.aprovado == true || request.auth != null;
      allow create: if isValidPhotoUpload();
      allow update, delete: if request.auth != null;
    }
  }
  
  function isValidEventData() {
    return request.resource.data.keys().hasAll(['nome_evento', 'data_evento', 'token', 'tema']) &&
           request.resource.data.token.matches('[a-z0-9]{12}');
  }
  
  function isValidPhotoUpload() {
    return request.resource.data.keys().hasAll(['token', 'url', 'criado_em']) &&
           request.resource.data.aprovado == false &&
           request.resource.data.token.matches('[a-z0-9]{12}');
  }
}
```

### 9.2 Configurar CORS
No arquivo `server/api.js`, certifique-se de que o CORS está configurado corretamente:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://seu-projeto.vercel.app',
    'https://seu-dominio.com'
  ],
  credentials: true
}));
```

## 📊 Passo 10: Monitoramento

### 10.1 Configurar Alertas
1. No Firebase Console, vá para "Alertas"
2. Configure alertas para:
   - Uso excessivo de Storage
   - Muitas operações de leitura/escrita
   - Erros de autenticação

### 10.2 Analytics (Opcional)
1. Ative Google Analytics no projeto
2. Configure eventos customizados:
   - Criação de eventos
   - Upload de fotos
   - Aprovação de fotos

## ✅ Checklist Final

- [ ] Projeto Firebase criado
- [ ] Firestore configurado com regras
- [ ] Storage configurado com regras
- [ ] Índices criados
- [ ] Credenciais obtidas
- [ ] Arquivo de configuração atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] Teste local funcionando
- [ ] Deploy em produção realizado
- [ ] Domínios autorizados configurados
- [ ] Regras de segurança em produção
- [ ] Monitoramento configurado

## 🆘 Troubleshooting

### Erro: "Permission denied"
**Solução**: Verificar regras do Firestore/Storage

### Erro: "Invalid token"
**Solução**: Verificar formato do token (12 caracteres, a-z0-9)

### Erro: "File too large"
**Solução**: Verificar limite de 10MB nas regras

### Erro: "CORS blocked"
**Solução**: Adicionar domínio nas configurações de CORS

## 📞 Suporte

Se precisar de ajuda:
- 📧 Email: firebase@eternize.com.br
- 📱 WhatsApp: (31) 99999-9999
- 🌐 Docs: https://firebase.google.com/docs

---

**Firebase Setup Completo** ✅
Agora seu Eternize v3 está pronto para funcionar com Firebase!