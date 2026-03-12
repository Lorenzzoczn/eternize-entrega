// ===== STORAGE MANAGER =====
// Sistema híbrido: IndexedDB local + API backend com S3

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api'; // Em produção, usa proxy ou mesmo domínio

class StorageManager {
    constructor() {
        this.dbName = 'EternizeDB';
        this.version = 1;
        this.db = null;
        this.useBackend = true; // Usar backend com S3
    }

    // Inicializar banco de dados
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store para páginas/eventos
                if (!db.objectStoreNames.contains('pages')) {
                    const pageStore = db.createObjectStore('pages', { keyPath: 'id' });
                    pageStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Store para fotos
                if (!db.objectStoreNames.contains('photos')) {
                    const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
                    photoStore.createIndex('pageId', 'pageId', { unique: false });
                    photoStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
                }
            };
        });
    }

    // Salvar página/evento
    async savePage(pageData) {
        const transaction = this.db.transaction(['pages'], 'readwrite');
        const store = transaction.objectStore('pages');
        
        return new Promise((resolve, reject) => {
            const request = store.put(pageData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Buscar página por ID
    async getPage(pageId) {
        const transaction = this.db.transaction(['pages'], 'readonly');
        const store = transaction.objectStore('pages');
        
        return new Promise((resolve, reject) => {
            const request = store.get(pageId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Salvar foto
    async savePhoto(photoData) {
        const transaction = this.db.transaction(['photos'], 'readwrite');
        const store = transaction.objectStore('photos');
        
        return new Promise((resolve, reject) => {
            const request = store.put(photoData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Buscar fotos de uma página
    async getPhotos(pageId) {
        const transaction = this.db.transaction(['photos'], 'readonly');
        const store = transaction.objectStore('photos');
        const index = store.index('pageId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(pageId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Deletar foto
    async deletePhoto(photoId) {
        const transaction = this.db.transaction(['photos'], 'readwrite');
        const store = transaction.objectStore('photos');
        
        return new Promise((resolve, reject) => {
            const request = store.delete(photoId);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Converter File para Base64
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Gerar ID único
    generateUniqueId() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 9);
        return `${timestamp}-${randomStr}`;
    }
}

// Instância global
const storage = new StorageManager();
