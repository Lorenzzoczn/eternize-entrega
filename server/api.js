// ===== BACKEND API ROUTES =====
// Express.js routes for token-based system with Firebase integration

const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// Import payment routes
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');

// Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour per IP
    message: { success: false, error: 'Muitos uploads. Tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: { success: false, error: 'Muitas requisições. Tente novamente mais tarde.' }
});

app.use('/api', generalLimiter);

// Mount payment routes
app.use('/api', paymentRoutes);
app.use('/api/webhook', webhookRoutes);

// Multer configuration for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas'), false);
        }
    }
});

// ===== UTILITY FUNCTIONS =====

// Generate unique token
function generateToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Validate token format
function isValidToken(token) {
    return /^[a-z0-9]{12}$/.test(token);
}

// Sanitize input
function sanitizeInput(input, maxLength = 255) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
}

// ===== API ROUTES =====

// Create new event
app.post('/api/events', async (req, res) => {
    try {
        const { nome_evento, data_evento, tema = 'neutro' } = req.body;

        // Validation
        if (!nome_evento || !data_evento) {
            return res.status(400).json({
                success: false,
                error: 'Nome do evento e data são obrigatórios'
            });
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(nome_evento, 100);
        const sanitizedTheme = ['toy-story', 'princesas', 'neutro'].includes(tema) ? tema : 'neutro';

        // Generate token
        const token = generateToken();
        const eventId = `event_${Date.now()}`;

        // Theme colors
        const themeColors = {
            'toy-story': { primaria: '#FFD700', secundaria: '#FF0000' },
            'princesas': { primaria: '#FFB6C1', secundaria: '#DDA0DD' },
            'neutro': { primaria: '#E4D9B6', secundaria: '#FFD1DC' }
        };

        // Create event document
        const eventData = {
            id: eventId,
            nome_evento: sanitizedName,
            data_evento: data_evento,
            token: token,
            tema: sanitizedTheme,
            cores: themeColors[sanitizedTheme],
            criado_em: admin.firestore.FieldValue.serverTimestamp(),
            ativo: true
        };

        // Save to Firestore
        await db.collection('eventos').doc(eventId).set(eventData);

        res.json({
            success: true,
            event: {
                ...eventData,
                url_memoria: `${req.protocol}://${req.get('host')}/memoria/${token}`,
                qr_code_url: `${req.protocol}://${req.get('host')}/api/qr/${token}`
            }
        });

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Get event by token
app.get('/api/events/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        // Query Firestore
        const eventsRef = db.collection('eventos');
        const query = eventsRef.where('token', '==', token).where('ativo', '==', true);
        const snapshot = await query.get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                error: 'Evento não encontrado'
            });
        }

        const eventDoc = snapshot.docs[0];
        const eventData = eventDoc.data();

        res.json({
            success: true,
            event: eventData
        });

    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Upload photo
app.post('/api/upload', uploadLimiter, upload.single('photo'), async (req, res) => {
    try {
        const { token, message = '', uploaded_by = 'anonymous' } = req.body;
        const file = req.file;

        // Validation
        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'Nenhum arquivo enviado'
            });
        }

        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        // Check if event exists
        const eventsRef = db.collection('eventos');
        const eventQuery = eventsRef.where('token', '==', token).where('ativo', '==', true);
        const eventSnapshot = await eventQuery.get();

        if (eventSnapshot.empty) {
            return res.status(404).json({
                success: false,
                error: 'Evento não encontrado'
            });
        }

        const eventData = eventSnapshot.docs[0].data();

        // Generate photo ID and filename
        const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${photoId}.${fileExtension}`;
        const filePath = `eventos/${token}/${fileName}`;

        // Upload to Firebase Storage
        const fileUpload = bucket.file(filePath);
        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
                metadata: {
                    originalName: file.originalname,
                    uploadedBy: sanitizeInput(uploaded_by, 50),
                    message: sanitizeInput(message, 200)
                }
            }
        });

        await new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('finish', resolve);
            stream.end(file.buffer);
        });

        // Get download URL
        const [downloadURL] = await fileUpload.getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // Far future date
        });

        // Save photo metadata to Firestore
        const photoData = {
            id: photoId,
            evento_id: eventData.id,
            token: token,
            url: downloadURL,
            storage_path: filePath,
            original_name: file.originalname,
            size: file.size,
            type: file.mimetype,
            uploaded_by: sanitizeInput(uploaded_by, 50),
            message: sanitizeInput(message, 200),
            criado_em: admin.firestore.FieldValue.serverTimestamp(),
            aprovado: false
        };

        await db.collection('fotos').doc(photoId).set(photoData);

        res.json({
            success: true,
            photo: photoData
        });

    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao fazer upload da foto'
        });
    }
});

// Get photos by token
app.get('/api/photos/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { approved } = req.query;

        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        // Query photos
        let query = db.collection('fotos')
            .where('token', '==', token)
            .orderBy('criado_em', 'desc');

        if (approved !== undefined) {
            query = query.where('aprovado', '==', approved === 'true');
        }

        const snapshot = await query.get();
        const photos = [];

        snapshot.forEach(doc => {
            photos.push(doc.data());
        });

        res.json({
            success: true,
            photos: photos
        });

    } catch (error) {
        console.error('Error getting photos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar fotos'
        });
    }
});

// Approve photo (admin only)
app.patch('/api/photos/:photoId/approve', async (req, res) => {
    try {
        const { photoId } = req.params;
        const { approved = true } = req.body;

        // Update photo approval status
        await db.collection('fotos').doc(photoId).update({
            aprovado: approved,
            aprovado_em: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: approved ? 'Foto aprovada' : 'Aprovação removida'
        });

    } catch (error) {
        console.error('Error approving photo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao aprovar foto'
        });
    }
});

// Delete photo (admin only)
app.delete('/api/photos/:photoId', async (req, res) => {
    try {
        const { photoId } = req.params;

        // Get photo data
        const photoDoc = await db.collection('fotos').doc(photoId).get();
        
        if (!photoDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Foto não encontrada'
            });
        }

        const photoData = photoDoc.data();

        // Delete from Storage
        await bucket.file(photoData.storage_path).delete();

        // Delete from Firestore
        await db.collection('fotos').doc(photoId).delete();

        res.json({
            success: true,
            message: 'Foto deletada com sucesso'
        });

    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao deletar foto'
        });
    }
});

// Generate QR Code
app.get('/api/qr/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { size = 300, theme = 'neutro' } = req.query;

        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        // Check if event exists
        const eventsRef = db.collection('eventos');
        const eventQuery = eventsRef.where('token', '==', token).where('ativo', '==', true);
        const eventSnapshot = await eventQuery.get();

        if (eventSnapshot.empty) {
            return res.status(404).json({
                success: false,
                error: 'Evento não encontrado'
            });
        }

        const memoriaUrl = `${req.protocol}://${req.get('host')}/memoria/${token}`;

        // For now, return the URL - QR generation would be handled client-side
        res.json({
            success: true,
            qr_url: memoriaUrl,
            download_url: `/api/qr/${token}/download?size=${size}&theme=${theme}`
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao gerar QR code'
        });
    }
});

// Get event statistics
app.get('/api/stats/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        // Get photos
        const photosSnapshot = await db.collection('fotos')
            .where('token', '==', token)
            .get();

        const photos = [];
        photosSnapshot.forEach(doc => {
            photos.push(doc.data());
        });

        // Calculate stats
        const total = photos.length;
        const approved = photos.filter(p => p.aprovado).length;
        const pending = photos.filter(p => !p.aprovado).length;
        const contributors = new Set(photos.map(p => p.uploaded_by)).size;

        res.json({
            success: true,
            stats: {
                total,
                approved,
                pending,
                contributors
            }
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar estatísticas'
        });
    }
});

// Serve memoria pages
app.get('/memoria/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!isValidToken(token)) {
            return res.status(404).send('Página não encontrada');
        }

        // Get event data
        const eventsRef = db.collection('eventos');
        const eventQuery = eventsRef.where('token', '==', token).where('ativo', '==', true);
        const eventSnapshot = await eventQuery.get();

        if (eventSnapshot.empty) {
            return res.status(404).send('Evento não encontrado');
        }

        const eventData = eventSnapshot.docs[0].data();

        // Get approved photos
        const photosSnapshot = await db.collection('fotos')
            .where('token', '==', token)
            .where('aprovado', '==', true)
            .orderBy('criado_em', 'desc')
            .get();

        const photos = [];
        photosSnapshot.forEach(doc => {
            photos.push(doc.data());
        });

        // Generate HTML (you would use a template engine in production)
        const html = generateMemoriaPageHTML(eventData, photos);
        
        res.send(html);

    } catch (error) {
        console.error('Error serving memoria page:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Arquivo muito grande. Máximo 10MB'
            });
        }
    }

    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Helper function to generate memoria page HTML
function generateMemoriaPageHTML(event, photos) {
    const themes = {
        'toy-story': { icon: '🚀', colors: { primary: '#FFD700', secondary: '#FF0000' } },
        'princesas': { icon: '👑', colors: { primary: '#FFB6C1', secondary: '#DDA0DD' } },
        'neutro': { icon: '✨', colors: { primary: '#E4D9B6', secondary: '#FFD1DC' } }
    };

    const theme = themes[event.tema] || themes['neutro'];

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${event.nome_evento} - Eternize</title>
    <link rel="stylesheet" href="/css/memoria.css">
    <style>
        :root {
            --theme-primary: ${theme.colors.primary};
            --theme-secondary: ${theme.colors.secondary};
        }
    </style>
</head>
<body class="theme-${event.tema}">
    <div class="memoria-container">
        <header class="memoria-header">
            <div class="theme-icon">${theme.icon}</div>
            <h1>${event.nome_evento}</h1>
            <p class="evento-data">${new Date(event.data_evento).toLocaleDateString('pt-BR')}</p>
            <p class="memoria-subtitle">Compartilhe seus momentos especiais</p>
        </header>

        <section class="upload-section">
            <div class="upload-card">
                <h2>📸 Enviar Foto</h2>
                <form id="uploadForm" enctype="multipart/form-data">
                    <input type="file" id="photoInput" accept="image/*" required>
                    <input type="text" id="messageInput" placeholder="Deixe uma mensagem (opcional)" maxlength="200">
                    <input type="text" id="nameInput" placeholder="Seu nome (opcional)" maxlength="50">
                    <button type="submit" class="btn-upload">
                        <span class="upload-icon">📤</span>
                        Enviar Foto
                    </button>
                </form>
                <div id="uploadStatus" class="upload-status"></div>
            </div>
        </section>

        <section class="gallery-section">
            <h2>🖼️ Galeria de Momentos</h2>
            <div class="photos-grid" id="photosGrid">
                ${photos.map(photo => `
                    <div class="photo-item">
                        <img src="${photo.url}" alt="Momento especial" loading="lazy">
                        ${photo.message ? `<p class="photo-message">${photo.message}</p>` : ''}
                        ${photo.uploaded_by !== 'anonymous' ? `<p class="photo-author">Por: ${photo.uploaded_by}</p>` : ''}
                    </div>
                `).join('')}
            </div>
            ${photos.length === 0 ? `
                <div class="empty-gallery">
                    <div class="empty-icon">${theme.icon}</div>
                    <p>Seja o primeiro a compartilhar um momento!</p>
                </div>
            ` : ''}
        </section>
    </div>

    <script src="/js/memoria-page.js"></script>
    <script>
        window.EVENT_TOKEN = '${event.token}';
        window.EVENT_DATA = ${JSON.stringify(event)};
    </script>
</body>
</html>`;
}

module.exports = app;

// Start server if this file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Memoria pages: http://localhost:${PORT}/memoria/{token}`);
        console.log(`🔧 API endpoints: http://localhost:${PORT}/api`);
    });
}