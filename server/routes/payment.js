const express = require('express');
const router = express.Router();

const { admin, db } = require('../firebase');
const { createPaymentLink } = require('../services/asaasService');

const PLAN_VALUE = 497.99;
const PLAN_ID = 'premium';
const PLAN_NAME = 'Plano Eternize';

/**
 * GET /api/plan
 * Retorna o plano único (valor fixo R$ 497,99).
 */
router.get('/plan', (req, res) => {
  res.json({
    planId: PLAN_ID,
    planName: PLAN_NAME,
    value: PLAN_VALUE,
  });
});

/**
 * GET /api/events/:eventId/plan-status
 * Verifica se o evento tem plano ativo (pagamento aprovado). eventId = ID do documento no Firestore.
 */
router.get('/events/:eventId/plan-status', async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventsCollections = ['eventos', 'events'];
    let eventData = null;

    for (const col of eventsCollections) {
      const doc = await db.collection(col).doc(eventId).get();
      if (doc.exists) {
        eventData = doc.data();
        break;
      }
    }

    if (!eventData) {
      return res.json({ hasPlan: false, planType: null, planExpiresAt: null });
    }

    const paymentStatus = eventData.paymentStatus === 'approved';
    const planExpiresAt = eventData.planExpiresAt || null;
    const now = new Date();
    const expired = planExpiresAt && new Date(planExpiresAt) <= now;
    const hasPlan = paymentStatus && !expired;

    res.json({
      hasPlan,
      planType: eventData.planType || null,
      planExpiresAt: planExpiresAt || null,
    });
  } catch (error) {
    console.error('Erro ao verificar plan-status:', error);
    res.status(500).json({ hasPlan: false });
  }
});

/**
 * GET /api/events/by-token/:token/plan-status
 * Verifica plano pelo token do evento (usado na página de convite).
 */
router.get('/events/by-token/:token/plan-status', async (req, res) => {
  try {
    const { token } = req.params;
    const eventsCollections = ['eventos', 'events'];
    let eventData = null;

    for (const col of eventsCollections) {
      const snap = await db.collection(col).where('token', '==', token).limit(1).get();
      if (!snap.empty) {
        eventData = snap.docs[0].data();
        break;
      }
    }

    if (!eventData) {
      return res.json({ hasPlan: false, planType: null, planExpiresAt: null });
    }

    const paymentStatus = eventData.paymentStatus === 'approved';
    const planExpiresAt = eventData.planExpiresAt || null;
    const now = new Date();
    const expired = planExpiresAt && new Date(planExpiresAt) <= now;
    const hasPlan = paymentStatus && !expired;

    res.json({
      hasPlan,
      planType: eventData.planType || null,
      planExpiresAt: planExpiresAt || null,
    });
  } catch (error) {
    console.error('Erro ao verificar plan-status por token:', error);
    res.status(500).json({ hasPlan: false });
  }
});

/**
 * POST /api/payments/create
 *
 * Cria link de pagamento no Asaas e persiste em Firestore (pagamentos + payments).
 * Gateway: apenas ASAAS. Sem dependência do Mercado Pago.
 */
router.post('/payments/create', async (req, res) => {
  try {
    const {
      planId,
      planName,
      description,
      value,
      eventId,
      clientId,
      customerName,
      customerEmail,
      customerCpfCnpj,
    } = req.body || {};

    // Validação do valor
    if (value === undefined || value === null || value === '') {
      return res.status(400).json({
        success: false,
        error: 'Valor do pagamento é obrigatório',
      });
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor do pagamento é inválido',
      });
    }

    const name = planName || planId || 'Pagamento Eternize';

    // externalReference: eventId → clientId → planId (usado pelo webhook para ativar plano)
    const externalReference =
      eventId || clientId || planId || undefined;

    // Se eventId/clientId for token do evento (ex.: vindo do convite), garantir doc do evento no Firestore para o webhook atualizar
    const eventToken = eventId || clientId;
    if (eventToken && typeof eventToken === 'string') {
      const eventosRef = db.collection('eventos').doc(eventToken);
      const eventSnap = await eventosRef.get();
      if (!eventSnap.exists) {
        await eventosRef.set({
          token: eventToken,
          paymentStatus: 'pending',
          ativo: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    const paymentLink = await createPaymentLink({
      name,
      description: description || `Pagamento do plano ${name}`,
      value: numericValue,
      metadata: {
        externalReference,
      },
    });

    const paymentDocId = `asaas_${paymentLink.id}`;
    const now = new Date();

    const baseData = {
      id: paymentDocId,
      gateway: 'asaas',
      provider: 'asaas',
      asaasPaymentLinkId: paymentLink.id,
      asaasUrl: paymentLink.url,
      status: 'pending',
      value: numericValue,
      planId: planId || null,
      planName: planName || null,
      eventId: eventId || null,
      clientId: clientId || null,
      externalReference: externalReference || null,
      customer: {
        name: customerName || null,
        email: customerEmail || null,
        cpfCnpj: customerCpfCnpj || null,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Coleção pagamentos (estrutura principal Asaas)
    await db.collection('pagamentos').doc(paymentDocId).set({
      ...baseData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Coleção payments (compatibilidade/legado)
    await db.collection('payments').doc(paymentDocId).set({
      ...baseData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✔ pagamento criado', { id: paymentDocId, checkoutUrl: paymentLink.url });

    return res.status(201).json({
      success: true,
      checkoutUrl: paymentLink.url,
      payment: {
        id: paymentDocId,
        gateway: 'asaas',
        status: 'pending',
        checkoutUrl: paymentLink.url,
      },
    });
  } catch (error) {
    console.error('✔ erro Asaas (create payment):', error.message || error);

    if (error.code === 'ASAAS_MISCONFIGURED') {
      return res.status(500).json({
        success: false,
        error: 'Asaas não está configurado corretamente. Verifique ASAAS_API_KEY.',
      });
    }

    if (error.response) {
      const details = error.response.errors ? error.response : { errors: [{ description: error.message }], statusCode: error.statusCode };
      return res.status(error.statusCode >= 400 && error.statusCode < 500 ? 400 : 502).json({
        success: false,
        error: error.response.errors && error.response.errors[0] ? error.response.errors[0].description : 'Erro ao criar pagamento no Asaas',
        details,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro interno ao criar pagamento',
    });
  }
});

module.exports = router;
