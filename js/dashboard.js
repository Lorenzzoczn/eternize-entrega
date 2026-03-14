// Check if user is logged in
const userData = JSON.parse(localStorage.getItem('eternize_user'));
if (!userData) {
    window.location.href = 'login.html';
}

// Display user name
document.getElementById('userName').textContent = `Olá, ${userData.nome.split(' ')[0]}`;

// Load events from localStorage and API
let events = JSON.parse(localStorage.getItem('eternize_events')) || [];

// Token system integration
class TokenDashboard {
    constructor() {
        this.apiUrl = '/api';
        this.init();
    }

    async init() {
        await this.syncWithAPI();
    }

    async syncWithAPI() {
        try {
            // Try to sync with backend API
            const response = await fetch(`${this.apiUrl}/admin/events`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.events) {
                    events = result.events;
                    localStorage.setItem('eternize_events', JSON.stringify(events));
                }
            }
        } catch (error) {
            console.log('API not available, using localStorage');
        }
    }

    async createEventWithToken(eventData) {
        try {
            const response = await fetch(`${this.apiUrl}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const e = result.event;
                    return {
                        ...e,
                        name: e.nome_evento || e.name,
                        date: e.data_evento || e.date,
                        theme: e.tema || e.theme
                    };
                }
            }
            throw new Error('API failed');
        } catch (error) {
            // Fallback to local creation
            return this.createLocalEvent(eventData);
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
            name: eventData.nome_evento,
            date: eventData.data_evento,
            type: eventData.tipo || 'outro',
            description: eventData.descricao || '',
            theme: eventData.tema,
            cores: themeColors[eventData.tema],
            createdAt: new Date().toISOString(),
            contributors: 0,
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
}

const tokenDashboard = new TokenDashboard();

function isEventPremiumActive(event) {
    if (!event) return false;
    if (event.paymentStatus !== 'approved') return false;

    if (!event.planExpiresAt) {
        // Planos sem expiração (ex: vitalício)
        return true;
    }

    const now = new Date();
    const expiresAt = new Date(event.planExpiresAt);
    return expiresAt > now;
}

// Initialize dashboard
function initDashboard() {
    updateStats();
    renderEvents();
}

// Update statistics
function updateStats() {
    let totalPhotos = 0;
    let totalContributors = 0;

    events.forEach(event => {
        if (event.photoCount !== undefined) {
            totalPhotos += event.photoCount;
        } else {
            const photos = JSON.parse(localStorage.getItem(`event_${event.id}_photos`)) || [];
            totalPhotos += photos.length;
        }
        totalContributors += event.contributors || 0;
    });
    
    document.getElementById('totalPhotos').textContent = totalPhotos;
    document.getElementById('totalEvents').textContent = events.length;
    document.getElementById('totalContributors').textContent = totalContributors;
    document.getElementById('storageUsed').textContent = (totalPhotos * 0.003).toFixed(2) + ' GB';
}

// Render events
function renderEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (events.length === 0) {
        eventsGrid.style.display = 'none';
        emptyState.classList.add('show');
        return;
    }
    
    eventsGrid.style.display = 'grid';
    emptyState.classList.remove('show');
    
    eventsGrid.innerHTML = events.map(event => {
        const eventDate = new Date(event.date || event.data_evento);
        const photoCount = event.photoCount !== undefined ? event.photoCount : (JSON.parse(localStorage.getItem(`event_${event.id}_photos`)) || []).length;
        const formattedDate = eventDate.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });
        
        return `
            <div class="event-card" onclick="openEvent('${event.id}')">
                <div class="event-cover theme-${event.theme || event.tema || 'neutro'}">
                    ${getEventIcon(event.type)}
                    <span class="event-status active">● Ativo</span>
                </div>
                <div class="event-info">
                    <h3>${event.name || event.nome_evento}</h3>
                    <p class="event-date">📅 ${formattedDate}</p>
                    <div class="event-stats">
                        <div class="event-stat">
                            <span>📸</span>
                            <span>${photoCount} fotos</span>
                        </div>
                        <div class="event-stat">
                            <span>👥</span>
                            <span>${event.contributors || 0} pessoas</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get event icon based on type
function getEventIcon(type) {
    const icons = {
        casamento: '💍',
        aniversario: '🎂',
        formatura: '🎓',
        corporativo: '💼',
        debutante: '👑',
        outro: '🎉'
    };
    return icons[type] || '🎉';
}

// Create event flow
// Em vez de abrir o modal interno, redireciona para a página de convite
function openCreateModal() {
    window.location.href = 'convite.html';
}

function closeCreateModal() {
    const modal = document.getElementById('createModal');
    if (modal) {
        modal.classList.remove('active');
    }
    const form = document.getElementById('createEventForm');
    if (form) {
        form.reset();
    }
}

// Handle create event form
document.getElementById('createEventForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const eventData = {
        nome_evento: document.getElementById('eventName').value,
        data_evento: document.getElementById('eventDate').value,
        tipo: document.getElementById('eventType').value,
        descricao: document.getElementById('eventDescription').value,
        tema: document.querySelector('input[name="theme"]:checked').value
    };
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Criando...';
    submitBtn.disabled = true;
    
    try {
        const newEvent = await tokenDashboard.createEventWithToken(eventData);
        events.push(newEvent);
        localStorage.setItem('eternize_events', JSON.stringify(events));
        
        closeCreateModal();
        initDashboard();
        
        // Show success message with token info
        alert(`Evento criado com sucesso! 🎉\n\nToken: ${newEvent.token}\nURL: ${newEvent.url_memoria}`);
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Erro ao criar evento. Tente novamente.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Open event details
let currentEventId = null;
let currentEventPhotos = [];
let currentPhotoFilter = 'all';

function openEvent(eventId) {
    currentEventId = eventId;
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Acesso ao QR Code e download não depende mais de validação de pagamento
    document.getElementById('modalEventName').textContent = event.name || event.nome_evento;
    
    // Generate share link using token if available
    const shareUrl = event.url_memoria || event.token 
        ? `${window.location.origin}/memoria/${event.token}`
        : `${window.location.origin}/eternize-checkout/upload.html?event=${event.id}`;
    
    document.getElementById('shareLink').value = shareUrl;
    
    // Generate QR Code
    generateQRCode(shareUrl);
    
    // Load photos (API quando tem token, senão localStorage)
    loadEventPhotos(eventId);
    
    document.getElementById('eventModal').classList.add('active');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
    currentEventId = null;
}

// Load event photos (da API quando o evento tem token, para mostrar fotos enviadas via QR)
async function loadEventPhotos(eventId) {
    const event = events.find(e => e.id === eventId);
    let photos = [];

    if (event && event.token) {
        try {
            const response = await fetch(`/api/photos/${event.token}`);
            const data = await response.json();
            if (data.success && data.photos) {
                photos = data.photos.map(p => ({
                    id: p.id,
                    url: p.url || p.thumbnail,
                    thumbnail: p.thumbnail,
                    mediaType: p.mediaType || 'image',
                    status: p.aprovado ? 'approved' : 'pending'
                }));
            }
        } catch (err) {
            console.warn('API de fotos indisponível, usando localStorage', err);
        }
    }

    if (photos.length === 0) {
        photos = JSON.parse(localStorage.getItem(`event_${eventId}_photos`)) || [];
    }

    currentEventPhotos = photos;
    currentPhotoFilter = 'all';

    const allCount = photos.length;
    const pendingCount = photos.filter(p => p.status === 'pending').length;
    const approvedCount = photos.filter(p => p.status === 'approved').length;

    document.getElementById('countAll').textContent = allCount;
    document.getElementById('countPending').textContent = pendingCount;
    document.getElementById('countApproved').textContent = approvedCount;

    renderPhotos(photos, 'all');
}

// Render photos
function renderPhotos(photos, filter = 'all') {
    const photosGrid = document.getElementById('photosGrid');
    const emptyPhotos = document.getElementById('emptyPhotos');
    
    let filteredPhotos = photos;
    if (filter !== 'all') {
        filteredPhotos = photos.filter(p => p.status === filter);
    }
    
    if (filteredPhotos.length === 0) {
        photosGrid.style.display = 'none';
        emptyPhotos.classList.add('show');
        return;
    }
    
    photosGrid.style.display = 'grid';
    emptyPhotos.classList.remove('show');
    
    const isVideo = (p) => p.mediaType === 'video' || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(p.url || '');
    photosGrid.innerHTML = filteredPhotos.map(photo => {
        const safeId = (photo.id || '').replace(/'/g, "\\'");
        const video = isVideo(photo);
        const thumb = video ? '' : `<img src="${photo.url || photo.thumbnail || 'https://via.placeholder.com/300'}" alt="Mídia do evento">`;
        const videoPlaceholder = video ? '<div class="photo-item-video-placeholder"><span class="photo-item-video-icon">🎬</span><span>Vídeo</span></div>' : '';
        return `
        <div class="photo-item">
            ${thumb}
            ${videoPlaceholder}
            <span class="photo-status ${photo.status}">${photo.status === 'pending' ? 'Pendente' : 'Aprovada'}</span>
            <div class="photo-actions">
                ${photo.status !== 'approved' ? `<button type="button" class="btn-photo-action btn-approve" onclick="approvePhoto('${safeId}')" title="Aprovar">✓ Aprovar</button>` : ''}
                ${photo.status !== 'pending' ? `<button type="button" class="btn-photo-action btn-reject" onclick="rejectPhoto('${safeId}')" title="Desaprovar">↩ Desaprovar</button>` : ''}
                <button type="button" class="btn-photo-action btn-delete" onclick="deletePhoto('${safeId}')" title="Excluir">🗑 Excluir</button>
            </div>
        </div>
    `;
    }).join('');
}

// Filter photos
function filterPhotos(filter) {
    currentPhotoFilter = filter;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-btn[data-filter="${filter}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    renderPhotos(currentEventPhotos, filter);
}

// Approve photo
async function approvePhoto(photoId) {
    const event = events.find(e => e.id === currentEventId);
    if (event && event.token) {
        try {
            const res = await fetch(`/api/photos/${photoId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: true })
            });
            if (res.ok) await loadEventPhotos(currentEventId);
        } catch (err) {
            console.error(err);
        }
        return;
    }
    const photos = JSON.parse(localStorage.getItem(`event_${currentEventId}_photos`)) || [];
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
        photo.status = 'approved';
        localStorage.setItem(`event_${currentEventId}_photos`, JSON.stringify(photos));
        loadEventPhotos(currentEventId);
    }
}

// Desaprovar foto (volta para Pendentes)
async function rejectPhoto(photoId) {
    const event = events.find(e => e.id === currentEventId);
    if (event && event.token) {
        try {
            const res = await fetch(`/api/photos/${photoId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: false })
            });
            if (res.ok) await loadEventPhotos(currentEventId);
        } catch (err) {
            console.error(err);
        }
        return;
    }
    const photos = JSON.parse(localStorage.getItem(`event_${currentEventId}_photos`)) || [];
    const p = photos.find(x => x.id === photoId);
    if (p) p.status = 'pending';
    localStorage.setItem(`event_${currentEventId}_photos`, JSON.stringify(photos));
    loadEventPhotos(currentEventId);
}

// Excluir foto (remove da galeria)
async function deletePhoto(photoId) {
    if (!confirm('Excluir esta foto? Ela será removida permanentemente.')) return;
    const event = events.find(e => e.id === currentEventId);
    if (event && event.token) {
        try {
            const res = await fetch(`/api/photos/${photoId}?token=${encodeURIComponent(event.token)}`, { method: 'DELETE' });
            if (res.ok) await loadEventPhotos(currentEventId);
        } catch (err) {
            console.error(err);
        }
        return;
    }
    const photos = JSON.parse(localStorage.getItem(`event_${currentEventId}_photos`)) || [];
    const filtered = photos.filter(p => p.id !== photoId);
    localStorage.setItem(`event_${currentEventId}_photos`, JSON.stringify(filtered));
    loadEventPhotos(currentEventId);
}

// Excluir evento (e todas as fotos)
async function deleteEvent() {
    if (!currentEventId) return;
    const event = events.find(e => e.id === currentEventId);
    if (!event) return;
    if (!confirm('Excluir este evento? Todas as fotos serão removidas e esta ação não pode ser desfeita.')) return;

    if (event.token) {
        try {
            const res = await fetch(`/api/events/${event.token}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Erro ao excluir evento.');
                return;
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir evento. Tente novamente.');
            return;
        }
    }

    events = events.filter(e => e.id !== currentEventId);
    localStorage.setItem('eternize_events', JSON.stringify(events));
    localStorage.removeItem(`event_${currentEventId}_photos`);
    closeEventModal();
    initDashboard();
}

// Copy share link
function copyLink() {
    const input = document.getElementById('shareLink');
    input.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copiado';
    
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

// Generate QR Code
function generateQRCode(url) {
    const qrContainer = document.getElementById('qrCodeDisplay');
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Create QR code with enhanced styling
    const qrDiv = document.createElement('div');
    qrDiv.style.display = 'flex';
    qrDiv.style.justifyContent = 'center';
    qrDiv.style.padding = '20px';
    qrDiv.style.background = 'var(--white)';
    qrDiv.style.borderRadius = '15px';
    qrDiv.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    
    qrContainer.appendChild(qrDiv);
    
    // Get current event theme for QR styling
    const currentEvent = events.find(e => e.id === currentEventId);
    const themeColors = {
        'toy-story': '#FFD700',
        'princesas': '#FFB6C1',
        'neutro': '#E4D9B6'
    };
    
    const qrColor = themeColors[currentEvent?.theme] || '#333333';
    
    new QRCode(qrDiv, {
        text: url,
        width: 200,
        height: 200,
        colorDark: qrColor,
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Add event info below QR
    const infoDiv = document.createElement('div');
    infoDiv.style.textAlign = 'center';
    infoDiv.style.marginTop = '15px';
    infoDiv.style.fontSize = '0.9rem';
    infoDiv.style.color = '#666';
    infoDiv.innerHTML = `
        <p><strong>${currentEvent?.name || 'Evento'}</strong></p>
        <p>Token: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${currentEvent?.token || 'N/A'}</code></p>
    `;
    qrContainer.appendChild(infoDiv);
}

// Abre a página de convite para o evento atual (editar ou baixar novamente)
function openConvite() {
    if (!currentEventId) return;
    const event = events.find(e => e.id === currentEventId);
    if (!event || !event.token) return;
    window.location.href = `convite.html?token=${event.token}`;
}

// Download QR Code
function downloadQR() {
    const qrCanvas = document.querySelector('#qrCodeDisplay canvas');
    if (qrCanvas) {
        const url = qrCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qrcode-evento-${currentEventId}.png`;
        link.href = url;
        link.click();
    } else {
        alert('Gere o QR Code primeiro abrindo os detalhes do evento!');
    }
}

// Download all photos
function downloadAllPhotos() {
    alert('Funcionalidade de download de todas as fotos será implementada em breve!');
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('eternize_user');
        window.location.href = 'login.html';
    }
}

// Close modals on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Initialize
initDashboard();

// Add some demo data if no events exist
if (events.length === 0) {
    // Create a demo event
    const demoEvent = {
        id: 'demo-' + Date.now(),
        name: 'Meu Primeiro Evento',
        date: new Date().toISOString().split('T')[0],
        type: 'outro',
        description: 'Evento de demonstração',
        theme: 'rosa',
        createdAt: new Date().toISOString(),
        contributors: 5
    };
    
    // Add some demo photos
    const demoPhotos = [
        { id: '1', url: 'https://via.placeholder.com/300/FFD1DC/333333?text=Foto+1', status: 'approved' },
        { id: '2', url: 'https://via.placeholder.com/300/ADD8E6/333333?text=Foto+2', status: 'pending' },
        { id: '3', url: 'https://via.placeholder.com/300/98FF98/333333?text=Foto+3', status: 'approved' }
    ];
    
    // Uncomment to add demo data
    // events.push(demoEvent);
    // localStorage.setItem('eternize_events', JSON.stringify(events));
    // localStorage.setItem(`event_${demoEvent.id}_photos`, JSON.stringify(demoPhotos));
    // initDashboard();
}
