// ===== PREMIUM FEATURES MANAGER =====
// Gerenciamento de recursos premium e limitações

class PremiumFeatures {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.premiumStatus = null;
        
        this.init();
    }

    async init() {
        if (this.currentUser) {
            await this.loadPremiumStatus();
            this.setupUI();
        }
    }

    getCurrentUser() {
        const userData = localStorage.getItem('eternize_user');
        return userData ? JSON.parse(userData) : null;
    }

    async loadPremiumStatus() {
        try {
            const userId = this.currentUser.id || this.currentUser.email;
            this.premiumStatus = await PaymentSystem.checkUserPremium(userId);
            
            // Atualizar dados do usuário
            this.currentUser.isPremium = this.premiumStatus.isPremium;
            this.currentUser.features = this.premiumStatus.features;
            localStorage.setItem('eternize_user', JSON.stringify(this.currentUser));
            
        } catch (error) {
            console.error('Error loading premium status:', error);
            this.premiumStatus = {
                isPremium: false,
                features: {},
                planType: 'basic'
            };
        }
    }

    setupUI() {
        // Adicionar badge premium no navbar
        this.addPremiumBadge();
        
        // Mostrar/ocultar recursos premium
        this.togglePremiumFeatures();
        
        // Adicionar listeners para verificações de limite
        this.setupLimitChecks();
    }

    addPremiumBadge() {
        if (!this.premiumStatus?.isPremium) return;

        const userName = document.getElementById('userName');
        if (userName) {
            const badge = document.createElement('span');
            badge.className = 'premium-badge';
            badge.innerHTML = '👑 Premium';
            badge.style.cssText = `
                display: inline-block;
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 700;
                margin-left: 10px;
                vertical-align: middle;
            `;
            userName.appendChild(badge);
        }
    }

    togglePremiumFeatures() {
        const isPremium = this.premiumStatus?.isPremium;

        // Elementos que devem ser mostrados apenas para premium
        document.querySelectorAll('[data-premium-only]').forEach(element => {
            element.style.display = isPremium ? 'block' : 'none';
        });

        // Elementos que devem ser mostrados apenas para básico
        document.querySelectorAll('[data-basic-only]').forEach(element => {
            element.style.display = isPremium ? 'none' : 'block';
        });

        // Adicionar indicadores de recurso premium
        document.querySelectorAll('[data-premium-feature]').forEach(element => {
            if (!isPremium) {
                element.classList.add('premium-locked');
                element.style.position = 'relative';
                element.style.opacity = '0.6';
                element.style.pointerEvents = 'none';

                const lockIcon = document.createElement('span');
                lockIcon.className = 'premium-lock-icon';
                lockIcon.innerHTML = '🔒';
                lockIcon.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 1.5rem;
                    z-index: 10;
                `;
                element.appendChild(lockIcon);
            }
        });
    }

    setupLimitChecks() {
        // Verificar limite ao criar evento
        const createEventBtn = document.querySelector('[data-action="create-event"]');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', async (e) => {
                if (!this.premiumStatus?.isPremium) {
                    const canCreate = await this.checkEventLimit();
                    if (!canCreate) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });
        }

        // Verificar limite ao fazer upload
        const uploadInputs = document.querySelectorAll('input[type="file"][data-event-upload]');
        uploadInputs.forEach(input => {
            input.addEventListener('change', async (e) => {
                if (!this.premiumStatus?.isPremium) {
                    const eventId = input.dataset.eventId;
                    const canUpload = await this.checkPhotoLimit(eventId);
                    if (!canUpload) {
                        e.preventDefault();
                        input.value = '';
                    }
                }
            });
        });
    }

    async checkEventLimit() {
        const userId = this.currentUser.id || this.currentUser.email;
        const limitCheck = await PaymentSystem.checkEventLimit(userId);

        if (!limitCheck.canCreate) {
            this.showUpgradeModal({
                title: 'Limite de Eventos Atingido',
                message: limitCheck.message,
                feature: 'Eventos Ilimitados',
                icon: '🎉'
            });
            return false;
        }

        return true;
    }

    async checkPhotoLimit(eventId) {
        const userId = this.currentUser.id || this.currentUser.email;
        const limitCheck = await PaymentSystem.checkPhotoLimit(eventId, userId);

        if (!limitCheck.canUpload) {
            this.showUpgradeModal({
                title: 'Limite de Fotos Atingido',
                message: limitCheck.message,
                feature: 'Upload Ilimitado',
                icon: '📸'
            });
            return false;
        }

        return true;
    }

    showUpgradeModal(options) {
        const { title, message, feature, icon } = options;

        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="upgrade-modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="upgrade-modal-content">
                <button class="upgrade-modal-close" onclick="this.closest('.upgrade-modal').remove()">×</button>
                <div class="upgrade-modal-icon">${icon}</div>
                <h2>${title}</h2>
                <p>${message}</p>
                <div class="upgrade-features">
                    <h3>Com o Premium você tem:</h3>
                    <ul>
                        <li>✓ Eventos ilimitados</li>
                        <li>✓ Upload ilimitado de fotos</li>
                        <li>✓ QR Code personalizado</li>
                        <li>✓ Galeria privada</li>
                        <li>✓ Download de todas as fotos</li>
                    </ul>
                </div>
                <div class="upgrade-modal-actions">
                    <a href="plans.html" class="btn btn-primary btn-large">
                        👑 Fazer Upgrade Agora
                    </a>
                    <button class="btn btn-secondary" onclick="this.closest('.upgrade-modal').remove()">
                        Continuar com Básico
                    </button>
                </div>
                <p class="upgrade-note">A partir de R$ 29,90/mês</p>
            </div>
        `;

        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .upgrade-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            .upgrade-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }

            .upgrade-modal-content {
                position: relative;
                background: white;
                border-radius: 25px;
                padding: 50px 40px;
                max-width: 600px;
                width: 90%;
                text-align: center;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }

            .upgrade-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #999;
                transition: color 0.3s;
            }

            .upgrade-modal-close:hover {
                color: #333;
            }

            .upgrade-modal-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }

            .upgrade-modal-content h2 {
                font-size: 2rem;
                margin-bottom: 15px;
                color: #333;
            }

            .upgrade-modal-content > p {
                font-size: 1.1rem;
                color: #666;
                margin-bottom: 30px;
                line-height: 1.6;
            }

            .upgrade-features {
                background: rgba(228, 217, 182, 0.1);
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 30px;
                text-align: left;
            }

            .upgrade-features h3 {
                font-size: 1.2rem;
                margin-bottom: 15px;
                color: #333;
                text-align: center;
            }

            .upgrade-features ul {
                list-style: none;
                padding: 0;
            }

            .upgrade-features li {
                padding: 8px 0;
                color: #333;
                font-size: 1rem;
            }

            .upgrade-modal-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 20px;
            }

            .upgrade-note {
                font-size: 0.9rem;
                color: #999;
                font-style: italic;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    // Verificar se recurso está disponível
    hasFeature(featureName) {
        if (!this.premiumStatus) return false;
        return this.premiumStatus.features[featureName] === true;
    }

    // Obter informações do plano
    getPlanInfo() {
        if (!this.premiumStatus) {
            return {
                name: 'Básico',
                type: 'basic',
                features: {
                    events: 1,
                    photosPerEvent: 50,
                    customQR: false,
                    privateGallery: false,
                    download: false
                }
            };
        }

        return {
            name: this.premiumStatus.isPremium ? 'Premium' : 'Básico',
            type: this.premiumStatus.planType,
            features: this.premiumStatus.features,
            expiresAt: this.premiumStatus.expiresAt
        };
    }

    // Mostrar banner de upgrade
    showUpgradeBanner() {
        if (this.premiumStatus?.isPremium) return;

        const banner = document.createElement('div');
        banner.className = 'upgrade-banner';
        banner.innerHTML = `
            <div class="upgrade-banner-content">
                <span class="upgrade-banner-icon">👑</span>
                <div class="upgrade-banner-text">
                    <strong>Desbloqueie recursos ilimitados!</strong>
                    <span>Eventos ilimitados, QR personalizado e muito mais</span>
                </div>
                <a href="plans.html" class="upgrade-banner-btn">Fazer Upgrade</a>
                <button class="upgrade-banner-close" onclick="this.closest('.upgrade-banner').remove()">×</button>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .upgrade-banner {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                animation: slideInRight 0.5s ease;
            }

            .upgrade-banner-content {
                background: linear-gradient(135deg, #E4D9B6 0%, #FFD1DC 100%);
                padding: 20px 25px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 15px;
                max-width: 500px;
            }

            .upgrade-banner-icon {
                font-size: 2rem;
            }

            .upgrade-banner-text {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .upgrade-banner-text strong {
                color: #333;
                font-size: 1rem;
            }

            .upgrade-banner-text span {
                color: #666;
                font-size: 0.85rem;
            }

            .upgrade-banner-btn {
                background: #333;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s;
            }

            .upgrade-banner-btn:hover {
                background: #000;
                transform: translateY(-2px);
            }

            .upgrade-banner-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                padding: 0 5px;
            }

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

            @media (max-width: 768px) {
                .upgrade-banner {
                    bottom: 10px;
                    right: 10px;
                    left: 10px;
                }

                .upgrade-banner-content {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(banner);

        // Auto-hide após 10 segundos
        setTimeout(() => {
            banner.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => banner.remove(), 500);
        }, 10000);
    }
}

// Inicializar gerenciador de recursos premium
const premiumFeatures = new PremiumFeatures();

// Mostrar banner de upgrade após 5 segundos (apenas para usuários básicos)
setTimeout(() => {
    premiumFeatures.showUpgradeBanner();
}, 5000);

// Exportar para uso global
window.PremiumFeatures = PremiumFeatures;
window.premiumFeatures = premiumFeatures;