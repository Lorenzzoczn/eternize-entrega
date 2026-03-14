// ===== CONVITE GENERATOR =====
// Sistema de geração de convites com QR Code

class ConviteGenerator {
    constructor() {
        this.currentPreset = 1;
        this.currentZoom = 100;
        this.eventData = {
            nome: 'Meu Evento Especial',
            data: this.formatDate(new Date()),
            mensagem: 'Escaneie o QR Code e compartilhe suas fotos deste momento especial conosco.',
            foto: null,
            token: this.getEventToken(),
            corPrincipal: '#E4D9B6',
            corSecundaria: '#FFD1DC',
            tamanho: 'a5'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEventData();
        this.renderConvite();
    }

    setupEventListeners() {
        // Inputs de texto
        document.getElementById('eventoNome')?.addEventListener('input', (e) => {
            this.eventData.nome = e.target.value || 'Meu Evento Especial';
            this.renderConvite();
        });

        document.getElementById('eventoData')?.addEventListener('change', (e) => {
            this.eventData.data = this.formatDate(new Date(e.target.value));
            this.renderConvite();
        });

        document.getElementById('eventoMensagem')?.addEventListener('input', (e) => {
            this.eventData.mensagem = e.target.value || 'Escaneie o QR Code e compartilhe suas fotos.';
            this.renderConvite();
        });

        // Upload de foto
        document.getElementById('eventoFoto')?.addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Cores
        document.getElementById('corPrincipal')?.addEventListener('input', (e) => {
            this.eventData.corPrincipal = e.target.value;
            this.updateColors();
        });

        document.getElementById('corSecundaria')?.addEventListener('input', (e) => {
            this.eventData.corSecundaria = e.target.value;
            this.updateColors();
        });

        // Tamanho
        document.getElementById('tamanhoConvite')?.addEventListener('change', (e) => {
            this.eventData.tamanho = e.target.value;
            this.updateSize();
        });

        // Presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetNum = parseInt(btn.dataset.preset);
                this.selectPreset(presetNum);
            });
        });

        // Zoom
        document.getElementById('zoomIn')?.addEventListener('click', () => this.zoom(10));
        document.getElementById('zoomOut')?.addEventListener('click', () => this.zoom(-10));

        // Download (só após verificar pagamento)
        document.getElementById('downloadPNG')?.addEventListener('click', () => this.downloadPNG());
        document.getElementById('downloadPDF')?.addEventListener('click', () => this.downloadPDF());
    }

    /** Base URL da API (igual origem ou window.ETERNIZE_API_BASE em produção). */
    getApiBase() {
        return (typeof window !== 'undefined' && window.ETERNIZE_API_BASE) || '';
    }

    /**
     * Antes verificava plano pago para permitir download. Agora o checkout não é mais validação:
     * todos podem baixar convite/QR. O checkout permanece disponível, mas não bloqueia acesso.
     * @returns {Promise<boolean>} sempre true (acesso liberado).
     */
    async ensurePaidBeforeDownload() {
        return true;
    }

    /**
     * Persiste o evento/convite no dashboard (localStorage eternize_events) para que
     * o cliente veja o evento salvo ao voltar ao dashboard e possa acessar QR/link/convite.
     */
    saveEventToDashboard() {
        const events = JSON.parse(localStorage.getItem('eternize_events')) || [];
        const existing = events.find(e => e.token === this.eventData.token);
        const dateInput = document.getElementById('eventoData');
        const dataEvento = (dateInput && dateInput.value) ? dateInput.value : this.getDateInputValue(this.eventData.data);

        const eventPayload = {
            id: existing ? existing.id : `event_${Date.now()}`,
            token: this.eventData.token,
            name: this.eventData.nome,
            nome_evento: this.eventData.nome,
            date: dataEvento,
            data_evento: dataEvento,
            type: existing ? (existing.type || 'outro') : 'outro',
            theme: existing ? (existing.theme || 'neutro') : 'neutro',
            description: existing ? (existing.description || '') : '',
            cores: {
                primaria: this.eventData.corPrincipal || '#E4D9B6',
                secundaria: this.eventData.corSecundaria || '#FFD1DC'
            },
            createdAt: existing ? existing.createdAt : new Date().toISOString(),
            contributors: existing ? (existing.contributors || 0) : 0,
            url_memoria: `${window.location.origin}/memoria/${this.eventData.token}`,
            conviteCriado: true,
            conviteCriadoEm: new Date().toISOString()
        };

        if (!existing) {
            events.push(eventPayload);
        } else {
            const idx = events.findIndex(e => e.token === this.eventData.token);
            events[idx] = { ...existing, ...eventPayload };
        }

        localStorage.setItem('eternize_events', JSON.stringify(events));
        localStorage.setItem('currentEvent', JSON.stringify({
            id: eventPayload.id,
            token: this.eventData.token,
            nome_evento: this.eventData.nome,
            data_evento: dataEvento,
            name: this.eventData.nome,
            date: dataEvento,
            url_memoria: eventPayload.url_memoria
        }));

        // Garantir evento na API para que /memoria/:token carregue a página bonita com dados
        const base = this.getApiBase();
        fetch(`${base}/api/events/from-convite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: this.eventData.token,
                nome_evento: this.eventData.nome,
                data_evento: dataEvento,
                tema: eventPayload.theme || 'neutro',
                cores: eventPayload.cores
            })
        }).catch(() => {});
    }

    loadEventData() {
        // Carregar dados do evento do localStorage ou URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            this.eventData.token = token;
            // Buscar dados do evento da API
            this.fetchEventData(token);
        } else {
            // Usar dados de exemplo
            const savedEvent = localStorage.getItem('currentEvent');
            if (savedEvent) {
                const event = JSON.parse(savedEvent);
                this.eventData.nome = event.nome_evento || this.eventData.nome;
                this.eventData.data = this.formatDate(new Date(event.data_evento)) || this.eventData.data;
                this.eventData.token = event.token || this.eventData.token;
            }
        }

        // Preencher inputs
        document.getElementById('eventoNome').value = this.eventData.nome;
        document.getElementById('eventoData').value = this.getDateInputValue(this.eventData.data);
        document.getElementById('eventoMensagem').value = this.eventData.mensagem;
    }

    async fetchEventData(token) {
        try {
            const response = await fetch(`${this.getApiBase()}/api/events/${token}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.event) {
                    this.eventData.nome = data.event.nome_evento || data.event.name;
                    this.eventData.data = this.formatDate(new Date(data.event.data_evento || data.event.date));
                    this.eventData.token = data.event.token || token;
                    this.updateFormFromEventData();
                    this.renderConvite();
                    return;
                }
            }
        } catch (error) {
            console.log('API não disponível, tentando localStorage');
        }
        // Fallback: buscar evento em eternize_events pelo token (ex.: convite salvo só no dashboard)
        const events = JSON.parse(localStorage.getItem('eternize_events')) || [];
        const local = events.find(e => e.token === token);
        if (local) {
            this.eventData.nome = local.nome_evento || local.name;
            this.eventData.data = this.formatDate(new Date(local.data_evento || local.date));
            this.eventData.token = local.token || token;
            if (local.cores) {
                this.eventData.corPrincipal = local.cores.primaria;
                this.eventData.corSecundaria = local.cores.secundaria;
            }
            this.updateFormFromEventData();
            this.renderConvite();
        }
    }

    updateFormFromEventData() {
        document.getElementById('eventoNome').value = this.eventData.nome;
        document.getElementById('eventoData').value = this.getDateInputValue(this.eventData.data);
        const msgEl = document.getElementById('eventoMensagem');
        if (msgEl) msgEl.value = this.eventData.mensagem;
        this.updateColors();
    }

    selectPreset(presetNum) {
        this.currentPreset = presetNum;
        
        // Atualizar botões
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-preset="${presetNum}"]`)?.classList.add('active');
        
        this.renderConvite();
    }

    renderConvite() {
        const card = document.getElementById('conviteCard');
        if (!card) return;

        // Atualizar preset
        card.setAttribute('data-preset', this.currentPreset);
        
        // Obter template do preset
        const preset = getPreset(this.currentPreset);
        if (!preset) return;

        // Gerar HTML
        card.innerHTML = preset.generate(this.eventData);

        // Gerar QR Code
        this.generateQRCode();

        // Atualizar cores
        this.updateColors();

        // Atualizar tamanho
        this.updateSize();
    }

    generateQRCode() {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;

        // Limpar QR Code anterior
        qrContainer.innerHTML = '';

        // URL do evento
        const eventUrl = `${window.location.origin}/memoria/${this.eventData.token}`;

        // Gerar novo QR Code
        try {
            new QRCode(qrContainer, {
                text: eventUrl,
                width: 150,
                height: 150,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            qrContainer.innerHTML = '<p style="padding: 20px;">QR Code</p>';
        }
    }

    updateColors() {
        const card = document.getElementById('conviteCard');
        if (!card) return;

        card.style.setProperty('--cor-principal', this.eventData.corPrincipal);
        card.style.setProperty('--cor-secundaria', this.eventData.corSecundaria);
    }

    updateSize() {
        const card = document.getElementById('conviteCard');
        if (!card) return;

        // Remover classes de tamanho anteriores
        card.classList.remove('size-a5', 'size-a6', 'size-quadrado');
        
        // Adicionar nova classe
        card.classList.add(`size-${this.eventData.tamanho}`);
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida');
            return;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Imagem muito grande. Máximo 5MB');
            return;
        }

        // Ler arquivo
        const reader = new FileReader();
        reader.onload = (e) => {
            this.eventData.foto = e.target.result;
            
            // Mostrar preview
            const preview = document.getElementById('fotoPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.style.display = 'block';
            
            // Atualizar convite
            this.renderConvite();
        };
        reader.readAsDataURL(file);
    }

    zoom(delta) {
        this.currentZoom = Math.max(50, Math.min(150, this.currentZoom + delta));
        
        const card = document.getElementById('conviteCard');
        if (card) {
            card.style.transform = `scale(${this.currentZoom / 100})`;
        }

        document.getElementById('zoomLevel').textContent = `${this.currentZoom}%`;
    }

    /**
     * Garante que o QR code seja capturado pelo html2canvas: converte canvas do QR em <img>.
     * Retorna função para restaurar o QR (chamar após captura).
     */
    ensureQRCodeAsImageForCapture() {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return () => {};
        const canvas = qrContainer.querySelector('canvas');
        if (!canvas) return () => {};
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const img = document.createElement('img');
            img.src = dataUrl;
            img.alt = 'QR Code';
            img.style.width = canvas.width + 'px';
            img.style.height = canvas.height + 'px';
            img.style.display = 'block';
            qrContainer.innerHTML = '';
            qrContainer.appendChild(img);
            return () => {
                qrContainer.removeChild(img);
                this.generateQRCode();
            };
        } catch (e) {
            return () => {};
        }
    }

    async downloadPNG() {
        const canDownload = await this.ensurePaidBeforeDownload();
        if (!canDownload) return;

        this.saveEventToDashboard();
        this.showLoading('Gerando PNG...');

        try {
            const card = document.getElementById('conviteCard');
            const restoreQR = this.ensureQRCodeAsImageForCapture();
            await new Promise(r => setTimeout(r, 100));

            const originalTransform = card.style.transform;
            card.style.transform = 'scale(1)';

            const canvas = await html2canvas(card, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            card.style.transform = originalTransform;
            restoreQR();

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `convite-${this.eventData.nome.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.click();
                URL.revokeObjectURL(url);
                this.hideLoading();
                this.showSuccess('PNG baixado com sucesso!');
            }, 'image/png');

        } catch (error) {
            console.error('Erro ao gerar PNG:', error);
            this.hideLoading();
            alert('Erro ao gerar PNG. Tente novamente.');
        }
    }

    async downloadPDF() {
        const canDownload = await this.ensurePaidBeforeDownload();
        if (!canDownload) return;

        this.saveEventToDashboard();
        this.showLoading('Gerando PDF...');

        try {
            const card = document.getElementById('conviteCard');
            const restoreQR = this.ensureQRCodeAsImageForCapture();
            await new Promise(r => setTimeout(r, 100));

            const originalTransform = card.style.transform;
            card.style.transform = 'scale(1)';

            const canvas = await html2canvas(card, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            card.style.transform = originalTransform;
            restoreQR();

            const { jsPDF } = window.jspdf;
            let pdfWidth, pdfHeight;
            switch (this.eventData.tamanho) {
                case 'a5':
                    pdfWidth = 148;
                    pdfHeight = 210;
                    break;
                case 'a6':
                    pdfWidth = 105;
                    pdfHeight = 148;
                    break;
                case 'quadrado':
                    pdfWidth = 150;
                    pdfHeight = 150;
                    break;
                default:
                    pdfWidth = 148;
                    pdfHeight = 210;
            }

            const pdf = new jsPDF({
                orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`convite-${this.eventData.nome.toLowerCase().replace(/\s+/g, '-')}.pdf`);

            this.hideLoading();
            this.showSuccess('PDF baixado com sucesso!');

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.hideLoading();
            alert('Erro ao gerar PDF. Tente novamente.');
        }
    }

    showLoading(text = 'Processando...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        if (overlay) {
            loadingText.textContent = text;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    formatDate(date) {
        if (!date || !(date instanceof Date) || isNaN(date)) {
            return new Date().toLocaleDateString('pt-BR');
        }
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    getDateInputValue(dateString) {
        // Converter "01 de janeiro de 2024" para "2024-01-01"
        try {
            const parts = dateString.split(' de ');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const months = {
                    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
                    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
                    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
                };
                const month = months[parts[1].toLowerCase()];
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }
        } catch (error) {
            console.error('Erro ao converter data:', error);
        }
        return new Date().toISOString().split('T')[0];
    }

    getEventToken() {
        // Tentar obter token do evento atual
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) return token;

        const savedEvent = localStorage.getItem('currentEvent');
        if (savedEvent) {
            const event = JSON.parse(savedEvent);
            return event.token || this.generateDemoToken();
        }

        return this.generateDemoToken();
    }

    generateDemoToken() {
        // Gerar token de demonstração
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 12; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.conviteGenerator = new ConviteGenerator();
});

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
