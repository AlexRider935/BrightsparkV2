// src/app/api/create-teacher/route.js

import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebase/admin-config";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, ...profileData } = body;

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ error: "Email, password, and name are required." }, { status: 400 });
        }

        const fullName = `${firstName} ${lastName}`.trim();

        // --- Step 1: Create user in Firebase Authentication ---
        const userRecord = await adminAuth.createUser({
            email: email,
            password: password,
            displayName: fullName,
            // THIS IS THE FIX: Use 'undefined' to omit the photoURL property if it's empty,
            // which prevents the Firebase Auth error.
            photoURL: profileData.photoURL || undefined,
        });
        const { uid } = userRecord;

        // --- Step 2: Prepare the complete teacher profile for Firestore ---
        const teacherProfile = {
            ...profileData,
            uid: uid,
            email: email,
            firstName: firstName,
            lastName: lastName,
            name: fullName,
            role: "teacher",
            dob: profileData.dob ? Timestamp.fromDate(new Date(profileData.dob)) : null,
            joiningDate: profileData.joiningDate ? Timestamp.fromDate(new Date(profileData.joiningDate)) : null,
            contact: profileData.contact ? `+91${profileData.contact.replace(/\D/g, '')}` : "",
            whatsappNumber: profileData.whatsappNumber ? `+91${profileData.whatsappNumber.replace(/\D/g, '')}` : "",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        delete teacherProfile.password;

        // --- Step 3: Create documents in Firestore using a Batch Write ---
        const batch = adminDb.batch();

        const teacherRef = adminDb.collection("teachers").doc(uid);
        batch.set(teacherRef, teacherProfile);

        const userRef = adminDb.collection("users").doc(uid);
        batch.set(userRef, {
            name: fullName,
            email: email,
            role: "teacher",
            // Storing null in Firestore is good practice for an empty photo field.
            photoURL: profileData.photoURL || null,
        });

        await batch.commit();

        return NextResponse.json({ message: "Teacher added successfully!", uid: uid }, { status: 201 });

    } catch (error) {
        // Handle specific Firebase Auth errors
        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json({ error: "This email is already in use by another account." }, { status: 409 });
        }
        if (error.code === 'auth/invalid-photo-url') {
            return NextResponse.json({ error: "The provided photo URL is invalid." }, { status: 400 });
        }

        console.error("Error creating teacher:", error);
        // Return a generic error for other issues
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}