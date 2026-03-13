// ===== ROTAS DA API =====

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { bucket, db, admin } = require('./firebase');

const router = express.Router();

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  },
});

// Gerar nome único para arquivo
function generateFileName(originalName, albumId) {
  const extension = originalName.split('.').pop();
  return `albuns/${albumId}/${Date.now()}-${uuidv4()}.${extension}`;
}

// Upload para Firebase Storage
async function uploadToFirebase(fileBuffer, fileName, mimeType) {
  const file = bucket.file(fileName);

  await file.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
    },
    resumable: false,
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// ===== ROTA 1: Criar Álbum =====
router.post('/album', async (req, res, next) => {
  try {
    const albumId = uuidv4();

    const now = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('albums').doc(albumId).set({
      id: albumId,
      // relacionamento / dono (opcional, preenchido pelo frontend futuramente)
      clientId: null,
      eventId: null,
      // metadados básicos
      title: null,
      description: null,
      status: 'active', // active | archived | deleted
      photoCount: 0,
      totalPhotos: 0, // compatibilidade com código legado
      createdAt: now,
      updatedAt: now,
    });

    console.log(`✅ Álbum criado no Firestore: ${albumId}`);

    res.json({
      success: true,
      albumId,
    });
  } catch (error) {
    console.error('❌ Erro ao criar álbum:', error);
    next(error);
  }
});

// ===== ROTA 2: Upload de Foto =====
router.post('/upload/:albumId', upload.single('file'), async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const file = req.file;

    const albumRef = db.collection('albums').doc(albumId);
    const albumSnap = await albumRef.get();

    if (!albumSnap.exists) {
      return res.status(404).json({
        success: false,
        error: 'Álbum não encontrado',
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
    }

    const fileName = generateFileName(file.originalname, albumId);

    const photoUrl = await uploadToFirebase(
      file.buffer,
      fileName,
      file.mimetype
    );

    const photoId = uuidv4();
    const now = admin.firestore.FieldValue.serverTimestamp();

    await albumRef.collection('photos').doc(photoId).set({
      id: photoId,
      albumId,
      clientId: null,
      eventId: null,
      url: photoUrl,
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: fileName,
      approved: true,
      deleted: false,
      createdAt: now,
      updatedAt: now,
      uploadedAt: now,
    });

    // Atualizar contador de fotos do álbum de forma incremental
    await albumRef.update({
      photoCount: admin.firestore.FieldValue.increment(1),
      totalPhotos: admin.firestore.FieldValue.increment(1),
      updatedAt: now,
    });

    console.log(`✅ Foto adicionada ao álbum ${albumId} no Firestore`);

    res.json({
      success: true,
      url: photoUrl,
      albumId,
      photoId,
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    next(error);
  }
});

// ===== ROTA 3: Buscar Fotos do Álbum =====
router.get('/album/:albumId', async (req, res, next) => {
  try {
    const { albumId } = req.params;

    const albumRef = db.collection('albums').doc(albumId);
    const albumSnap = await albumRef.get();

    if (!albumSnap.exists) {
      return res.status(404).json({
        success: false,
        error: 'Álbum não encontrado',
      });
    }

    const photosSnap = await albumRef
      .collection('photos')
      .orderBy('createdAt', 'desc')
      .get();

    const photos = photosSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const albumData = albumSnap.data();

    res.json({
      success: true,
      albumId,
      photos: photos.map((p) => p.url),
      photoDetails: photos,
      createdAt: albumData.createdAt || null,
      updatedAt: albumData.updatedAt || null,
      photoCount: albumData.photoCount ?? photos.length,
      totalPhotos: albumData.totalPhotos ?? photos.length,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar álbum:', error);
    next(error);
  }
});

// ===== ROTA 4: Listar Todos os Álbuns (Admin) =====
router.get('/albums', async (req, res, next) => {
  try {
    const albumsSnap = await db
      .collection('albums')
      .orderBy('createdAt', 'desc')
      .get();

    const albums = albumsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      albums,
      total: albums.length,
    });
  } catch (error) {
    console.error('❌ Erro ao listar álbuns:', error);
    next(error);
  }
});

// ===== ROTA 5: Health Check =====
router.get('/health', async (req, res, next) => {
  try {
    const albumsSnap = await db.collection('albums').get();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      albums: albumsSnap.size,
    });
  } catch (error) {
    next(error);
  }
});

// ===== ROTAS DE PAGAMENTO (ASAAS) E WEBHOOKS =====
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');

router.use(paymentRoutes);
router.use('/webhooks', webhookRoutes);

module.exports = router;