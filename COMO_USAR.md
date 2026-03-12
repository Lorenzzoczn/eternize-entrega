# 🚀 Como Usar o Eternize - Guia Completo

## ⚡ Início Rápido (2 minutos)

### 1. Abrir o Projeto

```bash
# Opção A: Python
python -m http.server 8000

# Opção B: Node.js
npx http-server -p 8000

# Opção C: PHP
php -S localhost:8000
```

Acesse: `http://localhost:8000`

### 2. Primeira Vez

1. Clique em **"Criar Conta"** no canto superior direito
2. Preencha seus dados
3. Clique em **"Criar Conta"**
4. Você será redirecionado para o dashboard

## 📋 Guia Passo a Passo

### Para Organizadores

#### Passo 1: Criar Conta
1. Acesse `index.html`
2. Clique em **"Criar Conta"**
3. Preencha:
   - Nome completo
   - Email
   - Telefone (opcional)
   - Senha (mínimo 6 caracteres)
4. Aceite os termos
5. Clique em **"Criar Conta"**

#### Passo 2: Criar Primeiro Evento
1. No dashboard, clique em **"+ Criar Novo Evento"**
2. Preencha:
   - **Nome**: Ex: "Casamento Maria & João"
   - **Data**: Selecione a data do evento
   - **Tipo**: Escolha o tipo (Casamento, Aniversário, etc.)
   - **Descrição**: Opcional
   - **Tema**: Escolha uma cor (Rosa, Azul, Menta ou Ouro)
3. Clique em **"Criar Evento"**

#### Passo 3: Compartilhar com Convidados
1. Clique no evento criado
2. Você verá:
   - **QR Code** gerado automaticamente
   - **Link de compartilhamento**
3. Opções:
   - **Baixar QR Code**: Clique em "Baixar QR Code" e imprima
   - **Copiar Link**: Clique em "Copiar" e compartilhe via WhatsApp/Email

#### Passo 4: Gerenciar Fotos
1. Conforme convidados enviam fotos, elas aparecem em tempo real
2. Você pode:
   - **Ver todas**: Tab "Todas"
   - **Ver pendentes**: Tab "Pendentes"
   - **Ver aprovadas**: Tab "Aprovadas"
3. Para cada foto:
   - **Aprovar**: Clique no ✓ verde
   - **Rejeitar**: Clique no ✕ vermelho

#### Passo 5: Baixar Fotos
1. Clique em **"Baixar Todas"**
2. Todas as fotos aprovadas serão baixadas

### Para Convidados

#### Passo 1: Acessar Evento
**Opção A: QR Code**
1. Abra a câmera do celular
2. Aponte para o QR Code
3. Toque no link que aparece

**Opção B: Link Direto**
1. Clique no link compartilhado
2. Você será direcionado para a página de upload

#### Passo 2: Enviar Fotos
1. Na página de upload:
   - **Clique** na área de upload, ou
   - **Arraste** fotos para a área
2. Selecione uma ou várias fotos
3. Veja o preview das fotos
4. Clique em **"Enviar Memórias"**
5. Aguarde a confirmação
6. Pronto! Suas fotos foram enviadas

#### Passo 3: Enviar Mais (Opcional)
1. Após enviar, clique em **"Enviar Mais Fotos"**
2. Repita o processo

## 🎯 Funcionalidades Avançadas

### Criar Página Personalizada

1. Acesse `create.html`
2. Preencha:
   - Título da página
   - Descrição
   - Data do evento
3. Adicione fotos:
   - Clique ou arraste fotos
   - Veja preview
   - Clique em "Salvar Fotos"
4. Clique em **"Finalizar e Gerar Link"**
5. Compartilhe o link gerado

### Testar Demo

1. Acesse `demo.html`
2. Explore as funcionalidades:
   - Criar evento
   - Upload de fotos
   - Visualizar galeria
3. Sem necessidade de cadastro

### Visualizar Página Pública

1. Acesse `view.html?id=SEU_ID`
2. Veja a página como os convidados veem
3. Galeria de fotos públicas

## 💡 Dicas e Truques

### Para Organizadores

1. **Imprima o QR Code**
   - Baixe em alta resolução
   - Imprima em tamanho A4
   - Coloque em local visível no evento

2. **Compartilhe Antecipadamente**
   - Envie o link antes do evento
   - Peça para salvarem nos favoritos
   - Facilita o acesso durante o evento

3. **Aprove Rapidamente**
   - Verifique fotos durante o evento
   - Aprove as melhores em tempo real
   - Rejeite fotos inadequadas

4. **Baixe Backup**
   - Baixe todas as fotos após o evento
   - Guarde em local seguro
   - Não dependa apenas do navegador

### Para Convidados

1. **Tire Fotos Horizontais**
   - Melhor visualização
   - Mais profissional
   - Ocupa menos espaço

2. **Envie Durante o Evento**
   - Fotos mais espontâneas
   - Captura momentos únicos
   - Organizador pode aprovar na hora

3. **Respeite a Privacidade**
   - Não tire fotos constrangedoras
   - Peça permissão quando necessário
   - Seja respeitoso

## 🔧 Configurações

### Alterar Tema do Evento

1. No dashboard, clique no evento
2. (Funcionalidade de edição em desenvolvimento)
3. Por enquanto, crie novo evento com tema diferente

### Alterar Dados da Conta

1. (Funcionalidade em desenvolvimento)
2. Por enquanto, faça logout e crie nova conta

### Excluir Evento

1. (Funcionalidade em desenvolvimento)
2. Por enquanto, ignore eventos antigos

## 🐛 Problemas Comuns

### "Não consigo fazer login"
**Solução**: 
- Verifique se criou uma conta primeiro
- Tente criar nova conta
- Limpe o cache do navegador

### "QR Code não aparece"
**Solução**:
- Verifique conexão com internet
- Recarregue a página
- Tente outro navegador

### "Fotos não enviam"
**Solução**:
- Verifique tamanho (máx 10MB)
- Verifique formato (JPG, PNG)
- Tente uma foto por vez

### "Página em branco"
**Solução**:
- Use servidor local (não abra HTML diretamente)
- Verifique console (F12)
- Tente outro navegador

## 📱 Uso no Celular

### Para Organizadores

1. **Acesse pelo navegador**
   - Chrome ou Safari
   - Interface responsiva
   - Todas as funcionalidades

2. **Gerencie em qualquer lugar**
   - Aprove fotos durante o evento
   - Veja estatísticas em tempo real
   - Baixe fotos no celular

### Para Convidados

1. **Escaneie QR Code**
   - Abra câmera nativa
   - Aponte para o código
   - Toque no link

2. **Envie Fotos**
   - Interface otimizada para mobile
   - Upload rápido
   - Feedback visual

## 🎉 Casos de Uso

### Casamento
1. Crie evento "Casamento [Nomes]"
2. Tema: Rosa ou Ouro
3. Imprima QR Code em tamanho grande
4. Coloque na entrada e nas mesas
5. Peça para convidados enviarem fotos
6. Aprove durante a festa
7. Baixe todas no final

### Aniversário
1. Crie evento "Aniversário [Nome]"
2. Tema: Azul ou Menta
3. Compartilhe link no convite
4. Peça fotos durante a festa
5. Crie álbum de memórias

### Formatura
1. Crie evento "Formatura [Turma]"
2. Tema: Ouro
3. QR Code no convite
4. Fotos da cerimônia e festa
5. Álbum da turma

### Evento Corporativo
1. Crie evento "Evento [Empresa]"
2. Tema: Azul
3. QR Code na entrada
4. Fotos profissionais e descontraídas
5. Relatório visual do evento

## 📊 Estatísticas

No dashboard você vê:
- **Total de Fotos**: Todas as fotos recebidas
- **Eventos Ativos**: Quantos eventos você tem
- **Contribuidores**: Quantas pessoas enviaram fotos
- **Armazenamento**: Espaço usado

## 🔐 Privacidade

### Seus Dados
- Armazenados apenas no seu navegador
- Não enviados para servidores
- Você tem controle total

### Fotos dos Convidados
- Você aprova antes de publicar
- Pode rejeitar fotos inadequadas
- Controle total sobre o conteúdo

## 🚀 Próximos Passos

Após dominar o básico:
1. ✅ Teste todas as funcionalidades
2. ✅ Crie eventos de teste
3. ✅ Compartilhe com amigos
4. ✅ Use em evento real
5. ✅ Dê feedback
6. ✅ Compartilhe o Eternize

## 📞 Precisa de Ajuda?

- 📧 Email: suporte@eternize.com.br
- 💬 WhatsApp: (31) 99999-9999
- 📖 Documentação: README_FINAL.md

---

**Divirta-se eternizando momentos especiais!** ✨