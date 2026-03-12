// ===== PAYMENT ROUTES =====
// Rotas para gerenciamento de pagamentos

const express = require('express');
const router = express.Router();
const mercadoPagoService = require('../services/mercadoPagoService');

// Criar preferência de pagamento
router.post('/create-payment', async (req, res) => {
    try {
        const { plan, userId, userEmail, userName } = req.body;

        // Validações
        if (!plan || !userId || !userEmail) {
            return res.status(400).json({
                success: false,
                error: 'Dados incompletos. Necessário: plan, userId, userEmail'
            });
        }

        // Validar planos disponíveis
        const validPlans = ['premium-monthly', 'premium-yearly', 'premium-lifetime'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({
                success: false,
                error: 'Plano inválido'
            });
        }

        // Criar preferência no Mercado Pago
        const result = await mercadoPagoService.createPaymentPreference({
            plan,
            userId,
            userEmail,
            userName: userName || 'Cliente Eternize'
        });

        if (result.success) {
            // Salvar tentativa de pagamento no banco (opcional)
            // await savePaymentAttempt({ userId, plan, preferenceId: result.preferenceId });

            res.json({
                success: true,
                preferenceId: result.preferenceId,
                initPoint: result.initPoint,
                sandboxInitPoint: result.sandboxInitPoint
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error in create-payment:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar pagamento'
        });
    }
});

// Verificar status de pagamento
router.get('/payment-status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const result = await mercadoPagoService.verifyPayment(paymentId);

        if (result.success) {
            res.json({
                success: true,
                status: result.status,
                approved: result.approved,
                details: {
                    statusDetail: result.statusDetail,
                    transactionAmount: result.transactionAmount,
                    dateApproved: result.dateApproved
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao verificar status do pagamento'
        });
    }
});

// Obter histórico de pagamentos do usuário
router.get('/payment-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await mercadoPagoService.getUserPayments(userId);

        if (result.success) {
            res.json({
                success: true,
                payments: result.payments.map(payment => ({
                    id: payment.id,
                    status: payment.status,
                    statusDetail: payment.status_detail,
                    amount: payment.transaction_amount,
                    dateCreated: payment.date_created,
                    dateApproved: payment.date_approved,
                    description: payment.description
                }))
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar histórico de pagamentos'
        });
    }
});

// Criar assinatura recorrente
router.post('/create-subscription', async (req, res) => {
    try {
        const { planId, userId, userEmail, cardToken } = req.body;

        if (!planId || !userId || !userEmail || !cardToken) {
            return res.status(400).json({
                success: false,
                error: 'Dados incompletos'
            });
        }

        const result = await mercadoPagoService.createSubscription({
            planId,
            userId,
            userEmail,
            cardToken
        });

        if (result.success) {
            res.json({
                success: true,
                subscriptionId: result.subscriptionId,
                status: result.status
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar assinatura'
        });
    }
});

// Cancelar assinatura
router.post('/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId, userId } = req.body;

        if (!subscriptionId || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Dados incompletos'
            });
        }

        // Verificar se o usuário é dono da assinatura (implementar validação)
        
        const result = await mercadoPagoService.cancelSubscription(subscriptionId);

        if (result.success) {
            // Atualizar status do usuário no banco
            // await updateUserPlan(userId, 'basic');

            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao cancelar assinatura'
        });
    }
});

module.exports = router;