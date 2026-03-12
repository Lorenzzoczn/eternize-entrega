# ⚡ ETERNIZE V3 - INÍCIO RÁPIDO

## 🚀 Começar em 5 Minutos

### 1️⃣ Instalar (2 minutos)

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/eternize-v3.git
cd eternize-v3

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env
```

### 2️⃣ Iniciar (1 minuto)

```bash
# Inicie o servidor
npm start
```

### 3️⃣ Acessar (30 segundos)

Abra no navegador:
```
http://localhost:3000
```

### 4️⃣ Testar (1 minuto 30 segundos)

1. Clique em **"Criar Minha Página"**
2. Preencha:
   - Nome: "Meu Teste"
   - Data: Hoje
   - Tema: Neutro
3. Clique em **"Criar Evento"**
4. Copie o link gerado
5. Abra em outra aba
6. Teste o upload de uma foto

✅ **Pronto! Eternize funcionando!**

---

## 📱 Fluxo Completo

### Para o Organizador

```
1. Criar Evento
   ↓
2. Gerar QR Code
   ↓
3. Criar Convite Personalizado
   ↓
4. Imprimir Convite
   ↓
5. Colocar nas Mesas
   ↓
6. Aprovar Fotos no Dashboard
   ↓
7. Baixar Todas as Fotos
```

### Para os Convidados

```
1. Escanear QR Code
   ↓
2. Abrir Página do Evento
   ↓
3. Tirar Foto ou Escolher da Galeria
   ↓
4. Adicionar Mensagem (opcional)
   ↓
5. Enviar
   ↓
6. Ver Foto na Galeria (após aprovação)
```

---

## 🎨 Criar Convite com QR Code

### Passo a Passo

1. **Criar Evento**
   ```
   http://localhost:3000/create.html
   ```

2. **Copiar Token do Evento**
   ```
   Exemplo: abc123xyz456
   ```

3. **Acessar Criador de Convites**
   ```
   http://localhost:3000/convite.html?token=abc123xyz456
   ```

4. **Personalizar**
   - Escolher preset (1-10)
   - Editar nome e data
   - Adicionar mensagem
   - Upload de foto (opcional)
   - Mudar cores
   - Escolher tamanho

5. **Baixar**
   - PNG para digital
   - PDF para impressão

6. **Imprimir**
   - Papel fotográfico recomendado
   - Tamanho A5 ou A6
   - Colocar nas mesas do evento

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Iniciar com auto-reload
npm run dev

# Verificar erros
npm test

# Limpar cache
rm -rf node_modules
npm install
```

### Produção
```bash
# Iniciar em produção
NODE_ENV=production npm start

# Rodar em background
nohup npm start > output.log 2>&1 &

# Ver logs
tail -f output.log

# Parar servidor
pkill -f "node server.js"
```

---

## 📂 Estrutura Rápida

```
eternize-v3/
├── server.js          # ← Servidor principal
├── package.json       # ← Dependências
├── .env              # ← Configurações
│
├── index.html        # ← Landing page
├── create.html       # ← Criar evento
├── evento.html       # ← Página pública
├── convite.html      # ← Criar convite
├── dashboard.html    # ← Dashboard admin
│
├── css/              # ← Estilos
├── js/               # ← Scripts
├── uploads/          # ← Fotos (criado automaticamente)
└── data/             # ← Banco JSON (criado automaticamente)
```

---

## 🌐 URLs Importantes

### Desenvolvimento
```
Landing Page:    http://localhost:3000
Criar Evento:    http://localhost:3000/create.html
Página Evento:   http://localhost:3000/evento/{token}
Criar Convite:   http://localhost:3000/convite.html?token={token}
Dashboard:       http://localhost:3000/dashboard.html
```

### Produção
```
Landing Page:    https://seudominio.com
Criar Evento:    https://seudominio.com/create.html
Página Evento:   https://seudominio.com/evento/{token}
Criar Convite:   https://seudominio.com/convite.html?token={token}
Dashboard:       https://seudominio.com/dashboard.html
```

---

## 🎯 Casos de Uso Rápidos

### Caso 1: Casamento
```
1. Criar evento "Casamento Ana & Lucas"
2. Tema: Princesas (rosa)
3. Criar convite preset #2 (Casamento Clássico)
4. Baixar PDF
5. Imprimir 50 cópias
6. Colocar nas mesas
7. Convidados escaneiam e enviam fotos
8. Baixar todas as fotos no dia seguinte
```

### Caso 2: Aniversário
```
1. Criar evento "15 Anos Maria"
2. Tema: Toy Story (dourado)
3. Criar convite preset #6 (Festa)
4. Compartilhar link no WhatsApp
5. Amigos enviam fotos durante a festa
6. Ver galeria em tempo real
```

### Caso 3: Evento Corporativo
```
1. Criar evento "Confraternização Empresa"
2. Tema: Neutro (elegante)
3. Criar convite preset #9 (Premium)
4. QR Code nos crachás
5. Funcionários compartilham momentos
6. RH aprova fotos
7. Usar para comunicação interna
```

---

## 🐛 Problemas Comuns

### Porta já em uso
```bash
# Mudar porta no .env
PORT=3001
```

### Dependências não instalam
```bash
# Limpar cache do npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Fotos não aparecem
```bash
# Criar diretórios manualmente
mkdir -p uploads/eventos
mkdir -p data
chmod -R 777 uploads data
```

### QR Code não gera
```
# Verificar se está carregando a biblioteca
Abrir console do navegador (F12)
Verificar erros
```

---

## 📊 Checklist de Teste

Antes de usar em produção, teste:

- [ ] Criar evento
- [ ] Gerar QR Code
- [ ] Acessar página do evento
- [ ] Upload de foto (câmera)
- [ ] Upload de foto (galeria)
- [ ] Upload múltiplo
- [ ] Ver foto na galeria
- [ ] Criar convite
- [ ] Personalizar convite
- [ ] Baixar PNG
- [ ] Baixar PDF
- [ ] Aprovar foto no dashboard
- [ ] Deletar foto
- [ ] Ver estatísticas

---

## 🚀 Deploy Rápido

### Hostinger (Recomendado)

```bash
# 1. Fazer upload via FTP
# 2. No hPanel:
#    - Node.js → Criar Aplicação
#    - Arquivo: server.js
#    - Porta: 3000
# 3. Instalar dependências
# 4. Iniciar aplicação
# 5. Configurar domínio
```

Guia completo: [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md)

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Railway

```bash
# Conectar repositório GitHub
# Railway detecta automaticamente
# Deploy automático
```

---

## 💡 Dicas Rápidas

### Performance
- Use thumbnails para galeria
- Ative compressão de imagens
- Configure cache de assets
- Use CDN para assets estáticos

### Segurança
- Sempre use HTTPS em produção
- Configure rate limiting
- Valide todos os inputs
- Faça backup regular

### UX
- Teste em mobile primeiro
- Otimize para conexões lentas
- Adicione loading states
- Mostre feedback visual

---

## 📞 Ajuda Rápida

### Documentação
- **README Completo**: [README_FINAL_V3.md](README_FINAL_V3.md)
- **Deploy Hostinger**: [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md)

### Suporte
- **Email**: dev@eternize.com.br
- **WhatsApp**: (31) 99999-9999

---

## ✅ Próximos Passos

Depois de testar localmente:

1. [ ] Fazer deploy na Hostinger
2. [ ] Configurar domínio próprio
3. [ ] Ativar SSL/HTTPS
4. [ ] Criar primeiro evento real
5. [ ] Testar com amigos/família
6. [ ] Compartilhar e usar! 🎉

---

*Eternize v3 - Eternizando momentos em 5 minutos! ⚡*
