// ===== ETERNIZE V3 - SERVER FOR HOSTINGER =====
// Servidor Node.js otimizado para hospedagem na Hostinger
// Todos os pagamentos são processados via Asaas (PIX, cartão, boleto).

require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('fs').promises;
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(helmet({
    contentSecurityPolicy: false // Permitir recursos externos
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== RATE LIMITING =====
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 50, // 50 uploads por hora
    message: { success: false, error: 'Muitos uploads. Tente novamente mais tarde.' }
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições
    message: { success: false, error: 'Muitas requisições. Tente novamente mais tarde.' }
});

app.use('/api', generalLimiter);

// ===== STORAGE SETUP =====
// Criar diretórios necessários
const ensureDirectories = async () => {
    const dirs = [
        path.join(__dirname, 'uploads'),
        path.join(__dirname, 'uploads/eventos'),
        path.join(__dirname, 'data')
    ];

    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            console.error(`Erro ao criar diretório ${dir}:`, error);
        }
    }
};

ensureDirectories();

// Configuração do Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
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

// ===== DATABASE FUNCTIONS (JSON-based) =====
const DB_PATH = path.join(__dirname, 'data');

async function readDB(collection) {
    try {
        const filePath = path.join(DB_PATH, `${collection}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeDB(collection, data) {
    try {
        const filePath = path.join(DB_PATH, `${collection}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Erro ao escrever ${collection}:`, error);
        return false;
    }
}

// ===== UTILITY FUNCTIONS =====
function generateToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function isValidToken(token) {
    return /^[a-z0-9]{12}$/.test(token);
}

function sanitizeInput(input, maxLength = 255) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength).replace(/[<>]/g, '');
}

// ===== API ROUTES =====

// Criar evento
app.post('/api/events', async (req, res) => {
    try {
        const { nome_evento, data_evento, descricao = '', tema = 'neutro', anfitrioes = '' } = req.body;

        if (!nome_evento || !data_evento) {
            return res.status(400).json({
                success: false,
                error: 'Nome do evento e data são obrigatórios'
            });
        }

        const token = generateToken();
        const eventId = `event_${Date.now()}`;

        const themeColors = {
            'toy-story': { primaria: '#FFD700', secundaria: '#FF0000' },
            'princesas': { primaria: '#FFB6C1', secundaria: '#DDA0DD' },
            'neutro': { primaria: '#E4D9B6', secundaria: '#FFD1DC' }
        };

        const eventData = {
            id: eventId,
            nome_evento: sanitizeInput(nome_evento, 100),
            data_evento: data_evento,
            descricao: sanitizeInput(descricao, 500),
            anfitrioes: sanitizeInput(anfitrioes, 100),
            token: token,
            tema: ['toy-story', 'princesas', 'neutro'].includes(tema) ? tema : 'neutro',
            cores: themeColors[tema] || themeColors['neutro'],
            criado_em: new Date().toISOString(),
            ativo: true
        };

        const eventos = await readDB('eventos');
        eventos.push(eventData);
        await writeDB('eventos', eventos);

        // Criar diretório para o evento
        const eventDir = path.join(__dirname, 'uploads/eventos', token);
        await fs.mkdir(eventDir, { recursive: true });

        res.json({
            success: true,
            event: {
                ...eventData,
                url_memoria: `${req.protocol}://${req.get('host')}/evento/${token}`,
                url_convite: `${req.protocol}://${req.get('host')}/convite.html?token=${token}`
            }
        });

    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Buscar evento por token
app.get('/api/events/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        const eventos = await readDB('eventos');
        const event = eventos.find(e => e.token === token && e.ativo);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Evento não encontrado'
            });
        }

        res.json({
            success: true,
            event: event
        });

    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Criar/garantir evento a partir do convite (mesmo token do QR) para página /memoria/:token
app.post('/api/events/from-convite', async (req, res) => {
    try {
        const { token, nome_evento, data_evento, tema = 'neutro', cores } = req.body;

        if (!token || !nome_evento || !data_evento) {
            return res.status(400).json({
                success: false,
                error: 'token, nome_evento e data_evento são obrigatórios'
            });
        }

        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        const eventos = await readDB('eventos');
        let event = eventos.find(e => e.token === token && e.ativo);

        if (event) {
            return res.json({ success: true, event });
        }

        const themeColors = {
            'toy-story': { primaria: '#FFD700', secundaria: '#FF0000' },
            'princesas': { primaria: '#FFB6C1', secundaria: '#DDA0DD' },
            'neutro': { primaria: '#E4D9B6', secundaria: '#FFD1DC' }
        };

        const eventId = `event_${Date.now()}`;
        const eventData = {
            id: eventId,
            nome_evento: sanitizeInput(String(nome_evento), 100),
            data_evento: String(data_evento),
            descricao: '',
            anfitrioes: '',
            token,
            tema: ['toy-story', 'princesas', 'neutro'].includes(tema) ? tema : 'neutro',
            cores: cores && cores.primaria && cores.secundaria
                ? { primaria: String(cores.primaria).substring(0, 20), secundaria: String(cores.secundaria).substring(0, 20) }
                : themeColors['neutro'],
            criado_em: new Date().toISOString(),
            ativo: true
        };

        eventos.push(eventData);
        await writeDB('eventos', eventos);

        const eventDir = path.join(__dirname, 'uploads/eventos', token);
        await fs.mkdir(eventDir, { recursive: true });

        res.status(201).json({
            success: true,
            event: {
                ...eventData,
                url_memoria: `${req.protocol}://${req.get('host')}/evento/${token}`,
                url_convite: `${req.protocol}://${req.get('host')}/convite.html?token=${token}`
            }
        });
    } catch (error) {
        console.error('Erro ao criar evento from-convite:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Excluir evento (e todas as fotos associadas)
app.delete('/api/events/:token', async (req, res) => {
    try {
        const { token } = req.params;
        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        const eventos = await readDB('eventos');
        const eventIndex = eventos.findIndex(e => e.token === token);
        if (eventIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Evento não encontrado'
            });
        }

        const fotos = await readDB('fotos');
        const photosToDelete = fotos.filter(f => f.token === token);
        for (const photo of photosToDelete) {
            try {
                const filePath = path.join(__dirname, photo.url);
                const thumbPath = path.join(__dirname, photo.thumbnail);
                await fs.unlink(filePath).catch(() => {});
                await fs.unlink(thumbPath).catch(() => {});
            } catch (err) {
                console.error('Erro ao deletar arquivo da foto:', err);
            }
        }
        const fotosRestantes = fotos.filter(f => f.token !== token);
        await writeDB('fotos', fotosRestantes);

        eventos.splice(eventIndex, 1);
        await writeDB('eventos', eventos);

        const eventDir = path.join(__dirname, 'uploads/eventos', token);
        await fs.rm(eventDir, { recursive: true }).catch(() => {});

        res.json({
            success: true,
            message: 'Evento excluído com sucesso'
        });
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir evento'
        });
    }
});

// Status do plano por token (para página de convite: bloquear download até pagamento)
app.get('/api/events/by-token/:token/plan-status', async (req, res) => {
    try {
        const { token } = req.params;
        if (!isValidToken(token)) {
            return res.json({ hasPlan: false, planType: null, planExpiresAt: null });
        }
        const eventos = await readDB('eventos');
        const event = eventos.find(e => e.token === token && e.ativo);
        const hasPlan = !!(event && event.paymentStatus === 'approved');
        res.json({
            hasPlan,
            planType: event?.planType || null,
            planExpiresAt: event?.planExpiresAt || null
        });
    } catch (error) {
        console.error('Erro ao verificar plan-status:', error);
        res.json({ hasPlan: false });
    }
});

// Criar link de pagamento (100% Asaas: PIX, cartão, boleto)
app.post('/api/payments/create', async (req, res) => {
    try {
        if (!process.env.ASAAS_API_KEY) {
            return res.status(503).json({
                success: false,
                error: 'Pagamentos temporariamente indisponíveis. Configure ASAAS_API_KEY.'
            });
        }
        const createPaymentLink = require('./server/services/asaasService').createPaymentLink;
        const {
            planId,
            planName,
            description,
            value,
            eventId,
            clientId,
            customerName,
            customerEmail,
            returnUrl
        } = req.body || {};
        const numValue = value !== undefined && value !== null && value !== '' ? Number(value) : 497.99;
        if (Number.isNaN(numValue) || numValue <= 0) {
            return res.status(400).json({ success: false, error: 'Valor do pagamento é inválido.' });
        }
        const name = planName || planId || 'Plano Eternize';
        const externalRef = eventId || clientId || planId || undefined;
        const paymentLink = await createPaymentLink({
            name,
            description: description || `Pagamento do plano ${name}`,
            value: numValue,
            metadata: {
                externalReference: externalRef,
                returnUrl: returnUrl || null
            }
        });
        console.log('✔ pagamento Asaas criado (server.js)', { id: paymentLink.id, externalRef });
        return res.json({
            success: true,
            checkoutUrl: paymentLink.url,
            payment: { id: paymentLink.id, gateway: 'asaas', checkoutUrl: paymentLink.url }
        });
    } catch (error) {
        console.error('Erro ao criar pagamento Asaas:', error);
        const msg = error.response && error.response.errors && error.response.errors[0]
            ? error.response.errors[0].description
            : (error.message || 'Erro ao criar link de pagamento.');
        return res.status(500).json({ success: false, error: msg });
    }
});

// Upload de foto
app.post('/api/upload', uploadLimiter, upload.single('photo'), async (req, res) => {
    try {
        const { token, message = '', uploaded_by = 'anonymous' } = req.body;
        const file = req.file;

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

        // Verificar se evento existe
        const eventos = await readDB('eventos');
        const event = eventos.find(e => e.token === token && e.ativo);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Evento não encontrado'
            });
        }

        // Gerar ID e nome do arquivo
        const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fileName = `${photoId}.jpg`;
        const eventDir = path.join(__dirname, 'uploads/eventos', token);
        const filePath = path.join(eventDir, fileName);

        // Processar imagem com Sharp (compressão e otimização)
        await sharp(file.buffer)
            .resize(1920, 1920, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toFile(filePath);

        // Criar thumbnail
        const thumbnailPath = path.join(eventDir, `thumb_${fileName}`);
        await sharp(file.buffer)
            .resize(400, 400, {
                fit: 'cover'
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

        // Salvar metadados
        const photoData = {
            id: photoId,
            evento_id: event.id,
            token: token,
            url: `/uploads/eventos/${token}/${fileName}`,
            thumbnail: `/uploads/eventos/${token}/thumb_${fileName}`,
            original_name: file.originalname,
            size: file.size,
            uploaded_by: sanitizeInput(uploaded_by, 50),
            message: sanitizeInput(message, 200),
            criado_em: new Date().toISOString(),
            aprovado: false // Requer aprovação do admin
        };

        const fotos = await readDB('fotos');
        fotos.push(photoData);
        await writeDB('fotos', fotos);

        res.json({
            success: true,
            photo: photoData
        });

    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao fazer upload da foto'
        });
    }
});

// Buscar fotos por token
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

        const fotos = await readDB('fotos');
        let photos = fotos.filter(f => f.token === token);

        if (approved !== undefined) {
            const isApproved = approved === 'true';
            photos = photos.filter(f => f.aprovado === isApproved);
        }

        // Ordenar por data (mais recentes primeiro)
        photos.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));

        res.json({
            success: true,
            photos: photos
        });

    } catch (error) {
        console.error('Erro ao buscar fotos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar fotos'
        });
    }
});

// Aprovar foto
app.patch('/api/photos/:photoId/approve', async (req, res) => {
    try {
        const { photoId } = req.params;
        const { approved = true } = req.body;

        const fotos = await readDB('fotos');
        const photoIndex = fotos.findIndex(f => f.id === photoId);

        if (photoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Foto não encontrada'
            });
        }

        fotos[photoIndex].aprovado = approved;
        fotos[photoIndex].aprovado_em = new Date().toISOString();

        await writeDB('fotos', fotos);

        res.json({
            success: true,
            message: approved ? 'Foto aprovada' : 'Aprovação removida'
        });

    } catch (error) {
        console.error('Erro ao aprovar foto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao aprovar foto'
        });
    }
});

// Deletar foto
app.delete('/api/photos/:photoId', async (req, res) => {
    try {
        const { photoId } = req.params;

        const fotos = await readDB('fotos');
        const photoIndex = fotos.findIndex(f => f.id === photoId);

        if (photoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Foto não encontrada'
            });
        }

        const photo = fotos[photoIndex];

        // Deletar arquivos
        try {
            const filePath = path.join(__dirname, photo.url);
            const thumbnailPath = path.join(__dirname, photo.thumbnail);
            await fs.unlink(filePath);
            await fs.unlink(thumbnailPath);
        } catch (error) {
            console.error('Erro ao deletar arquivos:', error);
        }

        // Remover do banco
        fotos.splice(photoIndex, 1);
        await writeDB('fotos', fotos);

        res.json({
            success: true,
            message: 'Foto deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar foto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao deletar foto'
        });
    }
});

// Estatísticas do evento
app.get('/api/stats/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!isValidToken(token)) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }

        const fotos = await readDB('fotos');
        const photos = fotos.filter(f => f.token === token);

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
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar estatísticas'
        });
    }
});

// ===== ROTAS DE PÁGINAS =====
// Os arquivos HTML públicos ficam na raiz do projeto (não em public), por isso
// são servidos via rotas explícitas com sendFile, sem usar express.static(__dirname).

// Página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Página do evento
app.get('/evento/:token', async (req, res) => {
    res.sendFile(path.join(__dirname, 'evento.html'));
});

// Página de memória (alias)
app.get('/memoria/:token', async (req, res) => {
    res.sendFile(path.join(__dirname, 'evento.html'));
});

// Páginas HTML na raiz do projeto (rotas explícitas para produção)
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/create.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'create.html'));
});
app.get('/convite.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'convite.html'));
});
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});
app.get('/plans.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'plans.html'));
});
app.get('/menu.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'menu.html'));
});
app.get('/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

// ===== ERROR HANDLING =====
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Arquivo muito grande. Máximo 10MB'
            });
        }
    }

    console.error('Erro não tratado:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║           ✨ ETERNIZE V3 - SERVER RUNNING ✨          ║
║                                                       ║
║  🌐 URL: http://localhost:${PORT}                      ║
║  📱 Eventos: http://localhost:${PORT}/evento/{token}   ║
║  🎨 Convites: http://localhost:${PORT}/convite.html    ║
║  🔧 API: http://localhost:${PORT}/api                  ║
║                                                       ║
║  Status: ✅ Pronto para produção                      ║
║  Ambiente: ${process.env.NODE_ENV || 'development'}                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
