// src/app/api/change-password/route.js

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/firebase/admin-config";
import { headers } from "next/headers";

export async function POST(request) {
    try {
        const { newPassword } = await request.json();

        // 1. Get the user's token from the request headers
        const authorization = headers().get("Authorization");
        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized: No token provided." }, { status: 401 });
        }
        const idToken = authorization.split("Bearer ")[1];

        // 2. Verify the token to get the user's UID
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
        }

        // 3. Perform both updates in a transaction for safety
        const studentRef = adminDb.collection("students").doc(uid);

        await adminDb.runTransaction(async (transaction) => {
            // First, update the password in Firebase Authentication (securely hashed)
            await adminAuth.updateUser(uid, {
                password: newPassword,
            });

            // Second, save the plaintext password to the student's Firestore document
            transaction.update(studentRef, {
                plaintextPassword: newPassword, // This is the plaintext field for admins
            });
        });

        return NextResponse.json({ message: "Password updated successfully." });

    } catch (error) {
        console.error("Error changing password:", error);
        // Provide a more specific error for client-side handling
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: "Your session has expired. Please log in again to change your password.", code: "SESSION_EXPIRED" }, { status: 401 });
        }
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}