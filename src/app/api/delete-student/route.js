// src/app/api/delete-student/route.js

import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebase/admin-config";

export async function POST(request) {
    try {
        const { uid } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: "User ID is required." }, { status: 400 });
        }

        // Use a batch write to ensure all deletions happen together
        const batch = adminDb.batch();

        // Prepare to delete Firestore documents
        const studentRef = adminDb.collection("students").doc(uid);
        const userRef = adminDb.collection("users").doc(uid);

        batch.delete(studentRef);
        batch.delete(userRef);

        // First, delete the user from Firebase Authentication
        await adminAuth.deleteUser(uid);

        // Then, commit the Firestore deletions
        await batch.commit();

        return NextResponse.json({ message: "Student and auth user deleted successfully." }, { status: 200 });

    } catch (error) {
        console.error("Error deleting student:", error);

        // Handle cases where the user might not be found in auth
        if (error.code === 'auth/user-not-found') {
            return NextResponse.json({ error: "Authentication user not found." }, { status: 404 });
        }

        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}