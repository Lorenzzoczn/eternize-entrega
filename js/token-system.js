// ===== TOKEN-BASED SYSTEM =====
// Sistema de tokens para QR Codes únicos

class TokenSystem {
    constructor() {
        this.baseUrl = window.location.origin;
        this.themes = {
            'toy-story': {
                name: 'Toy Story',
                colors: {
                    primary: '#FFD700',
                    secondary: '#FF0000',
                    accent: '#0066CC'
                },
                background: 'linear-gradient(135deg, #FFD700 0%, #FF6B6B 100%)',
                icon: '🚀'
            },
            'princesas': {
                name: 'Princesas',
                colors: {
                    primary: '#FFB6C1',
                    secondary: '#DDA0DD',
                    accent: '#FFD700'
                },
                background: 'linear-gradient(135deg, #FFB6C1 0%, #DDA0DD 100%)',
                icon: '👑'
            },
            'neutro': {
                name: 'Neutro',
                colors: {
                    primary: '#E4D9B6',
                    secondary: '#FFD1DC',
                    accent: '#ADD8E6'
                },
                background: 'linear-gradient(135deg, #E4D9B6 0%, #FFD1DC 100%)',
                icon: '✨'
            }
        };
    }

    // Generate unique token
    generateToken() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 12; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    // Create memory page URL
    createMemoryUrl(token) {
        return `${this.baseUrl}/memoria/${token}`;
    }

    // Get theme configuration
    getTheme(themeName) {
        return this.themes[themeName] || this.themes['neutro'];
    }

    // Generate styled QR Code
    async generateStyledQRCode(url, theme = 'neutro', options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const themeConfig = this.getTheme(theme);
                const container = document.createElement('div');
                
                // QR Code options
                const qrOptions = {
                    text: url,
                    width: options.size || 300,
                    height: options.size || 300,
                    colorDark: options.darkColor || themeConfig.colors.primary,
                    colorLight: options.lightColor || '#FFFFFF',
                    correctLevel: QRCode.CorrectLevel.H,
                    ...options.qrOptions
                };

                // Create QR Code
                const qrCode = new QRCode(container, qrOptions);

                // Wait for QR code generation
                setTimeout(() => {
                    const canvas = container.querySelector('canvas');
                    if (canvas) {
                        // Add custom styling if needed
                        if (options.addLogo) {
                            this.addLogoToQR(canvas, themeConfig.icon, themeConfig.colors.accent);
                        }
                        
                        resolve({
                            canvas: canvas,
                            dataUrl: canvas.toDataURL('image/png'),
                            theme: themeConfig
                        });
                    } else {
                        reject(new Error('Failed to generate QR code'));
                    }
                }, 100);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Add logo/icon to QR code center
    addLogoToQR(canvas, icon, color) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const logoSize = canvas.width * 0.15;

        // Draw white background circle
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize, 0, 2 * Math.PI);
        ctx.fill();

        // Draw colored border
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw icon/emoji
        ctx.fillStyle = color;
        ctx.font = `${logoSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, centerX, centerY);
    }

    // Create event data structure
    createEventData(formData) {
        const token = this.generateToken();
        const theme = this.getTheme(formData.tema);
        
        return {
            id: `event_${Date.now()}`,
            token: token,
            nome_evento: formData.nome_evento,
            data_evento: formData.data_evento,
            tema: formData.tema,
            cores: theme.colors,
            criado_em: new Date().toISOString(),
            url_memoria: this.createMemoryUrl(token),
            qr_code_url: null, // Will be set after QR generation
            ativo: true
        };
    }

    // Validate token format
    isValidToken(token) {
        return /^[a-z0-9]{12}$/.test(token);
    }

    // Rate limiting for uploads
    checkRateLimit(token, maxUploads = 50, timeWindow = 3600000) { // 50 uploads per hour
        const key = `rate_limit_${token}`;
        const now = Date.now();
        
        let uploads = JSON.parse(localStorage.getItem(key)) || [];
        
        // Remove old uploads outside time window
        uploads = uploads.filter(timestamp => now - timestamp < timeWindow);
        
        if (uploads.length >= maxUploads) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: uploads[0] + timeWindow
            };
        }

        // Add current upload
        uploads.push(now);
        localStorage.setItem(key, JSON.stringify(uploads));

        return {
            allowed: true,
            remaining: maxUploads - uploads.length,
            resetTime: now + timeWindow
        };
    }

    // Security validation for uploads
    validateUpload(file, token) {
        const errors = [];

        // Validate token
        if (!this.isValidToken(token)) {
            errors.push('Token inválido');
        }

        // Validate file
        if (!file) {
            errors.push('Nenhum arquivo selecionado');
        } else {
            // Check file type
            if (!file.type.startsWith('image/')) {
                errors.push('Apenas imagens são permitidas');
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                errors.push('Arquivo muito grande. Máximo 10MB');
            }

            // Check file name
            if (file.name.length > 255) {
                errors.push('Nome do arquivo muito longo');
            }
        }

        // Check rate limit
        const rateLimit = this.checkRateLimit(token);
        if (!rateLimit.allowed) {
            errors.push('Muitos uploads. Tente novamente mais tarde');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            rateLimit: rateLimit
        };
    }

    // Generate memory page HTML
    generateMemoryPageHTML(event, photos = []) {
        const theme = this.getTheme(event.tema);
        const approvedPhotos = photos.filter(p => p.aprovado);

        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${event.nome_evento} - Eternize</title>
    <link rel="stylesheet" href="/css/memoria.css">
    <style>
        :root {
            --theme-primary: ${theme.colors.primary};
            --theme-secondary: ${theme.colors.secondary};
            --theme-accent: ${theme.colors.accent};
            --theme-background: ${theme.background};
        }
    </style>
</head>
<body class="theme-${event.tema}">
    <div class="memoria-container">
        <header class="memoria-header">
            <div class="theme-icon">${theme.icon}</div>
            <h1>${event.nome_evento}</h1>
            <p class="evento-data">${new Date(event.data_evento).toLocaleDateString('pt-BR')}</p>
            <p class="memoria-subtitle">Compartilhe seus momentos especiais</p>
        </header>

        <section class="upload-section">
            <div class="upload-card">
                <h2>📸 Enviar Foto</h2>
                <form id="uploadForm" enctype="multipart/form-data">
                    <input type="file" id="photoInput" accept="image/*" required>
                    <input type="text" id="messageInput" placeholder="Deixe uma mensagem (opcional)" maxlength="200">
                    <input type="text" id="nameInput" placeholder="Seu nome (opcional)" maxlength="50">
                    <button type="submit" class="btn-upload">
                        <span class="upload-icon">📤</span>
                        Enviar Foto
                    </button>
                </form>
                <div id="uploadStatus" class="upload-status"></div>
            </div>
        </section>

        <section class="gallery-section">
            <h2>🖼️ Galeria de Momentos</h2>
            <div class="photos-grid" id="photosGrid">
                ${approvedPhotos.map(photo => `
                    <div class="photo-item">
                        <img src="${photo.url}" alt="Momento especial" loading="lazy">
                        ${photo.message ? `<p class="photo-message">${photo.message}</p>` : ''}
                        ${photo.uploaded_by !== 'anonymous' ? `<p class="photo-author">Por: ${photo.uploaded_by}</p>` : ''}
                    </div>
                `).join('')}
            </div>
            ${approvedPhotos.length === 0 ? `
                <div class="empty-gallery">
                    <div class="empty-icon">${theme.icon}</div>
                    <p>Seja o primeiro a compartilhar um momento!</p>
                </div>
            ` : ''}
        </section>
    </div>

    <script src="/js/memoria-page.js"></script>
    <script>
        window.EVENT_TOKEN = '${event.token}';
        window.EVENT_DATA = ${JSON.stringify(event)};
    </script>
</body>
</html>`;
    }
}

// Export instance
export const tokenSystem = new TokenSystem();