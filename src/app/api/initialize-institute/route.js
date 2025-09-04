import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Helper to check if a collection is empty and add a placeholder if so
async function initializeCollection(collectionName) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
        // Add a placeholder document to create the collection
        const placeholderRef = doc(collectionRef, '--placeholder--');
        await setDoc(placeholderRef, { initialized: true });
        console.log(`Collection '${collectionName}' was empty. Initialized with a placeholder.`);
        return `Collection '${collectionName}' created.`;
    } else {
        console.log(`Collection '${collectionName}' already exists. No action taken.`);
        return `Collection '${collectionName}' already exists.`;
    }
}

export async function GET() {
    try {
        // Initialize only the collections needed for the "Manage Teachers" page.
        const teacherStatus = await initializeCollection('teachers');
        const subjectStatus = await initializeCollection('subjects');

        return NextResponse.json({
            message: 'Initialization complete.',
            details: [teacherStatus, subjectStatus]
        });
    } catch (error) {
        console.error("Error initializing database:", error);
        return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
    }
}
