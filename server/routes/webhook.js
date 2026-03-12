// ===== WEBHOOK ROUTES =====
// Rotas para receber notificações do Mercado Pago

const express = require('express');
const router = express.Router();
const mercadoPagoService = require('../services/mercadoPagoService');

// Webhook do Mercado Pago
router.post('/mercadopago', async (req, res) => {
    try {
        console.log('Webhook received:', JSON.stringify(req.body, null, 2));

        const webhookData = req.body;

        // Processar webhook
        const result = await mercadoPagoService.processWebhook(webhookData);

        if (result.success) {
            // Executar ação baseada no resultado
            if (result.action === 'activate_premium') {
                await activateUserPremium(result.userId, result.metadata);
                
                console.log(`Premium activated for user: ${result.userId}`);
            } else if (result.action === 'payment_pending') {
                await updatePaymentStatus(result.userId, 'pending');
                
                console.log(`Payment pending for user: ${result.userId}`);
            }

            // Sempre retornar 200 para o Mercado Pago
            res.status(200).json({ success: true });
        } else {
            console.error('Webhook processing error:', result.error);
            res.status(200).json({ success: true }); // Retornar 200 mesmo com erro
        }

    } catch (error) {
        console.error('Webhook error:', error);
        // Sempre retornar 200 para evitar reenvios desnecessários
        res.status(200).json({ success: true });
    }
});

// Função para ativar premium do usuário
async function activateUserPremium(userId, metadata) {
    try {
        // Determinar tipo de plano
        const planType = metadata?.plan_type || 'premium-monthly';
        let expirationDate = null;

        // Calcular data de expiração
        if (planType === 'premium-monthly') {
            expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 1);
        } else if (planType === 'premium-yearly') {
            expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        } else if (planType === 'premium-lifetime') {
            expirationDate = null; // Sem expiração
        }

        // Atualizar no localStorage (fallback) ou banco de dados
        const userData = {
            userId: userId,
            plan: 'premium',
            planType: planType,
            paymentStatus: 'approved',
            activatedAt: new Date().toISOString(),
            expiresAt: expirationDate ? expirationDate.toISOString() : null,
            features: {
                unlimitedEvents: true,
                customQRCode: true,
                privateGallery: true,
                downloadPhotos: true,
                prioritySupport: true
            }
        };

        // Salvar no banco de dados (implementar conforme seu banco)
        // await db.collection('users').doc(userId).update(userData);

        // Salvar no localStorage como fallback
        if (typeof localStorage !== 'undefined') {
            const users = JSON.parse(localStorage.getItem('eternize_premium_users')) || {};
            users[userId] = userData;
            localStorage.setItem('eternize_premium_users', JSON.stringify(users));
        }

        console.log('User premium activated:', userData);
        return { success: true, userData };

    } catch (error) {
        console.error('Error activating premium:', error);
        return { success: false, error: error.message };
    }
}

// Função para atualizar status de pagamento
async function updatePaymentStatus(userId, status) {
    try {
        const statusData = {
            userId: userId,
            paymentStatus: status,
            updatedAt: new Date().toISOString()
        };

        // Atualizar no banco de dados
        // await db.collection('users').doc(userId).update(statusData);

        console.log('Payment status updated:', statusData);
        return { success: true };

    } catch (error) {
        console.error('Error updating payment status:', error);
        return { success: false, error: error.message };
    }
}

// Endpoint para teste de webhook (desenvolvimento)
router.post('/test-webhook', async (req, res) => {
    try {
        const { userId, action } = req.body;

        if (action === 'activate_premium') {
            const result = await activateUserPremium(userId, {
                plan_type: 'premium-monthly'
            });

            res.json({
                success: true,
                message: 'Premium ativado para teste',
                data: result
            });
        } else {
            res.json({
                success: false,
                error: 'Ação inválida'
            });
        }

    } catch (error) {
        console.error('Test webhook error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint para verificar status premium do usuário
router.get('/check-premium/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Buscar do banco de dados ou localStorage
        let userData = null;

        // Tentar buscar do localStorage (fallback)
        if (typeof localStorage !== 'undefined') {
            const users = JSON.parse(localStorage.getItem('eternize_premium_users')) || {};
            userData = users[userId];
        }

        if (userData) {
            // Verificar se o plano expirou
            const now = new Date();
            const expiresAt = userData.expiresAt ? new Date(userData.expiresAt) : null;
            const isExpired = expiresAt && now > expiresAt;

            res.json({
                success: true,
                isPremium: !isExpired,
                plan: userData.plan,
                planType: userData.planType,
                expiresAt: userData.expiresAt,
                isExpired: isExpired,
                features: userData.features
            });
        } else {
            res.json({
                success: true,
                isPremium: false,
                plan: 'basic',
                features: {
                    unlimitedEvents: false,
                    customQRCode: false,
                    privateGallery: false,
                    downloadPhotos: false,
                    prioritySupport: false
                }
            });
        }

    } catch (error) {
        console.error('Error checking premium status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;