// ===== EVENTO PAGE FUNCTIONALITY =====
// Sistema completo de upload e galeria para página pública do evento

class EventoPage {
    constructor() {
        this.eventToken = this.getTokenFromURL();
        this.eventData = null;
        this.selectedFiles = [];
        this.photos = [];
        this.currentPhotoIndex = 0;
        this.photosPerPage = 12;
        this.currentPage = 1;
        
        this.init();
    }

    async init() {
        if (!this.eventToken) {
            this.showError('Token do evento não encontrado');
            return;
        }

        await this.loadEventData();
        this.setupEventListeners();
        await this.loadPhotos();
        this.startAutoRefresh();
    }

    getTokenFromURL() {
        const path = window.location.pathname;
        // Suporta /evento/TOKEN e /memoria/TOKEN (link do QR Code)
        const match = path.match(/\/(?:evento|memoria)\/([a-z0-9]{12})/);
        return match ? match[1] : null;
    }

    async loadEventData() {
        try {
            const response = await fetch(`/api/events/${this.eventToken}`);
            const data = await response.json();

            if (data.success) {
                this.eventData = data.event;
                this.renderEventHeader();
            } else {
                this.showError('Evento não encontrado');
            }
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            this.showError('Erro ao carregar dados do evento');
        }
    }

    renderEventHeader() {
        if (!this.eventData) return;

        // Atualizar título da página
        document.title = `${this.eventData.nome_evento} - Eternize`;
        document.getElementById('pageTitle').textContent = `${this.eventData.nome_evento} - Eternize`;

        // Ícones por tema
        const themeIcons = {
            'toy-story': '🚀',
            'princesas': '👑',
            'neutro': '✨'
        };

        // Atualizar hero
        const hero = document.getElementById('eventoHero');
        const icon = document.getElementById('eventoIcon');
        const title = document.getElementById('eventoTitle');
        const date = document.getElementById('eventoDate');
        const description = document.getElementById('eventoDescription');

        if (hero && this.eventData.cores) {
            hero.style.background = `linear-gradient(135deg, ${this.eventData.cores.primaria} 0%, ${this.eventData.cores.secundaria} 100%)`;
        }

        if (icon) icon.textContent = themeIcons[this.eventData.tema] || '✨';
        if (title) title.textContent = this.eventData.nome_evento;
        if (date) date.textContent = this.formatDate(this.eventData.data_evento);
        if (description && this.eventData.descricao) {
            description.textContent = this.eventData.descricao;
        } else if (description) {
            description.textContent = 'Compartilhe suas fotos e faça parte deste momento especial';
        }
    }

    setupEventListeners() {
        // Botões de upload
        document.getElementById('cameraBtn')?.addEventListener('click', () => {
            document.getElementById('cameraInput').click();
        });

        document.getElementById('galleryBtn')?.addEventListener('click', () => {
            document.getElementById('photoInput').click();
        });

        document.getElementById('videoBtn')?.addEventListener('click', () => {
            document.getElementById('videoInput').click();
        });

        // Inputs de arquivo
        document.getElementById('photoInput')?.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        document.getElementById('cameraInput')?.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        document.getElementById('videoInput')?.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Remover todas as fotos
        document.getElementById('removeAllBtn')?.addEventListener('click', () => {
            this.clearSelectedFiles();
        });

        // Form submit
        document.getElementById('uploadForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadPhotos();
        });

        // Upload mais fotos
        document.getElementById('uploadMoreBtn')?.addEventListener('click', () => {
            this.resetUploadForm();
        });

        // Lightbox
        document.getElementById('lightboxClose')?.addEventListener('click', () => {
            this.closeLightbox();
        });

        document.getElementById('lightboxPrev')?.addEventListener('click', () => {
            this.showPreviousPhoto();
        });

        document.getElementById('lightboxNext')?.addEventListener('click', () => {
            this.showNextPhoto();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('lightbox').style.display === 'flex') {
                if (e.key === 'Escape') this.closeLightbox();
                if (e.key === 'ArrowLeft') this.showPreviousPhoto();
                if (e.key === 'ArrowRight') this.showNextPhoto();
            }
        });

        // Load more
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.loadMorePhotos();
        });
    }

    async handleFileSelect(files) {
        if (!files || files.length === 0) return;

        const maxImageSize = 10 * 1024 * 1024;   // 10MB fotos
        const maxVideoSize = 100 * 1024 * 1024; // 100MB vídeos

        for (let file of files) {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) {
                alert('Apenas fotos e vídeos são permitidos.');
                continue;
            }

            if (isImage) {
                if (file.size > maxImageSize) {
                    alert(`${file.name} é muito grande. Máximo 10MB por foto.`);
                    continue;
                }
                const compressedFile = await this.compressImage(file);
                this.selectedFiles.push(compressedFile);
            } else {
                if (file.size > maxVideoSize) {
                    alert(`${file.name} é muito grande. Máximo 100MB por vídeo.`);
                    continue;
                }
                this.selectedFiles.push(file);
            }
        }

        if (this.selectedFiles.length > 0) {
            this.renderPreview();
            document.getElementById('formFields').style.display = 'block';
        }
    }

    async compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensionar se necessário (max 1920px)
                    const maxSize = 1920;
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.85);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    renderPreview() {
        const previewArea = document.getElementById('uploadPreviewArea');
        const previewImages = document.getElementById('previewImages');

        if (!previewArea || !previewImages) return;

        previewArea.style.display = 'block';
        previewImages.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const isVideo = file.type.startsWith('video/');
            const div = document.createElement('div');
            div.className = 'preview-item';

            const bindRemove = () => {
                div.querySelector('.preview-remove')?.addEventListener('click', () => this.removeFile(index));
            };

            if (isVideo) {
                const url = URL.createObjectURL(file);
                div.innerHTML = `
                    <video src="${url}" muted playsinline preload="metadata"></video>
                    <span class="preview-badge preview-badge-video">Vídeo</span>
                    <button class="preview-remove" data-index="${index}">×</button>
                `;
                bindRemove();
                previewImages.appendChild(div);
            } else {
                div.innerHTML = '<div class="preview-loading">Carregando...</div>';
                previewImages.appendChild(div);
                const reader = new FileReader();
                reader.onload = (e) => {
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button class="preview-remove" data-index="${index}">×</button>
                    `;
                    bindRemove();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        
        if (this.selectedFiles.length === 0) {
            this.clearSelectedFiles();
        } else {
            this.renderPreview();
        }
    }

    clearSelectedFiles() {
        this.selectedFiles = [];
        document.getElementById('uploadPreviewArea').style.display = 'none';
        document.getElementById('formFields').style.display = 'none';
        document.getElementById('photoInput').value = '';
        document.getElementById('cameraInput').value = '';
        document.getElementById('videoInput').value = '';
    }

    async uploadPhotos() {
        if (this.selectedFiles.length === 0) {
            alert('Selecione pelo menos uma foto ou vídeo');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const progressContainer = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        submitBtn.disabled = true;
        progressContainer.style.display = 'block';

        const uploaderName = document.getElementById('uploaderName').value || 'anonymous';
        const message = document.getElementById('photoMessage').value || '';

        let uploaded = 0;
        const total = this.selectedFiles.length;

        for (let file of this.selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('photo', file);
                formData.append('token', this.eventToken);
                formData.append('uploaded_by', uploaderName);
                formData.append('message', message);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    uploaded++;
                    const progress = (uploaded / total) * 100;
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `Enviando... ${uploaded}/${total}`;
                } else {
                    console.error('Erro no upload:', await response.text());
                }
            } catch (error) {
                console.error('Erro ao enviar foto:', error);
            }
        }

        // Mostrar sucesso
        document.getElementById('uploadForm').style.display = 'none';
        document.getElementById('uploadSuccess').style.display = 'block';

        // Recarregar galeria
        await this.loadPhotos();
    }

    resetUploadForm() {
        this.clearSelectedFiles();
        document.getElementById('uploadForm').style.display = 'block';
        document.getElementById('uploadSuccess').style.display = 'none';
        document.getElementById('uploaderName').value = '';
        document.getElementById('photoMessage').value = '';
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('submitBtn').disabled = false;
    }

    async loadPhotos() {
        try {
            const response = await fetch(`/api/photos/${this.eventToken}?approved=true`);
            const data = await response.json();

            if (data.success) {
                this.photos = data.photos;
                this.renderGallery();
                this.updateStats();
            }
        } catch (error) {
            console.error('Erro ao carregar fotos:', error);
        }
    }

    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        const empty = document.getElementById('galleryEmpty');
        const loadMoreContainer = document.getElementById('loadMoreContainer');

        if (!grid) return;

        if (this.photos.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        if (empty) empty.style.display = 'none';

        // Renderizar fotos da página atual
        const startIndex = 0;
        const endIndex = this.currentPage * this.photosPerPage;
        const photosToShow = this.photos.slice(startIndex, endIndex);

        grid.innerHTML = '';

        const isVideo = (item) => item.mediaType === 'video' || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(item.url || '');

        photosToShow.forEach((photo, index) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            const video = isVideo(photo);
            if (video) {
                div.innerHTML = `
                    <video src="${photo.url}" muted playsinline preload="metadata" poster="${photo.thumbnail || ''}"></video>
                    <span class="gallery-item-play">▶</span>
                    <div class="gallery-item-overlay">
                        ${photo.message ? `<p class="gallery-item-message">${photo.message}</p>` : ''}
                        ${photo.uploaded_by !== 'anonymous' ? `<p class="gallery-item-author">Por: ${photo.uploaded_by}</p>` : ''}
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <img src="${photo.url}" alt="Foto do evento" loading="lazy">
                    <div class="gallery-item-overlay">
                        ${photo.message ? `<p class="gallery-item-message">${photo.message}</p>` : ''}
                        ${photo.uploaded_by !== 'anonymous' ? `<p class="gallery-item-author">Por: ${photo.uploaded_by}</p>` : ''}
                    </div>
                `;
            }

            div.addEventListener('click', () => {
                this.openLightbox(index);
            });

            grid.appendChild(div);
        });

        // Mostrar/ocultar botão "Carregar Mais"
        if (loadMoreContainer) {
            loadMoreContainer.style.display = endIndex < this.photos.length ? 'block' : 'none';
        }
    }

    loadMorePhotos() {
        this.currentPage++;
        this.renderGallery();
    }

    updateStats() {
        const photoCount = document.getElementById('photoCount');
        const contributorCount = document.getElementById('contributorCount');

        if (photoCount) {
            photoCount.textContent = this.photos.length;
        }

        if (contributorCount) {
            const contributors = new Set(this.photos.map(p => p.uploaded_by));
            contributorCount.textContent = contributors.size;
        }
    }

    openLightbox(index) {
        this.currentPhotoIndex = index;
        const lightbox = document.getElementById('lightbox');
        const image = document.getElementById('lightboxImage');
        const videoEl = document.getElementById('lightboxVideo');
        const info = document.getElementById('lightboxInfo');

        if (!lightbox) return;

        const photo = this.photos[index];
        const isVideo = photo.mediaType === 'video' || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(photo.url || '');

        if (isVideo && videoEl) {
            image.style.display = 'none';
            videoEl.style.display = 'block';
            videoEl.src = photo.url;
            videoEl.load();
            videoEl.play().catch(() => {});
        } else if (image) {
            videoEl.style.display = 'none';
            videoEl.pause();
            videoEl.removeAttribute('src');
            image.style.display = 'block';
            image.src = photo.url;
        }

        if (info) {
            info.innerHTML = `
                ${photo.message ? `<p style="font-size: 1.2rem; margin-bottom: 10px;">${photo.message}</p>` : ''}
                ${photo.uploaded_by !== 'anonymous' ? `<p style="opacity: 0.8;">Por: ${photo.uploaded_by}</p>` : ''}
            `;
        }

        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        const videoEl = document.getElementById('lightboxVideo');
        if (videoEl) {
            videoEl.pause();
            videoEl.removeAttribute('src');
        }
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    showPreviousPhoto() {
        this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.photos.length) % this.photos.length;
        this.openLightbox(this.currentPhotoIndex);
    }

    showNextPhoto() {
        this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.photos.length;
        this.openLightbox(this.currentPhotoIndex);
    }

    startAutoRefresh() {
        // Atualizar galeria a cada 30 segundos
        setInterval(() => {
            this.loadPhotos();
        }, 30000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    showError(message) {
        const hero = document.getElementById('eventoHero');
        if (hero) {
            hero.innerHTML = `
                <div class="evento-hero-content">
                    <div class="evento-icon">❌</div>
                    <h1 class="evento-title">Erro</h1>
                    <p class="evento-description">${message}</p>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 30px;">Voltar ao Início</a>
                </div>
            `;
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.eventoPage = new EventoPage();
});
