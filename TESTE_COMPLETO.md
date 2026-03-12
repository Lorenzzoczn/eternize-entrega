# 🧪 ETERNIZE V3 - GUIA DE TESTES COMPLETO

## 📋 Checklist de Testes

Use este guia para testar todas as funcionalidades do Eternize v3 antes de colocar em produção.

---

## ⚙️ PREPARAÇÃO

### 1. Ambiente Local

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Verificar se está rodando
# Deve mostrar: "Server running on port 3000"
```

### 2. Acessar Aplicação

```
http://localhost:3000
```

✅ **Verificar**: Landing page carrega corretamente

---

## 🎯 TESTE 1: CRIAR EVENTO

### Passo a Passo

1. **Acessar página de criação**
   ```
   http://localhost:3000/create.html
   ```

2. **Preencher formulário**
   - Nome: "Teste Casamento"
   - Data: Hoje
   - Descrição: "Evento de teste"
   - Anfitriões: "Ana & Lucas"
   - Tema: Neutro

3. **Clicar em "Criar Evento"**

4. **Verificar resposta**
   - ✅ Token gerado (12 caracteres)
   - ✅ URL do evento exibida
   - ✅ QR Code gerado
   - ✅ Botão "Criar Convite" aparece

5. **Copiar token para próximos testes**
   ```
   Exemplo: abc123xyz456
   ```

### ✅ Resultado Esperado
- Evento criado com sucesso
- Token único gerado
- QR Code visível
- URLs funcionais

---

## 📱 TESTE 2: PÁGINA DO EVENTO

### Passo a Passo

1. **Acessar página do evento**
   ```
   http://localhost:3000/evento/{token}
   ```
   Substituir `{token}` pelo token gerado

2. **Verificar elementos**
   - ✅ Hero com nome do evento
   - ✅ Data formatada corretamente
   - ✅ Descrição exibida
   - ✅ Botões de upload visíveis
   - ✅ Galeria (vazia inicialmente)

3. **Testar responsividade**
   - ✅ Desktop (1920px)
   - ✅ Tablet (768px)
   - ✅ Mobile (375px)

### ✅ Resultado Esperado
- Página carrega corretamente
- Todos os elementos visíveis
- Responsivo em todos os tamanhos

---

## 📸 TESTE 3: UPLOAD DE FOTOS

### Teste 3.1: Upload da Galeria

1. **Clicar em "Escolher da Galeria"**

2. **Selecionar 1 foto**
   - Tamanho: < 10MB
   - Tipo: JPG, PNG, ou WEBP

3. **Verificar preview**
   - ✅ Foto aparece no preview
   - ✅ Botão "Remover" funciona

4. **Preencher campos**
   - Nome: "João Silva"
   - Mensagem: "Momento especial!"

5. **Clicar em "Enviar Fotos"**

6. **Verificar progresso**
   - ✅ Barra de progresso aparece
   - ✅ Progresso atualiza
   - ✅ Mensagem de sucesso

### Teste 3.2: Upload Múltiplo

1. **Clicar em "Escolher da Galeria"**

2. **Selecionar 3 fotos**

3. **Verificar preview**
   - ✅ 3 fotos no preview
   - ✅ Cada uma com botão remover

4. **Enviar todas**

5. **Verificar**
   - ✅ Todas enviadas
   - ✅ Progresso correto (1/3, 2/3, 3/3)

### Teste 3.3: Upload da Câmera (Mobile)

1. **Em dispositivo mobile**

2. **Clicar em "Tirar Foto"**

3. **Tirar foto**

4. **Enviar**

5. **Verificar**
   - ✅ Foto capturada
   - ✅ Upload funciona

### ✅ Resultado Esperado
- Upload funciona perfeitamente
- Preview correto
- Progresso visível
- Mensagem de sucesso

---

## 🖼️ TESTE 4: GALERIA

### Passo a Passo

1. **Recarregar página do evento**

2. **Verificar galeria**
   - ⚠️ Fotos NÃO aparecem (precisam aprovação)

3. **Ir para dashboard**
   ```
   http://localhost:3000/dashboard.html
   ```

4. **Aprovar fotos**
   - Clicar em "Aprovar" em cada foto

5. **Voltar para página do evento**

6. **Verificar galeria**
   - ✅ Fotos aparecem
   - ✅ Layout masonry
   - ✅ Lazy loading funciona

7. **Clicar em uma foto**
   - ✅ Lightbox abre
   - ✅ Foto ampliada
   - ✅ Informações exibidas

8. **Testar navegação**
   - ✅ Seta direita: próxima foto
   - ✅ Seta esquerda: foto anterior
   - ✅ ESC: fechar lightbox
   - ✅ X: fechar lightbox

### ✅ Resultado Esperado
- Galeria funciona perfeitamente
- Lightbox responsivo
- Navegação fluida

---

## 🎨 TESTE 5: CRIAR CONVITE

### Passo a Passo

1. **Acessar criador de convites**
   ```
   http://localhost:3000/convite.html?token={token}
   ```

2. **Verificar carregamento**
   - ✅ Dados do evento preenchidos
   - ✅ Preview aparece
   - ✅ Preset 1 selecionado

3. **Testar cada preset**
   - Clicar em cada um dos 10 presets
   - ✅ Preview atualiza instantaneamente
   - ✅ Layout muda corretamente

4. **Personalizar**
   - Editar nome: "Meu Evento Especial"
   - Editar data
   - Editar mensagem
   - Mudar cor principal
   - Mudar cor secundária
   - ✅ Preview atualiza em tempo real

5. **Upload de foto**
   - Adicionar foto do evento
   - ✅ Preview mostra foto

6. **Testar zoom**
   - Clicar em "+"
   - ✅ Zoom aumenta (até 150%)
   - Clicar em "-"
   - ✅ Zoom diminui (até 50%)

7. **Mudar tamanho**
   - Selecionar A5
   - ✅ Convite muda tamanho
   - Selecionar A6
   - ✅ Convite muda tamanho
   - Selecionar Quadrado
   - ✅ Convite muda tamanho

### ✅ Resultado Esperado
- Todos os presets funcionam
- Personalização em tempo real
- Zoom funciona
- Tamanhos corretos

---

## 📥 TESTE 6: DOWNLOAD DE CONVITES

### Teste 6.1: Download PNG

1. **Clicar em "Baixar PNG"**

2. **Verificar**
   - ✅ Loading aparece
   - ✅ Arquivo baixa
   - ✅ Nome correto: `convite-{nome}.png`

3. **Abrir arquivo**
   - ✅ Alta qualidade
   - ✅ QR Code legível
   - ✅ Textos nítidos

### Teste 6.2: Download PDF

1. **Clicar em "Baixar PDF"**

2. **Verificar**
   - ✅ Loading aparece
   - ✅ Arquivo baixa
   - ✅ Nome correto: `convite-{nome}.pdf`

3. **Abrir arquivo**
   - ✅ Tamanho correto (A5/A6/Quadrado)
   - ✅ Pronto para impressão
   - ✅ QR Code funcional

### ✅ Resultado Esperado
- Downloads funcionam
- Qualidade alta
- Prontos para impressão

---

## 🎯 TESTE 7: QR CODE

### Passo a Passo

1. **Escanear QR Code**
   - Usar app de câmera do celular
   - Apontar para QR Code no convite

2. **Verificar**
   - ✅ Redireciona para página do evento
   - ✅ URL correta
   - ✅ Página carrega

3. **Testar upload via QR Code**
   - Enviar foto pelo celular
   - ✅ Upload funciona
   - ✅ Foto aparece (após aprovação)

### ✅ Resultado Esperado
- QR Code funcional
- Redireciona corretamente
- Upload funciona via mobile

---

## 📊 TESTE 8: DASHBOARD

### Passo a Passo

1. **Acessar dashboard**
   ```
   http://localhost:3000/dashboard.html
   ```

2. **Verificar eventos**
   - ✅ Lista de eventos aparece
   - ✅ Estatísticas corretas

3. **Testar aprovação**
   - Clicar em "Aprovar"
   - ✅ Foto aprovada
   - ✅ Contador atualiza

4. **Testar rejeição**
   - Clicar em "Rejeitar"
   - ✅ Foto removida da lista

5. **Testar deleção**
   - Clicar em "Deletar"
   - ✅ Confirmação aparece
   - ✅ Foto deletada

6. **Verificar estatísticas**
   - ✅ Total de fotos
   - ✅ Fotos aprovadas
   - ✅ Fotos pendentes
   - ✅ Contribuidores

### ✅ Resultado Esperado
- Dashboard funcional
- Aprovação funciona
- Estatísticas corretas

---

## 🔒 TESTE 9: SEGURANÇA

### Teste 9.1: Rate Limiting

1. **Fazer 51 uploads seguidos**

2. **Verificar**
   - ✅ Após 50, recebe erro
   - ✅ Mensagem: "Muitos uploads"

### Teste 9.2: Validação de Arquivo

1. **Tentar upload de PDF**
   - ✅ Erro: "Apenas imagens"

2. **Tentar upload de arquivo > 10MB**
   - ✅ Erro: "Arquivo muito grande"

### Teste 9.3: Token Inválido

1. **Acessar evento com token inválido**
   ```
   http://localhost:3000/evento/tokeninvalido
   ```
   - ✅ Erro: "Evento não encontrado"

### ✅ Resultado Esperado
- Rate limiting funciona
- Validações funcionam
- Erros tratados corretamente

---

## 📱 TESTE 10: RESPONSIVIDADE

### Dispositivos para Testar

1. **Desktop (1920x1080)**
   - ✅ Layout completo
   - ✅ Sidebar visível
   - ✅ Grid 4 colunas

2. **Laptop (1366x768)**
   - ✅ Layout adaptado
   - ✅ Grid 3 colunas

3. **Tablet (768x1024)**
   - ✅ Layout mobile
   - ✅ Menu hamburger
   - ✅ Grid 2 colunas

4. **Mobile (375x667)**
   - ✅ Layout mobile
   - ✅ Botões grandes
   - ✅ Grid 1 coluna

### ✅ Resultado Esperado
- Responsivo em todos os tamanhos
- UX otimizada para cada dispositivo

---

## 🌐 TESTE 11: NAVEGADORES

### Testar em:

1. **Chrome**
   - ✅ Todas as funcionalidades

2. **Firefox**
   - ✅ Todas as funcionalidades

3. **Safari**
   - ✅ Todas as funcionalidades

4. **Edge**
   - ✅ Todas as funcionalidades

5. **Mobile Safari (iOS)**
   - ✅ Upload funciona
   - ✅ Câmera funciona

6. **Chrome Mobile (Android)**
   - ✅ Upload funciona
   - ✅ Câmera funciona

### ✅ Resultado Esperado
- Funciona em todos os navegadores
- Sem erros de compatibilidade

---

## ⚡ TESTE 12: PERFORMANCE

### Métricas para Verificar

1. **Lighthouse (Chrome DevTools)**
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90

2. **Tempo de Carregamento**
   - Landing page: < 2s
   - Página de evento: < 2s
   - Upload de foto: < 5s

3. **Tamanho de Arquivos**
   - CSS: < 100KB
   - JS: < 200KB
   - Imagens: Comprimidas

### ✅ Resultado Esperado
- Performance excelente
- Carregamento rápido
- Otimizado

---

## 📋 CHECKLIST FINAL

### Funcionalidades Básicas
- [ ] Criar evento
- [ ] Gerar QR Code
- [ ] Acessar página do evento
- [ ] Upload de foto (galeria)
- [ ] Upload de foto (câmera)
- [ ] Upload múltiplo
- [ ] Ver galeria
- [ ] Lightbox
- [ ] Aprovar foto
- [ ] Deletar foto

### Convites
- [ ] Acessar criador de convites
- [ ] Testar todos os 10 presets
- [ ] Personalizar cores
- [ ] Personalizar textos
- [ ] Upload de foto
- [ ] Mudar tamanho
- [ ] Zoom
- [ ] Download PNG
- [ ] Download PDF

### Segurança
- [ ] Rate limiting funciona
- [ ] Validação de arquivos
- [ ] Token inválido tratado
- [ ] Sanitização de inputs

### Performance
- [ ] Lighthouse > 90
- [ ] Carregamento < 2s
- [ ] Upload < 5s

### Responsividade
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

### Navegadores
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile

---

## 🎉 CONCLUSÃO

Se todos os testes passaram, o **Eternize v3** está pronto para produção!

### Próximos Passos

1. [ ] Fazer deploy na Hostinger
2. [ ] Testar em produção
3. [ ] Criar evento real
4. [ ] Compartilhar com amigos
5. [ ] Começar a eternizar momentos! ✨

---

*Guia de Testes - Eternize v3*
