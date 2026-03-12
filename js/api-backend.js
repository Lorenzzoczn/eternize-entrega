// ===== API BACKEND CLIENT =====
// Cliente para comunicação com o backend Node.js + S3

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

/**
 * Criar novo álbum no backend
 * @returns {Promise<{albumId: string}>}
 */
async function createAlbumBackend() {
    try {
        const response = await fetch(`${API_URL}/album`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Erro ao criar álbum');
        }

        return data;

    } catch (error) {
        console.error('Erro ao criar álbum:', error);
        throw error;
    }
}

/**
 * Upload de foto para o backend (S3)
 * @param {string} albumId - ID do álbum
 * @param {File} file - Arquivo da foto
 * @param {Function} onProgress - Callback de progresso
 * @returns {Promise<{url: string}>}
 */
async function uploadPhotoBackend(albumId, file, onProgress) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            // Progress
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete);
                    }
                });
            }

            // Load
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        resolve(data);
                    } else {
                        reject(new Error(data.error || 'Erro no upload'));
                    }
                } else {
                    reject(new Error('Erro no upload'));
                }
            });

            // Error
            xhr.addEventListener('error', () => {
                reject(new Error('Erro de rede'));
            });

            xhr.open('POST', `${API_URL}/upload/${albumId}`);
            xhr.send(formData);
        });

    } catch (error) {
        console.error('Erro no upload:', error);
        throw error;
    }
}

/**
 * Buscar fotos do álbum do backend
 * @param {string} albumId - ID do álbum
 * @returns {Promise<{photos: string[]}>}
 */
async function getPhotosBackend(albumId) {
    try {
        const response = await fetch(`${API_URL}/album/${albumId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Erro ao buscar fotos');
        }

        return data;

    } catch (error) {
        console.error('Erro ao buscar fotos:', error);
        throw error;
    }
}

/**
 * Health check da API
 * @returns {Promise<{status: string}>}
 */
async function checkHealthBackend() {
    try {
        const response = await fetch(`${API_URL}/health`);
        return await response.json();
    } catch (error) {
        console.error('Erro no health check:', error);
        return { status: 'error' };
    }
}

/**
 * Verificar se backend está disponível
 * @returns {Promise<boolean>}
 */
async function isBackendAvailable() {
    try {
        const health = await checkHealthBackend();
        return health.status === 'ok';
    } catch (error) {
        return false;
    }
}
