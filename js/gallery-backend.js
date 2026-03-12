// ===== GALLERY WITH BACKEND =====
// Sistema de galeria integrado com backend S3

class GalleryManagerBackend {
    constructor(pageId) {
        this.pageId = pageId;
        this.selectedFiles = [];
        this.uploadedPhotos = [];
        this.useBackend = true;
        this.init();
    }

    async init() {
        this.useBackend = await isBackendAvailable();
        
        if (!this.useBackend) {
            console.warn('⚠️ Backend não disponível, usando IndexedDB');
            await storage.init();
        }
        
        this.setupEventListeners();
        await this.loadGallery();
    }

    setupEventListeners() {
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
                    <button class="preview-remove" onclick="galleryBackend.removePreview(${index})">×</button>
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
        }

        try {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                
                if (uploadBtn) {
                    uploadBtn.innerHTML = `<span class="spinner"></span> Enviando ${i + 1}/${this.selectedFiles.length}...`;
                }

                if (this.useBackend) {
                    // Upload para backend (S3)
                    const result = await uploadPhotoBackend(this.pageId, file, (progress) => {
                        if (uploadBtn) {
                            uploadBtn.innerHTML = `<span class="spinner"></span> ${Math.round(progress)}%`;
                        }
                    });
                    
                    this.uploadedPhotos.push({
                        url: result.url,
                        filename: file.name,
                        uploadedAt: new Date().toISOString(),
                    });
                } else {
                    // Fallback: salvar localmente
                    const base64 = await storage.fileToBase64(file);
                    const photoData = {
                        id: storage.generateUniqueId(),
                        pageId: this.pageId,
                        data: base64,
                        filename: file.name,
                        uploadedAt: new Date().toISOString(),
                    };
                    await storage.savePhoto(photoData);
                    this.uploadedPhotos.push(photoData);
                }
            }

            // Limpar
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

            await this.loadGallery();
            this.showSuccessMessage();

        } catch (error) {
            console.error('❌ Erro ao salvar fotos:', error);
            alert('Erro ao salvar fotos: ' + error.message);
            
            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = 'Salvar Fotos';
            }
        }
    }

    async loadGallery() {
        try {
            if (this.useBackend) {
                // Carregar do backend
                const data = await getPhotosBackend(this.pageId);
                this.uploadedPhotos = data.photoDetails || data.photos.map(url => ({ url }));
            } else {
                // Carregar do IndexedDB
                this.uploadedPhotos = await storage.getPhotos(this.pageId);
            }
            
            this.renderGallery();
        } catch (error) {
            console.error('❌ Erro ao carregar galeria:', error);
            // Tentar fallback local
            if (this.useBackend) {
                this.useBackend = false;
                await this.loadGallery();
            }
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
                </div>
            `;
            return;
        }

        galleryContainer.innerHTML = this.uploadedPhotos.map((photo, index) => {
            const photoUrl = photo.url || photo.data;
            const photoId = photo.id || index;
            
            return `
                <div class="gallery-item" data-id="${photoId}">
                    <img src="${photoUrl}" alt="${photo.filename || 'Foto'}">
                    <div class="gallery-item-overlay">
                        <button class="gallery-btn-view" onclick="galleryBackend.viewPhoto('${photoUrl}')">
                            👁️ Ver
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const photoCount = document.getElementById('photoCount');
        if (photoCount) {
            photoCount.textContent = `${this.uploadedPhotos.length} foto${this.uploadedPhotos.length !== 1 ? 's' : ''}`;
        }
    }

    viewPhoto(photoUrl) {
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <div class="photo-modal-content">
                <button class="photo-modal-close" onclick="this.closest('.photo-modal').remove()">×</button>
                <img src="${photoUrl}" alt="Foto">
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showSuccessMessage(message = 'Fotos salvas com sucesso!') {
        const toast = document.createElement('div');
        toast.className = 'toast-success';
        toast.innerHTML = `
            <span class="toast-icon">✓</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

let galleryBackend = null;
