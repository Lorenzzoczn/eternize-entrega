// ===== LINK GENERATOR & QR CODE =====
// Sistema de geração de link único e QR Code

class LinkGenerator {
    constructor() {
        this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/view.html');
    }

    // Gerar ID único para a página
    generatePageId() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 11);
        return `${timestamp}${randomStr}`;
    }

    // Criar página e gerar link
    async createPage(pageData) {
        try {
            await storage.init();

            const pageId = this.generatePageId();
            const fullPageData = {
                id: pageId,
                ...pageData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await storage.savePage(fullPageData);

            const pageUrl = `${this.baseUrl}?id=${pageId}`;
            
            return {
                success: true,
                pageId: pageId,
                url: pageUrl,
                data: fullPageData
            };

        } catch (error) {
            console.error('Erro ao criar página:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Gerar QR Code
    generateQRCode(url, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container não encontrado:', containerId);
            return;
        }

        // Limpar container
        container.innerHTML = '';

        // Gerar QR Code usando biblioteca
        try {
            new QRCode(container, {
                text: url,
                width: 256,
                height: 256,
                colorDark: '#2c3e50',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            container.innerHTML = '<p style="color: red;">Erro ao gerar QR Code</p>';
        }
    }

    // Baixar QR Code como imagem
    downloadQRCode(containerId, filename = 'qrcode-eternize.png') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = container.querySelector('canvas');
        if (!canvas) {
            alert('QR Code não encontrado');
            return;
        }

        // Converter canvas para blob e baixar
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    // Copiar link para clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback para navegadores antigos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (err) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    }

    // Mostrar modal com link e QR Code
    showLinkModal(pageUrl, pageId) {
        const modal = document.createElement('div');
        modal.className = 'link-modal';
        modal.id = 'linkModal';
        
        modal.innerHTML = `
            <div class="link-modal-content">
                <button class="link-modal-close" onclick="document.getElementById('linkModal').remove()">×</button>
                
                <div class="link-modal-header">
                    <div class="success-icon-large">✓</div>
                    <h2>Página Criada com Sucesso!</h2>
                    <p>Compartilhe este link para que outros possam ver sua página</p>
                </div>

                <div class="link-section">
                    <label>Link da Página:</label>
                    <div class="link-input-group">
                        <input type="text" id="pageUrlInput" value="${pageUrl}" readonly>
                        <button class="btn-copy" onclick="linkGen.copyLink()">
                            📋 Copiar
                        </button>
                    </div>
                </div>

                <div class="qr-section">
                    <h3>QR Code</h3>
                    <p>Escaneie para acessar a página</p>
                    <div id="qrCodeContainer" class="qr-code-display"></div>
                    <button class="btn btn-secondary" onclick="linkGen.downloadQRCode('qrCodeContainer', 'eternize-${pageId}.png')">
                        📥 Baixar QR Code
                    </button>
                </div>

                <div class="link-actions">
                    <a href="${pageUrl}" class="btn btn-primary" target="_blank">
                        👁️ Ver Página
                    </a>
                    <button class="btn btn-secondary" onclick="document.getElementById('linkModal').remove()">
                        Fechar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Gerar QR Code
        setTimeout(() => {
            this.generateQRCode(pageUrl, 'qrCodeContainer');
        }, 100);

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Copiar link (usado no modal)
    async copyLink() {
        const input = document.getElementById('pageUrlInput');
        if (!input) return;

        const success = await this.copyToClipboard(input.value);
        
        const btn = document.querySelector('.btn-copy');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = success ? '✓ Copiado!' : '✗ Erro';
            btn.style.background = success ? '#4CAF50' : '#f44336';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        }
    }

    // Carregar página pelo ID da URL
    async loadPageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageId = urlParams.get('id');

        if (!pageId) {
            return {
                success: false,
                error: 'ID não encontrado na URL'
            };
        }

        try {
            await storage.init();
            const pageData = await storage.getPage(pageId);

            if (!pageData) {
                return {
                    success: false,
                    error: 'Página não encontrada'
                };
            }

            const photos = await storage.getPhotos(pageId);

            return {
                success: true,
                pageData: pageData,
                photos: photos
            };

        } catch (error) {
            console.error('Erro ao carregar página:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Instância global
const linkGen = new LinkGenerator();
