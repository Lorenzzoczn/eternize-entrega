// ===== ADMIN PANEL FUNCTIONALITY =====
// Complete admin panel for managing events and photos

class AdminPanel {
    constructor() {
        this.events = [];
        this.currentEvent = null;
        this.currentPhotos = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadDashboardData();
        this.setupAutoRefresh();
    }

    setupEventListeners() {
        // Create event form
        document.getElementById('createEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateEvent();
        });

        // Search and filter
        document.getElementById('searchEvents').addEventListener('input', (e) => {
            this.filterEvents(e.target.value);
        });

        document.getElementById('filterTheme').addEventListener('change', (e) => {
            this.filterEventsByTheme(e.target.value);
        });

        // Modal close on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // ===== DASHBOARD DATA =====
    async loadDashboardData() {
        this.showLoading(true);
        
        try {
            // In a real implementation, these would be API calls
            // For now, we'll use localStorage as a fallback
            await this.loadEvents();
            await this.updateDashboardStats();
            this.renderEvents();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Erro ao carregar dados do dashboard');
        } finally {
            this.showLoading(false);
        }
    }

    async loadEvents() {
        try {
            // Try to load from API first
            const response = await fetch('/api/admin/events');
            if (response.ok) {
                const result = await response.json();
                this.events = result.events || [];
            } else {
                // Fallback to localStorage
                this.events = JSON.parse(localStorage.getItem('eternize_admin_events')) || [];
            }
        } catch (error) {
            // Fallback to localStorage
            this.events = JSON.parse(localStorage.getItem('eternize_admin_events')) || [];
        }
    }

    async updateDashboardStats() {
        let totalEvents = this.events.length;
        let totalPhotos = 0;
        let approvedPhotos = 0;
        let pendingPhotos = 0;

        // Calculate stats from all events
        for (const event of this.events) {
            try {
                const photos = await this.getEventPhotos(event.token);
                totalPhotos += photos.length;
                approvedPhotos += photos.filter(p => p.aprovado).length;
                pendingPhotos += photos.filter(p => !p.aprovado).length;
            } catch (error) {
                console.error('Error loading photos for event:', event.id, error);
            }
        }

        // Update UI
        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('totalPhotos').textContent = totalPhotos;
        document.getElementById('approvedPhotos').textContent = approvedPhotos;
        document.getElementById('pendingPhotos').textContent = pendingPhotos;
    }

    // ===== EVENT MANAGEMENT =====
    async handleCreateEvent() {
        const formData = new FormData(document.getElementById('createEventForm'));
        const eventData = {
            nome_evento: formData.get('nome_evento'),
            data_evento: formData.get('data_evento'),
            tema: formData.get('tema')
        };

        this.showLoading(true);

        try {
            // Try API first
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.events.unshift(result.event);
                    this.saveEventsToStorage();
                    this.renderEvents();
                    this.updateDashboardStats();
                    this.closeCreateEventModal();
                    this.showSuccess('Evento criado com sucesso! 🎉');
                } else {
                    throw new Error(result.error);
                }
            } else {
                throw new Error('Erro na comunicação com o servidor');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            
            // Fallback: create locally
            const localEvent = this.createLocalEvent(eventData);
            this.events.unshift(localEvent);
            this.saveEventsToStorage();
            this.renderEvents();
            this.updateDashboardStats();
            this.closeCreateEventModal();
            this.showSuccess('Evento criado localmente! 🎉');
        } finally {
            this.showLoading(false);
        }
    }

    createLocalEvent(eventData) {
        const token = this.generateToken();
        const eventId = `event_${Date.now()}`;
        
        const themeColors = {
            'toy-story': { primaria: '#FFD700', secundaria: '#FF0000' },
            'princesas': { primaria: '#FFB6C1', secundaria: '#DDA0DD' },
            'neutro': { primaria: '#E4D9B6', secundaria: '#FFD1DC' }
        };

        return {
            id: eventId,
            token: token,
            nome_evento: eventData.nome_evento,
            data_evento: eventData.data_evento,
            tema: eventData.tema,
            cores: themeColors[eventData.tema],
            criado_em: new Date().toISOString(),
            ativo: true,
            url_memoria: `${window.location.origin}/memoria/${token}`
        };
    }

    generateToken() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 12; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    saveEventsToStorage() {
        localStorage.setItem('eternize_admin_events', JSON.stringify(this.events));
    }

    renderEvents() {
        const eventsGrid = document.getElementById('eventsGrid');
        const emptyState = document.getElementById('emptyEvents');

        if (this.events.length === 0) {
            eventsGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        eventsGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        eventsGrid.innerHTML = this.events.map(event => {
            const eventDate = new Date(event.data_evento);
            const formattedDate = eventDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            const themeIcons = {
                'toy-story': '🚀',
                'princesas': '👑',
                'neutro': '✨'
            };

            return `
                <div class="event-card" onclick="adminPanel.openEventDetails('${event.id}')">
                    <div class="event-cover theme-${event.tema}">
                        ${themeIcons[event.tema] || '✨'}
                        <span class="event-status">● Ativo</span>
                    </div>
                    <div class="event-info">
                        <h3>${event.nome_evento}</h3>
                        <p class="event-date">📅 ${formattedDate}</p>
                        <div class="event-stats">
                            <div class="event-stat">
                                <span>🎭</span>
                                <span>${event.tema}</span>
                            </div>
                            <div class="event-stat">
                                <span>🔗</span>
                                <span>${event.token}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterEvents(searchTerm) {
        const cards = document.querySelectorAll('.event-card');
        cards.forEach(card => {
            const eventName = card.querySelector('h3').textContent.toLowerCase();
            const isVisible = eventName.includes(searchTerm.toLowerCase());
            card.style.display = isVisible ? 'block' : 'none';
        });
    }

    filterEventsByTheme(theme) {
        const cards = document.querySelectorAll('.event-card');
        cards.forEach(card => {
            const eventTheme = card.querySelector('.event-cover').className.split(' ')[1].replace('theme-', '');
            const isVisible = !theme || eventTheme === theme;
            card.style.display = isVisible ? 'block' : 'none';
        });
    }

    // ===== EVENT DETAILS =====
    async openEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.currentEvent = event;
        
        // Update modal content
        document.getElementById('eventDetailsTitle').textContent = event.nome_evento;
        document.getElementById('eventDetailsDate').textContent = new Date(event.data_evento).toLocaleDateString('pt-BR');
        document.getElementById('eventDetailsTheme').textContent = this.getThemeName(event.tema);
        document.getElementById('eventDetailsToken').textContent = event.token;
        
        // Set links
        const publicLink = event.url_memoria || `${window.location.origin}/memoria/${event.token}`;
        document.getElementById('publicLink').value = publicLink;
        
        // Generate QR Code
        this.generateQRCode(publicLink);
        
        // Load photos
        await this.loadEventPhotos(event.token);
        
        // Show modal
        document.getElementById('eventDetailsModal').classList.add('active');
    }

    getThemeName(theme) {
        const names = {
            'toy-story': 'Toy Story',
            'princesas': 'Princesas',
            'neutro': 'Neutro'
        };
        return names[theme] || 'Neutro';
    }

    generateQRCode(url) {
        const qrContainer = document.getElementById('eventQRCode');
        qrContainer.innerHTML = '';
        
        const qrDiv = document.createElement('div');
        qrDiv.style.display = 'flex';
        qrDiv.style.justifyContent = 'center';
        
        qrContainer.appendChild(qrDiv);
        
        new QRCode(qrDiv, {
            text: url,
            width: 200,
            height: 200,
            colorDark: "#333333",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    async loadEventPhotos(token) {
        try {
            const photos = await this.getEventPhotos(token);
            this.currentPhotos = photos;
            this.updatePhotoCounts();
            this.renderEventPhotos();
        } catch (error) {
            console.error('Error loading event photos:', error);
            this.currentPhotos = [];
            this.updatePhotoCounts();
            this.renderEventPhotos();
        }
    }

    async getEventPhotos(token) {
        try {
            // Try API first
            const response = await fetch(`/api/photos/${token}`);
            if (response.ok) {
                const result = await response.json();
                return result.photos || [];
            }
        } catch (error) {
            console.error('API error, using localStorage:', error);
        }
        
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem(`event_${token}_photos`)) || [];
    }

    updatePhotoCounts() {
        const all = this.currentPhotos.length;
        const pending = this.currentPhotos.filter(p => !p.aprovado).length;
        const approved = this.currentPhotos.filter(p => p.aprovado).length;
        
        document.getElementById('countAll').textContent = all;
        document.getElementById('countPending').textContent = pending;
        document.getElementById('countApproved').textContent = approved;
    }

    renderEventPhotos() {
        const photosGrid = document.getElementById('eventPhotosGrid');
        const emptyPhotos = document.getElementById('emptyPhotos');
        
        let filteredPhotos = this.currentPhotos;
        if (this.currentFilter !== 'all') {
            filteredPhotos = this.currentPhotos.filter(p => {
                if (this.currentFilter === 'approved') return p.aprovado;
                if (this.currentFilter === 'pending') return !p.aprovado;
                return true;
            });
        }
        
        if (filteredPhotos.length === 0) {
            photosGrid.style.display = 'none';
            emptyPhotos.style.display = 'block';
            return;
        }
        
        photosGrid.style.display = 'grid';
        emptyPhotos.style.display = 'none';
        
        const isVideo = (p) => p.mediaType === 'video' || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(p.url || '');
        photosGrid.innerHTML = filteredPhotos.map(photo => {
            const video = isVideo(photo);
            const thumb = video ? '' : `<img src="${photo.url || photo.thumbnail || 'https://via.placeholder.com/200'}" alt="Mídia">`;
            const videoPlaceholder = video ? '<div class="photo-item-video-placeholder"><span class="photo-item-video-icon">🎬</span><span>Vídeo</span></div>' : '';
            return `
            <div class="photo-item">
                ${thumb}
                ${videoPlaceholder}
                <span class="photo-status ${photo.aprovado ? 'approved' : 'pending'}">
                    ${photo.aprovado ? 'Aprovada' : 'Pendente'}
                </span>
                ${!photo.aprovado ? `
                    <div class="photo-actions">
                        <button class="btn-approve" onclick="adminPanel.approvePhoto('${photo.id}')">✓</button>
                        <button class="btn-reject" onclick="adminPanel.deletePhoto('${photo.id}')">✕</button>
                    </div>
                ` : ''}
            </div>
        `;
        }).join('');
    }

    async approvePhoto(photoId) {
        try {
            // Try API first
            const response = await fetch(`/api/photos/${photoId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ approved: true })
            });

            if (response.ok) {
                // Update local data
                const photo = this.currentPhotos.find(p => p.id === photoId);
                if (photo) {
                    photo.aprovado = true;
                    this.updatePhotoCounts();
                    this.renderEventPhotos();
                    this.showSuccess('Foto aprovada! ✅');
                }
            } else {
                throw new Error('API error');
            }
        } catch (error) {
            // Fallback to localStorage
            const photo = this.currentPhotos.find(p => p.id === photoId);
            if (photo) {
                photo.aprovado = true;
                localStorage.setItem(`event_${this.currentEvent.token}_photos`, JSON.stringify(this.currentPhotos));
                this.updatePhotoCounts();
                this.renderEventPhotos();
                this.showSuccess('Foto aprovada localmente! ✅');
            }
        }
    }

    async deletePhoto(photoId) {
        if (!confirm('Tem certeza que deseja deletar esta foto?')) return;
        const token = this.currentEvent?.token;
        if (!token) {
            this.showError('Token do evento não encontrado');
            return;
        }

        try {
            // Try API first (token obrigatório: apenas criador pode excluir)
            const response = await fetch(`/api/photos/${photoId}?token=${encodeURIComponent(token)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.currentPhotos = this.currentPhotos.filter(p => p.id !== photoId);
                this.updatePhotoCounts();
                this.renderEventPhotos();
                this.showSuccess('Foto deletada! 🗑️');
            } else {
                const data = await response.json().catch(() => ({}));
                this.showError(data.error || 'Não foi possível excluir a foto.');
            }
        } catch (error) {
            this.showError(error.message || 'Erro ao excluir foto.');
        }
    }

    // ===== MODAL MANAGEMENT =====
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // ===== UTILITY FUNCTIONS =====
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 3001;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 3001;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    setupAutoRefresh() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.updateDashboardStats();
            if (this.currentEvent) {
                this.loadEventPhotos(this.currentEvent.token);
            }
        }, 30000);
    }
}

// ===== GLOBAL FUNCTIONS =====
function openCreateEventModal() {
    document.getElementById('createEventModal').classList.add('active');
}

function closeCreateEventModal() {
    document.getElementById('createEventModal').classList.remove('active');
    document.getElementById('createEventForm').reset();
}

function closeEventDetailsModal() {
    document.getElementById('eventDetailsModal').classList.remove('active');
    adminPanel.currentEvent = null;
    adminPanel.currentPhotos = [];
}

function filterPhotos(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Update current filter and re-render
    adminPanel.currentFilter = filter;
    adminPanel.renderEventPhotos();
}

function copyLink(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    document.execCommand('copy');
    
    adminPanel.showSuccess('Link copiado! 📋');
}

function downloadQRCode() {
    const qrCanvas = document.querySelector('#eventQRCode canvas');
    if (qrCanvas) {
        const url = qrCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qrcode-${adminPanel.currentEvent.token}.png`;
        link.href = url;
        link.click();
        
        adminPanel.showSuccess('QR Code baixado! 📥');
    } else {
        adminPanel.showError('QR Code não encontrado');
    }
}

function printQRCode() {
    const qrContainer = document.getElementById('eventQRCode');
    if (qrContainer) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>QR Code - ${adminPanel.currentEvent.nome_evento}</title>
                    <style>
                        body { 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 100vh; 
                            margin: 0; 
                            font-family: Arial, sans-serif;
                        }
                        .print-container {
                            text-align: center;
                        }
                        h1 { margin-bottom: 20px; }
                        .qr-code { margin: 20px 0; }
                        p { margin-top: 20px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <h1>${adminPanel.currentEvent.nome_evento}</h1>
                        <div class="qr-code">${qrContainer.innerHTML}</div>
                        <p>Escaneie para enviar suas fotos!</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        
        adminPanel.showSuccess('QR Code enviado para impressão! 🖨️');
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('eternize_admin_session');
        window.location.href = 'login.html';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize admin panel
const adminPanel = new AdminPanel();