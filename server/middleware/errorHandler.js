const multer = require('multer');

// Centralized error handling middleware
// Ensures consistent JSON responses across the API.
function errorHandler(err, req, res, next) {
  // Multer (upload) errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Máximo 10MB',
        code: 'FILE_TOO_LARGE',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Erro no upload do arquivo',
      code: err.code,
    });
  }

  // Custom HTTP errors with status
  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    return res.status(status).json({
      success: false,
      message: err.message || 'Erro na requisição',
    });
  }

  // Unhandled errors
  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
}

module.exports = errorHandler;

