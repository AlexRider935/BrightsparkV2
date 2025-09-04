import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, doc, setDoc, getDocs, Timestamp } from 'firebase/firestore';

// Helper function to check if a collection is empty and initialize it with a placeholder.
async function initializeCollection(collectionName) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
        const placeholderRef = doc(collectionRef, '--placeholder--');
        await setDoc(placeholderRef, { initialized: true, createdAt: Timestamp.now() });
        console.log(`Collection '${collectionName}' was empty. Initialized with a placeholder.`);
        return `Collection '${collectionName}' created.`;
    } else {
        console.log(`Collection '${collectionName}' already exists. No action taken.`);
        return `Collection '${collectionName}' already exists.`;
    }
}

export async function GET() {
    try {
        console.log("Database initialization process started for Assignments...");

        // Initialize only the 'assignments' collection.
        const assignmentStatus = await initializeCollection('assignments');

        console.log("Database initialization process finished.");
        return NextResponse.json({
            message: 'Initialization complete.',
            details: [assignmentStatus]
        });
    } catch (error) {
        console.error("Error initializing database:", error);
        return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
    }
}