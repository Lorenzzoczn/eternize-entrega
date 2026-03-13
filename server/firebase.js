const admin = require('firebase-admin');

// Initialize Firebase Admin only once, in a centralized module.
// Service account and bucket come from environment/config.
if (!admin.apps.length) {
  // Prefer GOOGLE_APPLICATION_CREDENTIALS env var when deployed.
  // Fallback to local service account file for development.
  let credential;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = admin.credential.applicationDefault();
  } else {
    // Local development: require bundled service account file
    // (ensure this file is NOT committed for production environments).
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const serviceAccount = require('./firebase-service-account.json');
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({
    credential,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET || 'eternize-7f239.firebasestorage.app',
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };