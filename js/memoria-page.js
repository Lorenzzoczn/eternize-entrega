// ===== MEMORIA PAGE FUNCTIONALITY =====
// Página pública para visualização e upload de fotos

class MemoriaPage {
    constructor() {
        this.token = window.EVENT_TOKEN;
        this.eventData = window.EVENT_DATA;
        this.uploadForm = document.getElementById('uploadForm');
        this.photoInput = document.getElementById('photoInput');
        this.messageInput = document.getElementById('messageInput');
        this.nameInput = document.getElementById('nameInput');
        this.uploadStatus = document.getElementById('uploadStatus');
        this.photosGrid = document.getElementById('photosGrid');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPhotos();
        this.setupAutoRefresh();
    }

    setupEventListeners() {
        // Upload form
        this.uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload();
        });

        // File input preview
        this.photoInput.addEventListener('change', (e) => {
            this.previewFile(e.target.files[0]);
        });

        // Drag and drop
        const uploadCard = document.querySelector('.upload-card');
        uploadCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadCard.classList.add('drag-over');
        });

        uploadCard.addEventListener('dragleave', () => {
            uploadCard.classList.remove('drag-over');
        });

        uploadCard.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadCard.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.photoInput.files = files;
                this.previewFile(files[0]);
            }
        });
    }

    previewFile(file) {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            // Remove existing preview
            const existingPreview = document.querySelector('.file-preview');
            if (existingPreview) {
                existingPreview.remove();
            }

            // Create preview
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="preview-info">
                    <p><strong>${file.name}</strong></p>
                    <p>${this.formatFileSize(file.size)}</p>
                </div>
                <button type="button" class="remove-preview" onclick="this.parentElement.remove(); document.getElementById('photoInput').value = '';">✕</button>
            `;

            this.uploadForm.insertBefore(preview, this.uploadForm.querySelector('button'));
        };
        reader.readAsDataURL(file);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleUpload() {
        const file = this.photoInput.files[0];
        const message = this.messageInput.value.trim();
        const name = this.nameInput.value.trim() || 'Anônimo';

        if (!file) {
            this.showStatus('Selecione uma foto para enviar', 'error');
            return;
        }

        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showStatus('Apenas imagens são permitidas', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            this.showStatus('Arquivo muito grande. Máximo 10MB', 'error');
            return;
        }

        // Show loading
        this.showStatus('Enviando foto...', 'loading');
        const submitBtn = this.uploadForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('token', this.token);
            formData.append('message', message);
            formData.append('uploaded_by', name);

            // Upload to backend
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showStatus('Foto enviada com sucesso! 🎉', 'success');
                this.resetForm();
                
                // Refresh gallery after a short delay
                setTimeout(() => {
                    this.loadPhotos();
                }, 1000);
            } else {
                this.showStatus(result.error || 'Erro ao enviar foto', 'error');
            }

        } catch (error) {
            console.error('Upload error:', error);
            this.showStatus('Erro de conexão. Tente novamente.', 'error');
        } finally {
            submitBtn.disabled = false;
        }
    }

    resetForm() {
        this.uploadForm.reset();
        const preview = document.querySelector('.file-preview');
        if (preview) {
            preview.remove();
        }
    }

    showStatus(message, type) {
        this.uploadStatus.textContent = message;
        this.uploadStatus.className = `upload-status ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                this.uploadStatus.textContent = '';
                this.uploadStatus.className = 'upload-status';
            }, 5000);
        }
    }

    async loadPhotos() {
        try {
            const response = await fetch(`/api/photos/${this.token}`);
            const result = await response.json();

            if (result.success) {
                this.renderPhotos(result.photos.filter(p => p.aprovado));
            }
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    }

    renderPhotos(photos) {
        if (photos.length === 0) {
            this.photosGrid.innerHTML = `
                <div class="empty-gallery">
                    <div class="empty-icon">${this.eventData.tema === 'toy-story' ? '🚀' : this.eventData.tema === 'princesas' ? '👑' : '✨'}</div>
                    <p>Seja o primeiro a compartilhar um momento!</p>
                </div>
            `;
            return;
        }

        this.photosGrid.innerHTML = photos.map(photo => `
            <div class="photo-item" data-photo-id="${photo.id}">
                <img src="${photo.url}" alt="Momento especial" loading="lazy" onclick="this.parentElement.classList.toggle('expanded')">
                ${photo.message ? `<p class="photo-message">${photo.message}</p>` : ''}
                ${photo.uploaded_by !== 'anonymous' ? `<p class="photo-author">Por: ${photo.uploaded_by}</p>` : ''}
                <div class="photo-date">${this.formatDate(photo.criado_em)}</div>
            </div>
        `).join('');

        // Add masonry layout
        this.setupMasonryLayout();
    }

    setupMasonryLayout() {
        const grid = this.photosGrid;
        const items = grid.querySelectorAll('.photo-item');
        
        // Simple masonry-like layout
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('fade-in');
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Hoje';
        } else if (diffDays === 2) {
            return 'Ontem';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} dias atrás`;
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    }

    setupAutoRefresh() {
        // Refresh photos every 30 seconds
        setInterval(() => {
            this.loadPhotos();
        }, 30000);

        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadPhotos();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.EVENT_TOKEN) {
        new MemoriaPage();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .drag-over {
        border: 2px dashed var(--theme-primary) !important;
        background: rgba(var(--theme-primary-rgb), 0.1) !important;
    }

    .file-preview {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 10px;
        margin: 15px 0;
        position: relative;
    }

    .file-preview img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }

    .preview-info p {
        margin: 0;
        font-size: 0.9rem;
    }

    .remove-preview {
        position: absolute;
        top: 5px;
        right: 5px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        cursor: pointer;
        font-size: 12px;
    }

    .photo-item.expanded {
        grid-column: 1 / -1;
        max-width: none;
    }

    .photo-item.expanded img {
        max-height: 80vh;
        width: auto;
        margin: 0 auto;
        display: block;
    }

    .upload-status.loading {
        color: #2196F3;
    }

    .upload-status.success {
        color: #4CAF50;
    }

    .upload-status.error {
        color: #f44336;
    }
`;
document.head.appendChild(style);