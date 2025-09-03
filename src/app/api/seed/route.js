import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export async function GET() {
    try {
        const teachersCollection = collection(db, 'teachers');
        const batchesCollection = collection(db, 'batches');

        // Clear existing collections if needed (optional)
        // For a fresh start, you might want to manually clear them in the Firebase console.

        // Seed Teachers (as placeholders for now)
        const teachers = [
            { name: "Mr. A. K. Sharma" },
            { name: "Mrs. S. Gupta" },
            { name: "Mr. R. Verma" },
            { name: "Ms. P. Singh" },
        ];

        // Use a transaction or batch write for atomicity
        for (const teacher of teachers) {
            await addDoc(teachersCollection, teacher);
        }
        console.log("Seeded Teachers");

        // Seed Batches
        const batches = [
            { name: "Foundation Batch", classLevel: "Class VI", teacher: "Mr. A. K. Sharma", capacity: 25, status: "Active" },
            { name: "Olympiad Batch", classLevel: "Class VII", teacher: "Mrs. S. Gupta", capacity: 20, status: "Active" },
        ];

        for (const batch of batches) {
            await addDoc(batchesCollection, { ...batch, studentCount: 0 }); // Add studentCount
        }
        console.log("Seeded Batches");

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error("Error seeding database:", error);
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}