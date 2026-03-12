// ===== SERVIDOR EXPRESS =====

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARES =====

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`☁️  S3 Endpoint: ${process.env.S3_ENDPOINT}`);
  console.log(`📦 Bucket: ${process.env.S3_BUCKET}`);
  console.log('✨ ========================================');
  console.log('');
});

module.exports = app;
