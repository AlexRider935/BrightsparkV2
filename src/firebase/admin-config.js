// src/firebase/admin-config.js

import admin from 'firebase-admin';
import { getApps, getApp } from 'firebase-admin/app';

// This line reads the service account key from your environment variables
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize the app if it's not already initialized
const app = !getApps().length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
    : getApp();

export const adminDb = admin.firestore(app);
export const adminAuth = admin.auth(app);