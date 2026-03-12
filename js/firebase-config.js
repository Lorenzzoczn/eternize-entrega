// ===== FIREBASE CONFIGURATION =====
// Firebase SDK v9+ modular approach

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    const firebaseConfig = {
    apiKey: "AIzaSyANrqvq_ZjepSEevdTVGFxgaypSWXrzGZY",
    authDomain: "eternize-7f239.firebaseapp.com",
    projectId: "eternize-7f239",
    storageBucket: "eternize-7f239.firebasestorage.app",
    messagingSenderId: "689311110767",
    appId: "1:689311110767:web:58413961ea6df7b14c5f9a",
    measurementId: "G-5FEY9JPM67"
};
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// ===== FIREBASE STORAGE MANAGER =====
class FirebaseStorageManager {
    constructor() {
        this.storage = storage;
        this.db = db;
    }

    // Generate unique token
    generateToken() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 12; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    // Create event with token
    async createEvent(eventData) {
        try {
            const token = this.generateToken();
            const eventId = `event_${Date.now()}`;
            
            const event = {
                id: eventId,
                token: token,
                nome_evento: eventData.nome_evento,
                data_evento: eventData.data_evento,
                tema: eventData.tema || 'neutro',
                cores: eventData.cores || {
                    primaria: '#E4D9B6',
                    secundaria: '#FFD1DC'
                },
                criado_em: new Date().toISOString(),
                ativo: true
            };

            // Save to Firestore
            await setDoc(doc(this.db, 'eventos', eventId), event);
            
            return { success: true, event, token };
        } catch (error) {
            console.error('Error creating event:', error);
            return { success: false, error: error.message };
        }
    }

    // Get event by token
    async getEventByToken(token) {
        try {
            const q = query(
                collection(this.db, 'eventos'), 
                where('token', '==', token),
                where('ativo', '==', true)
            );
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return { success: false, error: 'Evento não encontrado' };
            }

            const eventDoc = querySnapshot.docs[0];
            return { success: true, event: eventDoc.data() };
        } catch (error) {
            console.error('Error getting event:', error);
            return { success: false, error: error.message };
        }
    }

    // Upload photo to Firebase Storage
    async uploadPhoto(file, token, metadata = {}) {
        try {
            // Validate file
            if (!file || !file.type.startsWith('image/')) {
                throw new Error('Arquivo deve ser uma imagem');
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('Arquivo muito grande. Máximo 10MB');
            }

            // Get event
            const eventResult = await this.getEventByToken(token);
            if (!eventResult.success) {
                throw new Error('Evento não encontrado');
            }

            const event = eventResult.event;
            const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const fileName = `${photoId}.${file.name.split('.').pop()}`;
            
            // Create storage reference
            const storageRef = ref(this.storage, `eventos/${token}/${fileName}`);
            
            // Upload file
            const snapshot = await uploadBytes(storageRef, file, {
                customMetadata: {
                    originalName: file.name,
                    uploadedBy: metadata.uploadedBy || 'anonymous',
                    message: metadata.message || ''
                }
            });

            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Save photo metadata to Firestore
            const photoData = {
                id: photoId,
                evento_id: event.id,
                token: token,
                url: downloadURL,
                storage_path: snapshot.ref.fullPath,
                original_name: file.name,
                size: file.size,
                type: file.type,
                uploaded_by: metadata.uploadedBy || 'anonymous',
                message: metadata.message || '',
                criado_em: new Date().toISOString(),
                aprovado: false
            };

            await setDoc(doc(this.db, 'fotos', photoId), photoData);

            return { success: true, photo: photoData };
        } catch (error) {
            console.error('Error uploading photo:', error);
            return { success: false, error: error.message };
        }
    }

    // Get photos by token
    async getPhotosByToken(token, approved = null) {
        try {
            let q = query(
                collection(this.db, 'fotos'),
                where('token', '==', token),
                orderBy('criado_em', 'desc')
            );

            if (approved !== null) {
                q = query(
                    collection(this.db, 'fotos'),
                    where('token', '==', token),
                    where('aprovado', '==', approved),
                    orderBy('criado_em', 'desc')
                );
            }

            const querySnapshot = await getDocs(q);
            const photos = [];

            querySnapshot.forEach((doc) => {
                photos.push(doc.data());
            });

            return { success: true, photos };
        } catch (error) {
            console.error('Error getting photos:', error);
            return { success: false, error: error.message };
        }
    }

    // Approve photo
    async approvePhoto(photoId) {
        try {
            await setDoc(doc(this.db, 'fotos', photoId), { aprovado: true }, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Error approving photo:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete photo
    async deletePhoto(photoId) {
        try {
            // Get photo data
            const photoDoc = await getDoc(doc(this.db, 'fotos', photoId));
            if (!photoDoc.exists()) {
                throw new Error('Foto não encontrada');
            }

            const photoData = photoDoc.data();

            // Delete from Storage
            const storageRef = ref(this.storage, photoData.storage_path);
            await deleteObject(storageRef);

            // Delete from Firestore
            await deleteDoc(doc(this.db, 'fotos', photoId));

            return { success: true };
        } catch (error) {
            console.error('Error deleting photo:', error);
            return { success: false, error: error.message };
        }
    }

    // Get event statistics
    async getEventStats(token) {
        try {
            const photosResult = await this.getPhotosByToken(token);
            if (!photosResult.success) {
                return { success: false, error: photosResult.error };
            }

            const photos = photosResult.photos;
            const approved = photos.filter(p => p.aprovado).length;
            const pending = photos.filter(p => !p.aprovado).length;
            const contributors = new Set(photos.map(p => p.uploaded_by)).size;

            return {
                success: true,
                stats: {
                    total: photos.length,
                    approved,
                    pending,
                    contributors
                }
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export instance
export const firebaseManager = new FirebaseStorageManager();
export { storage, db };