// ===== VIEW PAGE SCRIPT =====
// Carrega e exibe página compartilhada

document.addEventListener('DOMContentLoaded', async () => {
    await loadPage();
});

async function loadPage() {
    const loadingScreen = document.getElementById('loadingScreen');
    const errorScreen = document.getElementById('errorScreen');
    const pageContent = document.getElementById('pageContent');

    try {
        const result = await linkGen.loadPageFromUrl();

        if (!result.success) {
            // Mostrar erro
            loadingScreen.style.display = 'none';
            errorScreen.style.display = 'flex';
            return;
        }

        // Preencher dados da página
        const { pageData, photos } = result;

        document.getElementById('pageTitle').textContent = pageData.title;
        
        if (pageData.date) {
            const dateObj = new Date(pageData.date);
            const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            document.getElementById('pageDate').textContent = formattedDate;
        }

        if (pageData.description) {
            document.getElementById('pageDescription').textContent = pageData.description;
        } else {
            document.getElementById('pageDescription').style.display = 'none';
        }

        // Atualizar título da página
        document.title = `${pageData.title} - Eternize`;

        // Renderizar galeria
        renderGallery(photos);

        // Mostrar conteúdo
        loadingScreen.style.display = 'none';
        pageContent.style.display = 'block';

    } catch (error) {
        console.error('Erro ao carregar página:', error);
        loadingScreen.style.display = 'none';
        errorScreen.style.display = 'flex';
    }
}

function renderGallery(photos) {
    const galleryGrid = document.getElementById('viewGalleryGrid');
    const photoCount = document.getElementById('photoCountView');

    if (photos.length === 0) {
        galleryGrid.innerHTML = `
            <div class="gallery-empty">
                <div class="empty-icon">📸</div>
                <p>Nenhuma foto nesta página</p>
            </div>
        `;
        photoCount.textContent = '0 fotos';
        return;
    }

    photoCount.textContent = `${photos.length} foto${photos.length !== 1 ? 's' : ''}`;

    galleryGrid.innerHTML = photos.map(photo => `
        <div class="gallery-item" onclick="viewPhoto('${photo.id}', ${JSON.stringify(photo).replace(/"/g, '&quot;')})">
            <img src="${photo.data}" alt="${photo.filename}">
            <div class="gallery-item-hover">
                <span>👁️ Ver</span>
            </div>
        </div>
    `).join('');
}

function viewPhoto(photoId, photoData) {
    const photo = typeof photoData === 'string' ? JSON.parse(photoData) : photoData;
    
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <div class="photo-modal-content">
            <button class="photo-modal-close" onclick="this.closest('.photo-modal').remove()">×</button>
            <img src="${photo.data}" alt="${photo.filename}">
            <div class="photo-modal-info">
                <p><strong>${photo.filename}</strong></p>
                <p>Enviada em ${new Date(photo.uploadedAt).toLocaleString('pt-BR')}</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}
