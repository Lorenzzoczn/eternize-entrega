// ===== SERVIDOR EXPRESS =====

require('dotenv').config();

if (!process.env.ASAAS_API_KEY) {
  console.warn('⚠️ ASAAS_API_KEY não configurada. Pagamentos Asaas não funcionarão.');
}

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : '*';

// ===== MIDDLEWARES =====

// CORS (usa ALLOWED_ORIGINS do .env)
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ===== ROTAS =====
// Todas as rotas (álbum, upload, health, payments, webhooks) vêm de routes.js
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '✨ Eternize API',
    version: '1.0.0',
    endpoints: {
      createAlbum: 'POST /api/album',
      uploadPhoto: 'POST /api/upload/:albumId',
      getAlbum: 'GET /api/album/:albumId',
      listAlbums: 'GET /api/albums',
      health: 'GET /api/health',
      createPayment: 'POST /api/payments/create',
      webhookAsaas: 'POST /api/webhooks/asaas',
    },
  });
});

// ===== TRATAMENTO DE ERROS =====

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
  });
});

// Erro geral
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erro interno do servidor',
  });
});

// ===== INICIAR SERVIDOR =====

app.listen(PORT, () => {
  console.log('');
  console.log('✨ ========================================');
  console.log('✨ ETERNIZE API - SERVIDOR INICIADO');
  console.log('✨ ========================================');
  console.log(`🚀 Servidor: http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 APP_URL: ${process.env.APP_URL || '(não definido)'}`);
  console.log(`🔑 Asaas: ${process.env.ASAAS_API_KEY ? 'configurado' : 'não configurado'}`);
  console.log('✨ ========================================');
  console.log('');
});

module.exports = app;
