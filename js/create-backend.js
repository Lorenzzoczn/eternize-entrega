// ===== CREATE WITH BACKEND =====
// Versão integrada com backend Node.js + S3

let currentAlbumId = null;
let uploadedPhotos = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se backend está disponível
    const backendAvailable = await isBackendAvailable();
    
    if (!backendAvailable) {
        showWarning('Backend não disponível. Usando modo offline (IndexedDB).');
    } else {
        console.log('✅ Backend disponível!');
    }

    setupCreateForm();
});

function setupCreateForm() {
    const finishBtn = document.getElementById('finishBtn');
    if (!finishBtn) return;

    finishBtn.addEventListener('click', async () => {
        await createAlbumWithBackend();
    });
}

async function createAlbumWithBackend() {
    const title = document.getElementById('pageTitle')?.value.trim();
    const description = document.getElementById('pageDescription')?.value.trim();
    const date = document.getElementById('pageDate')?.value;

    if (!title) {
        alert('Por favor, adicione um título para sua página');
        return;
    }

    const finishBtn = document.getElementById('finishBtn');
    finishBtn.disabled = true;
    finishBtn.innerHTML = '<span class="spinner"></span> Criando álbum...';

    try {
        // Criar álbum no backend
        const { albumId } = await createAlbumBackend();
        currentAlbumId = albumId;

        console.log('✅ Álbum criado no backend:', albumId);

        // Salvar metadados localmente também
        const pageData = {
            id: albumId,
            title: title,
            description: description,
            date: date,
            createdAt: new Date().toISOString(),
            backend: true,
        };

        await storage.savePage(pageData);

        // Gerar URL do álbum
        const albumUrl = `${window.location.origin}/view.html?id=${albumId}`;

        // Mostrar modal com link e QR Code
        linkGen.showLinkModal(albumUrl, albumId);

        // Resetar formulário
        document.getElementById('pageTitle').value = '';
        if (document.getElementById('pageDescription')) {
            document.getElementById('pageDescription').value = '';
        }
        if (document.getElementById('pageDate')) {
            document.getElementById('pageDate').value = '';
        }

    } catch (error) {
        console.error('❌ Erro ao criar álbum:', error);
        alert('Erro ao criar álbum: ' + error.message);
    } finally {
        finishBtn.disabled = false;
        finishBtn.innerHTML = '✨ Finalizar e Gerar Link';
    }
}

function showWarning(message) {
    const warning = document.createElement('div');
    warning.className = 'warning-banner';
    warning.innerHTML = `
        <span>⚠️ ${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    warning.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #fff3cd;
        color: #856404;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 5000);
}
