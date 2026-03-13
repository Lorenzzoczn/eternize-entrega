const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

class MercadoPagoService {
  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
    });

    this.preferenceClient = new Preference(this.client);
    this.paymentClient = new Payment(this.client);
  }

  // Cria preferência Checkout Pro para um plano + evento/cliente
  async createCheckoutPreference({ plan, clientId, eventId, clientEmail, clientName }) {
    try {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';

      const planPrices = {
        'premium-monthly': {
          title: 'Eternize Premium - Mensal',
          price: 29.9,
          description: 'Eventos ilimitados + QR personalizado + Galeria privada'
        },
        'premium-yearly': {
          title: 'Eternize Premium - Anual',
          price: 299.9,
          description: 'Eventos ilimitados + QR personalizado + Galeria privada (Economize 2 meses)'
        },
        'premium-lifetime': {
          title: 'Eternize Premium - Vitalício',
          price: 497.0,
          description: 'Acesso vitalício a todos os recursos premium'
        }
      };

      const selectedPlan = planPrices[plan];

      if (!selectedPlan) {
        throw new Error('Plano inválido');
      }

      const externalReference = eventId || clientId;

      const preference = {
        items: [
          {
            title: selectedPlan.title,
            description: selectedPlan.description,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number(selectedPlan.price)
          }
        ],
        payer: {
          email: clientEmail || undefined,
          name: clientName || undefined
        },
        external_reference: externalReference,
        back_urls: {
          success: `${appUrl}/success.html`,
          failure: `${appUrl}/failure.html`,
          pending: `${appUrl}/pending.html`
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mercadopago`
      };

      const pref = await this.preferenceClient.create({ body: preference });

      return {
        success: true,
        plan,
        amount: selectedPlan.price,
        currency: 'BRL',
        preferenceId: pref.id,
        initPoint: pref.init_point,
        sandboxInitPoint: pref.sandbox_init_point || null,
        rawPreference: pref
      };
    } catch (error) {
      console.error('Erro ao criar preferência Mercado Pago:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao criar preferência no Mercado Pago'
      };
    }
  }

  // Compatível com webhook: retorna { success, payment } ou { success: false, error }
  async getPaymentInfo(paymentId) {
    try {
      const payment = await this.paymentClient.get({ id: paymentId });
      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Erro ao buscar pagamento Mercado Pago:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao buscar pagamento no Mercado Pago'
      };
    }
  }
}

module.exports = new MercadoPagoService();