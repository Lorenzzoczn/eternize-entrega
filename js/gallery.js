// ===== GALLERY MANAGER =====
// Sistema de galeria com upload múltiplo e preview

class GalleryManager {
    constructor(pageId) {
        this.pageId = pageId;
        this.selectedFiles = [];
        this.uploadedPhotos = [];
        this.init();
    }

    async init() {
        await storage.init();
        this.setupEventListeners();
        await this.loadGallery();
    }

    setupEventListeners() {
        // Upload area
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                this.handleFiles(e.dataTransfer.files);
            });

            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }

        // Upload button
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadPhotos());
        }
    }

    handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            const isImage = file.type.startsWith('image/');
            const isUnder10MB = file.size <= 10 * 1024 * 1024;
            
            if (!isImage) {
                alert(`${file.name} não é uma imagem válida`);
                return false;
            }
            if (!isUnder10MB) {
                alert(`${file.name} é muito grande (máximo 10MB)`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            this.selectedFiles = [...this.selectedFiles, ...validFiles];
            this.renderPreview();
            
            const uploadBtn = document.getElementById('uploadBtn');
            if (uploadBtn) uploadBtn.style.display = 'block';
        }
    }

    renderPreview() {
        const previewContainer = document.getElementById('uploadPreview');
        if (!previewContainer) return;

        previewContainer.innerHTML = this.selectedFiles.map((file, index) => {
            const url = URL.createObjectURL(file);
            return `
                <div class="preview-item" data-index="${index}">
                    <img src="${url}" alt="${file.name}">
                    <button class="preview-remove" onclick="gallery.removePreview(${index})">×</button>
                    <div class="preview-name">${file.name}</div>
                </div>
            `;
        }).join('');
    }

    removePreview(index) {
        this.selectedFiles.splice(index, 1);
        this.renderPreview();
        
        if (this.selectedFiles.length === 0) {
            const uploadBtn = document.getElementById('uploadBtn');
            if (uploadBtn) uploadBtn.style.display = 'none';
        }
    }

    async uploadPhotos() {
        if (this.selectedFiles.length === 0) return;

        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<span class="spinner"></span> Salvando...';
        }

        try {
            for (const file of this.selectedFiles) {
                const base64 = await storage.fileToBase64(file);
                const photoData = {
                    id: storage.generateUniqueId(),
                    pageId: this.pageId,
                    data: base64,
                    filename: file.name,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                };

                await storage.savePhoto(photoData);
                this.uploadedPhotos.push(photoData);
            }

            // Limpar preview
            this.selectedFiles = [];
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.value = '';
            
            const previewContainer = document.getElementById('uploadPreview');
            if (previewContainer) previewContainer.innerHTML = '';

            if (uploadBtn) {
                uploadBtn.style.display = 'none';
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = 'Salvar Fotos';
            }

            // Recarregar galeria
            await this.loadGallery();

            // Mostrar mensagem de sucesso
            this.showSuccessMessage();

        } catch (error) {
            console.error('Erro ao salvar fotos:', error);
            alert('Erro ao salvar fotos. Tente novamente.');
            
            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = 'Salvar Fotos';
            }
        }
    }

    async loadGallery() {
        try {
            this.uploadedPhotos = await storage.getPhotos(this.pageId);
            this.renderGallery();
        } catch (error) {
            console.error('Erro ao carregar galeria:', error);
        }
    }

    renderGallery() {
        const galleryContainer = document.getElementById('galleryGrid');
        if (!galleryContainer) return;

        if (this.uploadedPhotos.length === 0) {
            galleryContainer.innerHTML = `
                <div class="gallery-empty">
                    <div class="empty-icon">📸</div>
                    <p>Nenhuma foto adicionada ainda</p>
                    <p class="empty-hint">Use o botão acima para adicionar suas primeiras fotos</p>
                </div>
            `;
            return;
        }

        galleryContainer.innerHTML = this.uploadedPhotos.map(photo => `
            <div class="gallery-item" data-id="${photo.id}">
                <img src="${photo.data}" alt="${photo.filename}">
                <div class="gallery-item-overlay">
                    <button class="gallery-btn-view" onclick="gallery.viewPhoto('${photo.id}')">
                        👁️ Ver
                    </button>
                    <button class="gallery-btn-delete" onclick="gallery.deletePhoto('${photo.id}')">
                        🗑️ Remover
                    </button>
                </div>
            </div>
        `).join('');

        // Atualizar contador
        const photoCount = document.getElementById('photoCount');
        if (photoCount) {
            photoCount.textContent = `${this.uploadedPhotos.length} foto${this.uploadedPhotos.length !== 1 ? 's' : ''}`;
        }
    }

    viewPhoto(photoId) {
        const photo = this.uploadedPhotos.find(p => p.id === photoId);
        if (!photo) return;

        // Criar modal
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
        
        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async deletePhoto(photoId) {
        if (!confirm('Tem certeza que deseja remover esta foto?')) return;

        try {
            await storage.deletePhoto(photoId);
            this.uploadedPhotos = this.uploadedPhotos.filter(p => p.id !== photoId);
            this.renderGallery();
            this.showSuccessMessage('Foto removida com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar foto:', error);
            alert('Erro ao remover foto. Tente novamente.');
        }
    }

    showSuccessMessage(message = 'Fotos salvas com sucesso!') {
        const toast = document.createElement('div');
        toast.className = 'toast-success';
        toast.innerHTML = `
            <span class="toast-icon">✓</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Instância global
let gallery = null;
