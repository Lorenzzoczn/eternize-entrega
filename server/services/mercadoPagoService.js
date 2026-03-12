// ===== MERCADO PAGO SERVICE =====
// Serviço para integração com Mercado Pago

const mercadopago = require('mercadopago');

class MercadoPagoService {
    constructor() {
        // Configurar credenciais do Mercado Pago
        mercadopago.configure({
            access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
        });
    }

    // Criar preferência de pagamento
    async createPaymentPreference(paymentData) {
        try {
            const { plan, userId, userEmail, userName } = paymentData;

            // Definir valores dos planos
            const planPrices = {
                'premium-monthly': {
                    title: 'Eternize Premium - Mensal',
                    price: 29.90,
                    description: 'Eventos ilimitados + QR personalizado + Galeria privada'
                },
                'premium-yearly': {
                    title: 'Eternize Premium - Anual',
                    price: 299.90,
                    description: 'Eventos ilimitados + QR personalizado + Galeria privada (Economize 2 meses)'
                },
                'premium-lifetime': {
                    title: 'Eternize Premium - Vitalício',
                    price: 497.00,
                    description: 'Acesso vitalício a todos os recursos premium'
                }
            };

            const selectedPlan = planPrices[plan];
            if (!selectedPlan) {
                throw new Error('Plano inválido');
            }

            // Criar preferência
            const preference = {
                items: [
                    {
                        title: selectedPlan.title,
                        description: selectedPlan.description,
                        unit_price: selectedPlan.price,
                        quantity: 1,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    name: userName,
                    email: userEmail
                },
                external_reference: userId,
                metadata: {
                    user_id: userId,
                    plan_type: plan,
                    plan_name: selectedPlan.title
                },
                back_urls: {
                    success: `${process.env.APP_URL}/payment-success`,
                    failure: `${process.env.APP_URL}/payment-failure`,
                    pending: `${process.env.APP_URL}/payment-pending`
                },
                auto_return: 'approved',
                notification_url: `${process.env.APP_URL}/api/webhook/mercadopago`,
                statement_descriptor: 'ETERNIZE',
                payment_methods: {
                    excluded_payment_types: [],
                    installments: 12
                }
            };

            const response = await mercadopago.preferences.create(preference);

            return {
                success: true,
                preferenceId: response.body.id,
                initPoint: response.body.init_point,
                sandboxInitPoint: response.body.sandbox_init_point
            };

        } catch (error) {
            console.error('Error creating payment preference:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Buscar informações de pagamento
    async getPaymentInfo(paymentId) {
        try {
            const payment = await mercadopago.payment.get(paymentId);
            return {
                success: true,
                payment: payment.body
            };
        } catch (error) {
            console.error('Error getting payment info:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verificar status de pagamento
    async verifyPayment(paymentId) {
        try {
            const payment = await mercadopago.payment.get(paymentId);
            const paymentData = payment.body;

            return {
                success: true,
                status: paymentData.status,
                statusDetail: paymentData.status_detail,
                approved: paymentData.status === 'approved',
                userId: paymentData.external_reference,
                metadata: paymentData.metadata,
                transactionAmount: paymentData.transaction_amount,
                dateApproved: paymentData.date_approved
            };

        } catch (error) {
            console.error('Error verifying payment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Processar webhook do Mercado Pago
    async processWebhook(webhookData) {
        try {
            const { type, data } = webhookData;

            // Processar apenas notificações de pagamento
            if (type === 'payment') {
                const paymentId = data.id;
                const paymentInfo = await this.verifyPayment(paymentId);

                if (paymentInfo.success) {
                    return {
                        success: true,
                        action: paymentInfo.approved ? 'activate_premium' : 'payment_pending',
                        userId: paymentInfo.userId,
                        status: paymentInfo.status,
                        metadata: paymentInfo.metadata
                    };
                }
            }

            return {
                success: true,
                action: 'no_action_required'
            };

        } catch (error) {
            console.error('Error processing webhook:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Criar assinatura recorrente
    async createSubscription(subscriptionData) {
        try {
            const { planId, userId, userEmail, cardToken } = subscriptionData;

            // Criar assinatura
            const subscription = {
                preapproval_plan_id: planId,
                payer_email: userEmail,
                card_token_id: cardToken,
                external_reference: userId,
                status: 'authorized'
            };

            const response = await mercadopago.preapproval.create(subscription);

            return {
                success: true,
                subscriptionId: response.body.id,
                status: response.body.status
            };

        } catch (error) {
            console.error('Error creating subscription:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Cancelar assinatura
    async cancelSubscription(subscriptionId) {
        try {
            await mercadopago.preapproval.update({
                id: subscriptionId,
                status: 'cancelled'
            });

            return {
                success: true,
                message: 'Assinatura cancelada com sucesso'
            };

        } catch (error) {
            console.error('Error canceling subscription:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter histórico de pagamentos do usuário
    async getUserPayments(userId) {
        try {
            const filters = {
                external_reference: userId
            };

            const payments = await mercadopago.payment.search({
                qs: filters
            });

            return {
                success: true,
                payments: payments.body.results
            };

        } catch (error) {
            console.error('Error getting user payments:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new MercadoPagoService();