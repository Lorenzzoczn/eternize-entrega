const https = require('https');
const { URL } = require('url');

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3';

if (!ASAAS_API_KEY) {
  console.warn('[Asaas] ASAAS_API_KEY não configurada. Criação de link de pagamento falhará.');
}

/**
 * Perform a request to Asaas REST API.
 *
 * @param {string} path - API path, e.g. "/paymentLinks"
 * @param {string} method - HTTP method
 * @param {object} [body] - JSON body to send
 * @returns {Promise<object>} - Parsed JSON response
 */
function asaasRequest(path, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const base = ASAAS_BASE_URL.replace(/\/$/, '');
    const pathStr = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(`${base}/${pathStr}`);

    const payload = body ? JSON.stringify(body) : null;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'access_token': ASAAS_API_KEY || '',
        'User-Agent': process.env.ASAAS_USER_AGENT || 'Eternize/1.0',
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let json = {};
        try {
          json = data && data.trim() ? JSON.parse(data) : {};
        } catch (e) {
          // Resposta não é JSON (ex.: HTML de erro)
          const err = new Error('Asaas API error');
          err.statusCode = res.statusCode;
          err.response = { errors: [{ description: data || res.statusMessage || 'Resposta inválida' }], raw: data ? data.substring(0, 500) : null };
          console.error('✔ erro Asaas:', res.statusCode, data ? data.substring(0, 300) : '(vazio)');
          return reject(err);
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error('✔ erro Asaas:', res.statusCode, json);
          const error = new Error('Asaas API error');
          error.statusCode = res.statusCode;
          error.response = json && Object.keys(json).length ? json : { errors: [{ description: res.statusMessage || 'Erro na API Asaas' }], statusCode: res.statusCode };
          return reject(error);
        }

        return resolve(json);
      });
    });

    req.on('error', (err) => {
      return reject(err);
    });

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

/**
 * Create a payment link in Asaas.
 *
 * This uses the /paymentLinks endpoint, which returns a URL that can be
 * shared with the customer. We keep the return contract minimal and
 * independent of Mercado Pago.
 *
 * @param {object} params
 * @param {string} params.name - Display name of the payment link (e.g. plan name).
 * @param {string} params.description - Description shown in the checkout.
 * @param {number} params.value - Total value (BRL).
 * @param {string} [params.billingType] - Asaas billing type ("UNDEFINED", "BOLETO", "PIX", etc.).
 * @param {string} [params.chargeType] - "DETACHED" | "INSTALLMENT" | "RECURRENT".
 * @param {number} [params.dueDateLimitDays] - Max days until due date.
 * @param {object} [params.metadata] - Arbitrary metadata (e.g. planId, internal IDs).
 * @returns {Promise<{ id: string, url: string, raw: object }>}
 */
async function createPaymentLink({
  name,
  description,
  value,
  billingType = 'UNDEFINED',
  chargeType = 'DETACHED',
  dueDateLimitDays = 10,
  metadata = {},
}) {
  if (!ASAAS_API_KEY) {
    const error = new Error('Asaas API key not configured');
    error.code = 'ASAAS_MISCONFIGURED';
    throw error;
  }

  if (!name || typeof name !== 'string') {
    throw new Error('Missing or invalid "name" for Asaas payment link');
  }

  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new Error('Missing or invalid "value" for Asaas payment link');
  }

  const body = {
    name,
    description: description || name,
    value,
    billingType,
    chargeType,
    dueDateLimitDays,
    // Asaas supports custom fields via "externalReference" and "callback" data.
    externalReference: metadata.externalReference || undefined,
  };

  const response = await asaasRequest('/paymentLinks', 'POST', body);

  return {
    id: response.id,
    url: response.url,
    raw: response,
  };
}

module.exports = {
  createPaymentLink,
};

