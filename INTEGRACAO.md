# 🔗 Guia de Integração - Sistema de Upload e Links

## 📋 Checklist de Arquivos

Certifique-se de que todos estes arquivos estão no seu projeto:

### ✅ JavaScript (pasta `js/`)
- [x] `storage.js` - Gerenciamento IndexedDB
- [x] `gallery.js` - Sistema de galeria
- [x] `link-generator.js` - Geração de links e QR
- [x] `create.js` - Página de criação
- [x] `view.js` - Página de visualização

### ✅ HTML (raiz do projeto)
- [x] `create.html` - Criar página
- [x] `view.html` - Ver página compartilhada

### ✅ CSS (pasta `css/`)
- [x] `create.css` - Estilos da criação
- [x] `view.css` - Estilos da visualização

### ✅ Biblioteca Externa
- [x] QRCode.js (CDN já incluído nos HTMLs)

---

## 🎯 Como Integrar no Seu Site Existente

### Opção 1: Links Diretos (Recomendado)
Adicione botões no seu site que levam para `create.html`:

```html
<a href="create.html" class="btn btn-primary">
    ✨ Criar Minha Página
</a>
```

### Opção 2: Integrar na Página Atual
Se quiser integrar na mesma página, adicione no seu HTML:

```html
<!-- Adicione no <head> -->
<link rel="stylesheet" href="css/create.css">

<!-- Adicione antes do </body> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="js/storage.js"></script>
<script src="js/gallery.js"></script>
<script src="js/link-generator.js"></script>
<script src="js/create.js"></script>
```

---

## 🔧 Estrutura HTML Necessária

Para usar o sistema de galeria, seu HTML precisa ter estes elementos:

```html
<!-- Área de Upload -->
<div class="upload-area" id="uploadArea">
    <div class="upload-icon">📸</div>
    <h3>Arraste fotos aqui</h3>
    <p>ou clique para selecionar</p>
    <input type="file" id="fileInput" multiple accept="image/*" hidden>
</div>

<!-- Preview das fotos selecionadas -->
<div class="upload-preview" id="uploadPreview"></div>

<!-- Botão de upload -->
<button class="btn btn-secondary" id="uploadBtn" style="display: none;">
    Salvar Fotos
</button>

<!-- Galeria de fotos salvas -->
<div class="gallery-grid" id="galleryGrid"></div>

<!-- Contador de fotos -->
<span id="photoCount">0 fotos</span>

<!-- Botão finalizar -->
<button class="btn btn-primary" id="finishBtn">
    ✨ Finalizar e Gerar Link
</button>

<!-- Campos do formulário -->
<input type="text" id="pageTitle" placeholder="Título">
<textarea id="pageDescription" placeholder="Descrição"></textarea>
<input type="date" id="pageDate">
```

---

## 🎨 Personalização de Cores

Edite o CSS para combinar com seu site:

```css
/* Em create.css ou view.css */

/* Cor primária */
.btn-primary {
    background: linear-gradient(135deg, #SUA_COR_1 0%, #SUA_COR_2 100%);
}

/* Cor de destaque */
.photo-count {
    background: #SUA_COR;
}

/* Fundo da página */
.create-page {
    background: linear-gradient(135deg, #SUA_COR_1 0%, #SUA_COR_2 100%);
}
```

---

## 🚀 Inicialização do Sistema

O sistema inicializa automaticamente quando a página carrega. Mas você pode controlar manualmente:

```javascript
// Inicializar galeria manualmente
document.addEventListener('DOMContentLoaded', async () => {
    const pageId = storage.generateUniqueId();
    gallery = new GalleryManager(pageId);
});
```

---

## 📱 Uso Programático

### Criar Página Programaticamente

```javascript
// Criar uma página
const result = await linkGen.createPage({
    title: 'Meu Evento',
    description: 'Descrição do evento',
    date: '2024-12-31'
});

if (result.success) {
    console.log('URL:', result.url);
    console.log('ID:', result.pageId);
}
```

### Adicionar Fotos Programaticamente

```javascript
// Adicionar foto
const photoData = {
    id: storage.generateUniqueId(),
    pageId: 'ID_DA_PAGINA',
    data: 'data:image/jpeg;base64,...',
    filename: 'foto.jpg',
    uploadedAt: new Date().toISOString()
};

await storage.savePhoto(photoData);
```

### Gerar QR Code Programaticamente

```javascript
// Gerar QR Code
linkGen.generateQRCode('https://seu-site.com/view.html?id=ABC123', 'containerId');

// Baixar QR Code
linkGen.downloadQRCode('containerId', 'meu-qrcode.png');
```

---

## 🔍 Debugging

### Verificar IndexedDB
Abra o DevTools (F12) → Application → IndexedDB → EternizeDB

### Ver Dados Salvos
```javascript
// No console do navegador
await storage.init();
const page = await storage.getPage('ID_DA_PAGINA');
console.log(page);

const photos = await storage.getPhotos('ID_DA_PAGINA');
console.log(photos);
```

### Limpar Dados
```javascript
// Limpar tudo
indexedDB.deleteDatabase('EternizeDB');
```

---

## ⚡ Performance

### Otimizações Implementadas
- Upload assíncrono
- Lazy loading de imagens
- Compressão automática (Base64)
- Cache de preview

### Limites Recomendados
- Máximo 10MB por foto
- Máximo 100 fotos por página
- Resolução máxima: 4000x4000px

---

## 🌐 Deploy

### GitHub Pages
1. Faça commit de todos os arquivos
2. Ative GitHub Pages nas configurações
3. Acesse: `https://seu-usuario.github.io/seu-repo/create.html`

### Netlify/Vercel
1. Conecte seu repositório
2. Deploy automático
3. Funciona imediatamente

### Servidor Próprio
1. Faça upload de todos os arquivos
2. Certifique-se que o servidor serve arquivos estáticos
3. Acesse via HTTP/HTTPS

---

## 🐛 Problemas Comuns

### QR Code não aparece
- Verifique se a biblioteca está carregada: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`
- Verifique o console por erros

### Fotos não salvam
- Verifique se IndexedDB está habilitado no navegador
- Teste em modo normal (não anônimo)
- Verifique o tamanho das imagens

### Link não funciona
- Certifique-se que `view.html` está no mesmo diretório
- Verifique se o ID está na URL
- Teste em outro navegador

---

## 📞 Suporte Técnico

### Logs Úteis
```javascript
// Ativar logs detalhados
localStorage.setItem('debug', 'true');

// Ver erros
window.addEventListener('error', (e) => {
    console.error('Erro:', e.message);
});
```

---

## ✅ Tudo Pronto!

Seu sistema está configurado e pronto para uso. Teste acessando `create.html` no navegador!
