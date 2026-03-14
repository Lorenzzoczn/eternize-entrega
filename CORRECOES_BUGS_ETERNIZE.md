# Correção de bugs – Eternize (eternizeapp.com)

Documento de entrega das correções dos **Bug 1** (QR Code no download do cartão) e **Bug 2** (exibição de vídeos no dashboard e na galeria pública).

---

## 1. Resumo do que causava cada bug

### BUG 1 — QR Code não aparecia ao baixar o cartão

**Causa raiz:**  
O QR Code era gerado pela biblioteca **QRCode.js** como `<canvas>` (ou em alguns browsers como `<table>`). Na hora do download, o **html2canvas** capturava o DOM do cartão, mas:

1. **Timing:** O canvas/QR pode não estar totalmente desenhado no momento da captura (renderização assíncrona da lib).
2. **Captura de canvas:** Em certos contextos o html2canvas não desenha bem elementos `<canvas>` (cross-origin, tainted canvas ou ordem de pintura).
3. **Ordem de execução:** A imagem substituta do QR era colocada no card, mas o **download era disparado antes da imagem estar carregada e pintada** na tela, então o snapshot saía com o espaço do QR em branco.

**Solução aplicada:**  
- Gerar o QR em um container temporário fora da tela.  
- Obter o QR como **data URL (PNG)** a partir do canvas (ou da `<img>` que a própria lib cria).  
- **Substituir** o conteúdo do `#qrcode` do cartão por uma única `<img src="data:...">` antes de chamar o html2canvas.  
- **Só prosseguir** quando a imagem tiver carregado (`img.onload` ou `img.complete`) e depois de **aguardar a pintura** (dois `requestAnimationFrame` + 500 ms).  
- Só então chamar html2canvas e gerar PNG/PDF; em seguida restaurar o QR interativo no cartão.

Assim o arquivo baixado passa a conter o QR como imagem já rasterizada, visível e escaneável.

---

### BUG 2 — Vídeos enviados não eram exibidos como as fotos

**Causa raiz:**  
O sistema foi pensado só para fotos: upload, armazenamento e listagem tratavam apenas imagens. Não havia:

- Aceite de `video/*` no upload.  
- Campo que diferenciasse **imagem** de **vídeo** (ex.: `mediaType`).  
- Renderização de `<video>` na galeria do dashboard e na página acessada pelo QR Code.  
- Suporte a vídeo no lightbox (reprodução com controles).

**Solução aplicada (já implementada em alterações anteriores, mantida e validada):**

- **Backend:** Aceitar `image/*` e `video/*` no Multer; gravar vídeos em disco (extensão original); salvar em `data/fotos.json` com `mediaType: 'image' | 'video'` e `url` (e `thumbnail` só para imagens).  
- **GET /api/photos/:token:** Devolver todos os itens (fotos e vídeos) com os mesmos metadados; filtro por `approved` continua igual.  
- **Página do evento (QR Code):** Inputs aceitam foto e vídeo; galeria usa `<img>` para imagem e `<video>` para vídeo; lightbox mostra `<video controls>` para vídeo.  
- **Dashboard:** Lista de “Fotos Recebidas” exibe thumbnail do vídeo (primeiro frame) ou placeholder; vídeos entram nas contagens (Todas/Pendentes/Aprovadas) e nas ações (aprovar/excluir).

Com isso, vídeos passam a aparecer no dashboard e na galeria pública da mesma forma que as fotos, com mídia mista.

---

## 2. Arquivos alterados

### Bug 1 (QR Code no download)

| Arquivo | Alteração |
|--------|-----------|
| `js/convite-generator.js` | Refatoração de `ensureQRCodeAsImageForCapture()`: geração do QR em `_generateQRDataUrl()`, injeção de `<img>` com data URL no card, **await** da carga da imagem (`onload`/`complete`/timeout) antes de resolver a Promise. Novo método `_waitForPaint()` (2× `requestAnimationFrame` + 500 ms) para garantir pintura antes do html2canvas. Uso de `_waitForPaint()` em `downloadPNG()` e `downloadPDF()` após `ensureQRCodeAsImageForCapture()` e antes de `html2canvas()`. |

### Bug 2 (Vídeos)

Nenhuma alteração adicional nesta entrega. O suporte a vídeos já estava implementado nos arquivos abaixo; a entrega **revisa e documenta** esse comportamento:

- `server.js` — Upload de foto/vídeo, `mediaType`, gravação de vídeo em disco, GET /api/photos sem filtrar por tipo.  
- `js/evento-page.js` — Seleção de foto/vídeo, preview, upload, galeria com `<img>`/`<video>`, lightbox com vídeo.  
- `js/dashboard.js` — Listagem de mídias com thumbnail de vídeo ou placeholder.  
- `evento.html` — Inputs e lightbox com `<video>`.  
- `css/evento.css`, `css/dashboard.css` — Estilos para vídeo na galeria e no lightbox.

---

## 3. O que foi implementado

### Bug 1 — Download do cartão com QR Code

1. **`ensureQRCodeAsImageForCapture()`**  
   - Obtém o container `#qrcode` **dentro** do card.  
   - Chama `_generateQRDataUrl(eventUrl, size)` para gerar o QR em um div temporário e obter data URL PNG.  
   - Substitui o conteúdo de `#qrcode` por uma única `<img>` com `src = dataUrl`.  
   - Só resolve a Promise quando a imagem estiver carregada (`img.onload` ou `img.complete`), com timeout de 1,5 s.  
   - Retorna uma função que restaura o QR interativo no cartão após a captura.

2. **`_generateQRDataUrl(eventUrl, size)`**  
   - Cria um div temporário fora da tela, gera o QR com QRCode.js, tenta obter data URL do `<canvas>` ou da `<img>` gerada pela lib.  
   - Usa timeouts (300 ms + 500 ms de fallback) para dar tempo da lib desenhar.  
   - Remove o div e retorna a data URL ou `null`.

3. **`_waitForPaint()`**  
   - Espera dois frames de animação e mais 500 ms para o navegador pintar a `<img>` do QR antes do html2canvas.

4. **Fluxo de download (PNG e PDF)**  
   - `await ensureQRCodeAsImageForCapture()` → QR vira `<img>` e a Promise só resolve quando a imagem estiver carregada.  
   - `await _waitForPaint()` → garante que o QR está visível na tela.  
   - Scale do card em 1, chamada a `html2canvas(card, { scale: 3, backgroundColor: '#ffffff', ... })`.  
   - Restaura o QR no card; em seguida gera o blob (PNG) ou o PDF.

Resultado: o QR Code passa a aparecer no arquivo final (PNG/PDF), nítido e escaneável.

### Bug 2 — Vídeos no dashboard e na galeria do QR Code

Implementação já existente, conferida e documentada:

- **Upload:** Backend aceita vídeo; grava em `uploads/eventos/<token>/` com extensão original; persiste em `data/fotos.json` com `mediaType: 'video'`.  
- **API:** `GET /api/photos/:token` retorna fotos e vídeos; filtro `approved=true` mantido.  
- **Galeria pública (página do QR):** `loadPhotos()` busca a lista; `renderGallery()` usa `mediaType` ou extensão da URL para decidir entre `<img>` e `<video>`; lightbox abre `<video controls>` para vídeo.  
- **Dashboard:** Lista “Fotos Recebidas” mostra vídeos com `<video preload="metadata">` como thumbnail e badge “Vídeo”; aprovar/excluir funcionam para vídeos.

Suporte a galeria somente fotos, somente vídeos ou mídia mista está mantido.

---

## 4. Como testar manualmente

### Bug 1 — QR Code no download do cartão

1. Acesse a tela de convite (ex.: `https://eternizeapp.com/convite.html` ou com `?token=...` se aplicável).  
2. Preencha nome do evento, data, mensagem e escolha um preset.  
3. Confirme que o **QR Code aparece no preview** do cartão na tela.  
4. Clique em **“Baixar PNG”**:  
   - Deve abrir o download de um PNG.  
   - Abra o PNG: o **QR Code deve estar visível** no espaço reservado (não em branco).  
   - Escaneie o QR com o celular: deve abrir a URL do evento (ex.: `https://eternizeapp.com/memoria/<token>`).  
5. Repita com **“Baixar PDF”**: o PDF deve conter o mesmo QR visível e escaneável.  
6. Teste em outro navegador ou em modo anônimo para evitar cache.

### Bug 2 — Vídeos no dashboard e na galeria do QR Code

1. **Upload de vídeo**  
   - Abra a página do evento pelo link do QR (ex.: `https://eternizeapp.com/memoria/<token>`).  
   - Use “Galeria” ou “Gravar Vídeo” e envie um vídeo (ex.: MP4, até 100 MB).  
   - Deve aparecer “Enviado com sucesso!”.

2. **Galeria pública (mesma página)**  
   - Role até “Galeria de Momentos”.  
   - O vídeo deve aparecer (thumbnail ou primeiro frame) com ícone de play.  
   - Clique no vídeo: o lightbox deve abrir com `<video controls>` e o vídeo deve reproduzir.  
   - Confirme que as fotos continuam aparecendo normalmente.

3. **Dashboard**  
   - Faça login e abra o evento correspondente (modal com “Compartilhar” e “Fotos Recebidas”).  
   - Em “Fotos Recebidas”, o vídeo deve aparecer no grid (thumbnail ou badge “Vídeo”).  
   - Verifique que as contagens (Todas / Pendentes / Aprovadas) incluem o vídeo.  
   - Teste aprovar e, se quiser, excluir o vídeo.

4. **Mídia mista**  
   - Envie 1 foto e 1 vídeo no mesmo evento.  
   - Na galeria pública e no dashboard, devem aparecer os dois (foto como imagem, vídeo como vídeo).  
   - Lightbox deve alternar corretamente entre foto (imagem) e vídeo (player com controles).

---

## Critérios de aceite (checklist)

- [ ] Ao baixar PNG/PDF do cartão, o QR Code aparece no arquivo e pode ser escaneado.  
- [ ] Após enviar um vídeo, ele aparece na galeria da página do QR Code e pode ser reproduzido.  
- [ ] O mesmo vídeo aparece no dashboard em “Fotos Recebidas”.  
- [ ] Fotos continuam funcionando (upload, galeria, dashboard).  
- [ ] Galeria suporta somente fotos, somente vídeos e mídia mista.

---

*Documento gerado em referência ao escopo de correção dos bugs do Eternize (eternizeapp.com).*
