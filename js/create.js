// ===== CREATE PAGE SCRIPT =====
// Gerenciamento da página de criação

let currentPageId = null;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    // Gerar ID temporário para esta sessão
    currentPageId = storage.generateUniqueId();
    
    // Inicializar galeria
    gallery = new GalleryManager(currentPageId);
    
    // Setup botão finalizar
    setupFinishButton();
});

function setupFinishButton() {
    const finishBtn = document.getElementById('finishBtn');
    if (!finishBtn) return;

    finishBtn.addEventListener('click', async () => {
        await finalizePage();
    });
}

async function finalizePage() {
    const title = document.getElementById('pageTitle').value.trim();
    const description = document.getElementById('pageDescription').value.trim();
    const date = document.getElementById('pageDate').value;

    // Validação
    if (!title) {
        alert('Por favor, adicione um título para sua página');
        document.getElementById('pageTitle').focus();
        return;
    }

    const photos = await storage.getPhotos(currentPageId);
    if (photos.length === 0) {
        const confirm = window.confirm('Você não adicionou nenhuma foto. Deseja continuar mesmo assim?');
        if (!confirm) return;
    }

    // Desabilitar botão
    const finishBtn = document.getElementById('finishBtn');
    finishBtn.disabled = true;
    finishBtn.innerHTML = '<span class="spinner"></span> Gerando link...';

    try {
        // Criar página
        const pageData = {
            title: title,
            description: description,
            date: date,
            photoCount: photos.length
        };

        const result = await linkGen.createPage(pageData);

        if (result.success) {
            // Mostrar modal com link e QR Code
            linkGen.showLinkModal(result.url, result.pageId);
            
            // Resetar formulário
            document.getElementById('pageTitle').value = '';
            document.getElementById('pageDescription').value = '';
            document.getElementById('pageDate').value = '';
            
            // Gerar novo ID para próxima página
            currentPageId = storage.generateUniqueId();
            gallery.pageId = currentPageId;
            gallery.uploadedPhotos = [];
            gallery.renderGallery();
            
        } else {
            alert('Erro ao criar página: ' + result.error);
        }

    } catch (error) {
        console.error('Erro ao finalizar página:', error);
        alert('Erro ao criar página. Tente novamente.');
    } finally {
        finishBtn.disabled = false;
        finishBtn.innerHTML = '✨ Finalizar e Gerar Link';
    }
}
