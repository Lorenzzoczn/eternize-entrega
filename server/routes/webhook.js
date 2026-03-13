// ===== WEBHOOK ROUTES =====
// Notificações de pagamento: apenas ASAAS (Mercado Pago não utilizado)

const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');

// Helper: ativar plano para um evento (idempotente)
async function activatePlanForEvent({ eventId, planType, paymentId, amount, payerEmail, now }) {
    console.log('✔ plano ativado (evento):', { eventId, planType, paymentId });

    const eventsCollections = ['eventos', 'events'];
    let eventDocRef = null;
    let eventSnap = null;

    // Procurar o evento na coleção atual (prioriza "eventos" para compatibilidade)
    for (const col of eventsCollections) {
        const ref = db.collection(col).doc(eventId);
        const snap = await ref.get();
        if (snap.exists) {
            eventDocRef = ref;
            eventSnap = snap;
            break;
        }
    }

    if (!eventDocRef) {
        console.warn('⚠️ Evento não encontrado para ativação de plano:', eventId);
        return;
    }

    const eventData = eventSnap.data();

    // Idempotência: se já estiver aprovado com o mesmo plano e paymentId, não faz nada
    if (
        eventData.paymentStatus === 'approved' &&
        eventData.planType === planType &&
        eventData.lastPaymentId === paymentId
    ) {
        console.log('ℹ️ Plano já ativo para este evento. Nenhuma ação necessária.');
        return;
    }

    // Calcular expiração do plano
    let planExpiresAt = null;
    const baseDate = new Date(now);

    if (planType === 'premium-monthly') {
        baseDate.setMonth(baseDate.getMonth() + 1);
        planExpiresAt = baseDate.toISOString();
    } else if (planType === 'premium-yearly') {
        baseDate.setFullYear(baseDate.getFullYear() + 1);
        planExpiresAt = baseDate.toISOString();
    } else if (planType === 'premium-lifetime') {
        planExpiresAt = null;
    }

    const updatePayload = {
        paymentStatus: 'approved',
        planType,
        planActivatedAt: now.toISOString(),
        planExpiresAt,
        lastPaymentId: paymentId,
        lastPaymentAmount: amount,
        lastPaymentPayerEmail: payerEmail || null,
        updatedAt: now
    };

    await eventDocRef.set(updatePayload, { merge: true });

    console.log('✅ Evento atualizado com informações de plano:', {
        eventId,
        planType,
        planExpiresAt
    });

    // Atualizar / criar subscription vinculada ao evento
    const subscriptionRef = db.collection('subscriptions').doc(eventId);
    const subscriptionSnap = await subscriptionRef.get();

    const subscriptionData = {
        id: eventId,
        eventId,
        clientId: eventData.clientId || null,
        status: 'active',
        planType,
        provider: 'asaas',
        currentPeriodEnd: planExpiresAt,
        updatedAt: now
    };

    if (!subscriptionSnap.exists) {
        subscriptionData.createdAt = now;
    }

    await subscriptionRef.set(subscriptionData, { merge: true });

    console.log('✅ Subscription atualizada/criada para evento:', {
        eventId,
        planType,
        currentPeriodEnd: planExpiresAt
    });
}


// Função para ativar premium do usuário (persistindo no Firestore)
async function activateUserPremium(userId, metadata) {
    try {
        const now = new Date();

        // Determinar tipo de plano
        const planType = metadata?.plan_type || 'premium-monthly';
        let expirationDate = null;

        // Calcular data de expiração
        if (planType === 'premium-monthly') {
            expirationDate = new Date(now);
            expirationDate.setMonth(expirationDate.getMonth() + 1);
        } else if (planType === 'premium-yearly') {
            expirationDate = new Date(now);
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        } else if (planType === 'premium-lifetime') {
            expirationDate = null; // Sem expiração
        }

        const userData = {
            userId,
            plan: 'premium',
            planType,
            paymentStatus: 'approved',
            activatedAt: now.toISOString(),
            expiresAt: expirationDate ? expirationDate.toISOString() : null,
            features: {
                unlimitedEvents: true,
                customQRCode: true,
                privateGallery: true,
                downloadPhotos: true,
                prioritySupport: true
            },
            updatedAt: now
        };

        const userRef = db.collection('users').doc(userId);
        const snap = await userRef.get();

        if (!snap.exists) {
            userData.createdAt = now;
        }

        await userRef.set(userData, { merge: true });

        console.log('User premium activated (Firestore):', { userId, planType });
        return { success: true, userData };

    } catch (error) {
        console.error('Error activating premium:', error);
        return { success: false, error: error.message };
    }
}

// Função para atualizar status de pagamento (Firestore)
async function updatePaymentStatus(userId, status) {
    try {
        const now = new Date();
        const statusData = {
            userId,
            paymentStatus: status,
            updatedAt: now.toISOString()
        };

        const userRef = db.collection('users').doc(userId);
        await userRef.set(statusData, { merge: true });

        console.log('Payment status updated (Firestore):', statusData);
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

        const userRef = db.collection('users').doc(userId);
        const snap = await userRef.get();
        const userData = snap.exists ? snap.data() : null;

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

// ===== WEBHOOK ASAAS =====
// POST /api/webhooks/asaas
// Compatível com estrutura atual: atualiza Firestore (payments/pagamentos, eventos, subscriptions)

router.post('/asaas', async (req, res) => {
    try {
        // Estrutura típica do webhook Asaas:
        // {
        //   "id": "evt_xxx",
        //   "event": "PAYMENT_RECEIVED",
        //   "dateCreated": "2024-06-12 16:45:03",
        //   "payment": { ... }
        // }
        const { event, payment } = req.body || {};

        if (!event || !payment || !payment.id) {
            console.warn('⚠️ Webhook Asaas inválido ou incompleto. Ignorando.');
            return res.status(200).json({ success: true, ignored: true });
        }

        const paymentId = String(payment.id);
        console.log('✔ webhook recebido (Asaas)', { event, paymentId });
        const status = payment.status || null; // e.g. "PENDING", "CONFIRMED", "RECEIVED"
        const value = payment.value || null;
        const customer = payment.customer || {};
        const billingType = payment.billingType || null;

        // externalReference é onde podemos vincular ao nosso domínio (eventId, userId, etc.)
        const externalReference = payment.externalReference || null;

        const now = new Date();

        // 1) Atualizar coleção "pagamentos" (nova estrutura Asaas)
        const pagamentosRef = db.collection('pagamentos').doc(`asaas_${paymentId}`);
        await pagamentosRef.set(
            {
                id: `asaas_${paymentId}`,
                gateway: 'asaas',
                asaasPaymentId: paymentId,
                status: status ? status.toLowerCase() : null,
                value,
                billingType,
                externalReference,
                customer: {
                    id: customer.id || null,
                    name: customer.name || null,
                    email: customer.email || null,
                    cpfCnpj: customer.cpfCnpj || null
                },
                raw: payment,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            },
            { merge: true }
        );

        // 2) Atualizar coleção "payments" (mesmo ID que payment.js: asaas_${paymentId})
        const legacyPaymentRef = db.collection('payments').doc(`asaas_${paymentId}`);
        await legacyPaymentRef.set(
            {
                paymentId,
                status: status ? status.toLowerCase() : null,
                transactionAmount: value,
                externalReference,
                provider: 'asaas',
                updatedAt: now
            },
            { merge: true }
        );

        // 3) Se pagamento foi realmente recebido/confirmado, ativar plano/evento/assinatura
        const isPaid =
            event === 'PAYMENT_RECEIVED' ||
            status === 'RECEIVED' ||
            status === 'CONFIRMED';

        if (isPaid) {
            try {
                const ref = externalReference || null;
                const pagamentoSnap = await pagamentosRef.get();
                const pagamento = pagamentoSnap.exists ? pagamentoSnap.data() : {};

                if (ref) {
                    let handled = false;
                    const eventsCollections = ['eventos', 'events'];

                    for (const col of eventsCollections) {
                        const eventDocRef = db.collection(col).doc(ref);
                        const eventSnap = await eventDocRef.get();
                        if (eventSnap.exists) {
                            const eventData = eventSnap.data();
                            const planType =
                                pagamento.planId ||
                                eventData.planType ||
                                'premium-monthly';

                            await activatePlanForEvent({
                                eventId: ref,
                                planType,
                                paymentId,
                                amount: value,
                                payerEmail: customer.email || null,
                                now
                            });

                            handled = true;
                            break;
                        }
                    }

                    if (!handled) {
                        await activateUserPremium(ref, {
                            plan_type: pagamento.planId || 'premium-monthly'
                        });
                        await updatePaymentStatus(ref, 'approved');
                    }
                }
            } catch (activationError) {
                console.error('✔ erro Asaas (ativar plano):', activationError.message || activationError);
            }
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('✔ erro Asaas (webhook):', error.message || error);
        return res.status(200).json({ success: true });
    }
});

module.exports = router;
