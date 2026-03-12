// ===== PAYMENT FUNCTIONALITY =====
// Sistema de pagamento com Mercado Pago

class PaymentSystem {
    constructor() {
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : '/api';
        
        this.mp = null;
        this.currentUser = this.getCurrentUser();
        
        this.init();
    }

    init() {
        // Inicializar Mercado Pago SDK
        this.initMercadoPago();
        
        // Setup billing toggle
        this.setupBillingToggle();
        
        // Check if returning from payment
        this.checkPaymentReturn();
    }

    initMercadoPago() {
        // Inicializar SDK do Mercado Pago
        // A public key deve vir do backend ou variável de ambiente
        const publicKey = 'APP_USR-YOUR-PUBLIC-KEY'; // Substituir pela sua public key
        
        if (typeof MercadoPago !== 'undefined') {
            this.mp = new MercadoPago(publicKey, {
                locale: 'pt-BR'
            });
        }
    }

    getCurrentUser() {
        // Buscar usuário logado
        const userData = localStorage.getItem('eternize_user');
        if (userData) {
            return JSON.parse(userData);
        }
        return null;
    }

    setupBillingToggle() {
        const toggle = document.getElementById('billingToggle');
        if (!toggle) return;

        toggle.addEventListener('change', (e) => {
            const isYearly = e.target.checked;
            
            // Toggle visibility of plans
            const monthlyPlan = document.getElementById('premiumMonthly');
            const yearlyPlan = document.getElementById('premiumYearly');
            
            if (monthlyPlan && yearlyPlan) {
                if (isYearly) {
                    monthlyPlan.style.display = 'none';
                    yearlyPlan.style.display = 'block';
                } else {
                    monthlyPlan.style.display = 'block';
                    yearlyPlan.style.display = 'none';
                }
            }
        });
    }

    async selectPlan(planType) {
        // Verificar se usuário está logado
        if (!this.currentUser) {
            this.showMessage('Você precisa estar logado para assinar um plano', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=plans.html';
            }, 2000);
            return;
        }

        // Mostrar loading
        this.showLoading(true);

        try {
            // Criar preferência de pagamento
            const response = await fetch(`${this.apiUrl}/create-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    plan: planType,
                    userId: this.currentUser.id || this.currentUser.email,
                    userEmail: this.currentUser.email,
                    userName: this.currentUser.nome || this.currentUser.name
                })
            });

            const result = await response.json();

            if (result.success) {
                // Salvar informações do pagamento
                this.savePaymentAttempt(planType, result.preferenceId);

                // Redirecionar para checkout do Mercado Pago
                window.location.href = result.initPoint;
            } else {
                throw new Error(result.error || 'Erro ao criar pagamento');
            }

        } catch (error) {
            console.error('Payment error:', error);
            this.showMessage('Erro ao processar pagamento. Tente novamente.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    savePaymentAttempt(planType, preferenceId) {
        const attempt = {
            planType: planType,
            preferenceId: preferenceId,
            userId: this.currentUser.id || this.currentUser.email,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('eternize_payment_attempt', JSON.stringify(attempt));
    }

    checkPaymentReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const paymentId = urlParams.get('payment_id');
        const status = urlParams.get('status');

        if (paymentStatus === 'success' || status === 'approved') {
            this.handlePaymentSuccess(paymentId);
        } else if (paymentStatus === 'failure' || status === 'rejected') {
            this.handlePaymentFailure();
        } else if (paymentStatus === 'pending' || status === 'pending') {
            this.handlePaymentPending();
        }
    }

    async handlePaymentSuccess(paymentId) {
        this.showMessage('Pagamento aprovado! Ativando seu plano premium...', 'success');

        // Aguardar processamento do webhook
        setTimeout(async () => {
            await this.checkPremiumStatus();
            
            // Redirecionar para dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html?premium=activated';
            }, 2000);
        }, 3000);
    }

    handlePaymentFailure() {
        this.showMessage('Pagamento não aprovado. Tente novamente ou escolha outro método de pagamento.', 'error');
        
        // Limpar tentativa de pagamento
        localStorage.removeItem('eternize_payment_attempt');
    }

    handlePaymentPending() {
        this.showMessage('Pagamento pendente. Você receberá uma confirmação assim que for aprovado.', 'warning');
    }

    async checkPremiumStatus() {
        try {
            const userId = this.currentUser.id || this.currentUser.email;
            const response = await fetch(`${this.apiUrl}/webhook/check-premium/${userId}`);
            const result = await response.json();

            if (result.success && result.isPremium) {
                // Atualizar dados do usuário localmente
                this.currentUser.plan = 'premium';
                this.currentUser.planType = result.planType;
                this.currentUser.features = result.features;
                
                localStorage.setItem('eternize_user', JSON.stringify(this.currentUser));
                
                return true;
            }

            return false;

        } catch (error) {
            console.error('Error checking premium status:', error);
            return false;
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(message, type = 'info') {
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 3001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Verificar se usuário tem acesso premium
    static async checkUserPremium(userId) {
        try {
            const apiUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000/api' 
                : '/api';

            const response = await fetch(`${apiUrl}/webhook/check-premium/${userId}`);
            const result = await response.json();

            return {
                isPremium: result.isPremium || false,
                features: result.features || {},
                planType: result.planType || 'basic',
                expiresAt: result.expiresAt || null
            };

        } catch (error) {
            console.error('Error checking premium:', error);
            return {
                isPremium: false,
                features: {},
                planType: 'basic'
            };
        }
    }

    // Verificar limite de eventos para usuário básico
    static async checkEventLimit(userId) {
        const premiumStatus = await PaymentSystem.checkUserPremium(userId);
        
        if (premiumStatus.isPremium) {
            return {
                canCreate: true,
                limit: Infinity,
                current: 0,
                message: 'Eventos ilimitados'
            };
        }

        // Usuário básico - limite de 1 evento
        const events = JSON.parse(localStorage.getItem('eternize_events')) || [];
        const userEvents = events.filter(e => e.userId === userId && e.ativo);

        return {
            canCreate: userEvents.length < 1,
            limit: 1,
            current: userEvents.length,
            message: userEvents.length >= 1 
                ? 'Você atingiu o limite de eventos do plano básico. Faça upgrade para criar mais eventos!'
                : 'Você pode criar mais 1 evento no plano básico'
        };
    }

    // Verificar limite de fotos para usuário básico
    static async checkPhotoLimit(eventId, userId) {
        const premiumStatus = await PaymentSystem.checkUserPremium(userId);
        
        if (premiumStatus.isPremium) {
            return {
                canUpload: true,
                limit: Infinity,
                current: 0,
                message: 'Upload ilimitado'
            };
        }

        // Usuário básico - limite de 50 fotos por evento
        const photos = JSON.parse(localStorage.getItem(`event_${eventId}_photos`)) || [];

        return {
            canUpload: photos.length < 50,
            limit: 50,
            current: photos.length,
            message: photos.length >= 50 
                ? 'Você atingiu o limite de 50 fotos do plano básico. Faça upgrade para upload ilimitado!'
                : `Você pode enviar mais ${50 - photos.length} fotos no plano básico`
        };
    }
}

// Inicializar sistema de pagamento
const paymentSystem = new PaymentSystem();

// Função global para selecionar plano
function selectPlan(planType) {
    paymentSystem.selectPlan(planType);
}

// Adicionar CSS para animações
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

    @keyframes slideOutRight {
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

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentSystem;
}