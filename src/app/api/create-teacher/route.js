// src/app/api/create-teacher/route.js

import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebase/admin-config";
import { Timestamp } from "firebase-admin/firestore";

// 1. Define an internal email domain for teachers
const INTERNAL_EMAIL_DOMAIN = "brightspark.teacher";

export async function POST(request) {
    try {
        const body = await request.json();
        // 2. Destructure 'username' instead of 'email' from the request
        const { username, password, firstName, lastName, ...profileData } = body;

        // Use the username (Employee ID) for the validation check
        if (!username || !password || !firstName || !lastName) {
            return NextResponse.json({ error: "Username, password, and name are required." }, { status: 400 });
        }

        const fullName = `${firstName} ${lastName}`.trim();

        // 3. Construct the internal email from the username
        const internalEmail = `${username.toLowerCase().trim()}@${INTERNAL_EMAIL_DOMAIN}`;


        // --- Step 1: Create user in Firebase Authentication using the internal email ---
        const userRecord = await adminAuth.createUser({
            email: internalEmail,
            password: password,
            displayName: fullName,
            photoURL: profileData.photoURL || undefined,
        });
        const { uid } = userRecord;

        // --- Step 2: Prepare the complete teacher profile for Firestore ---
        const teacherProfile = {
            ...profileData,
            uid: uid,
            username: username, // Add username to the profile
            email: internalEmail, // Store the internal email
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
            username: username, // Add username here too
            email: internalEmail,
            role: "teacher",
            photoURL: profileData.photoURL || null,
        });

        await batch.commit();

        return NextResponse.json({ message: "Teacher added successfully!", uid: uid }, { status: 201 });

    } catch (error) {
        // 4. Update the error message for clarity
        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json({ error: "This Employee ID (username) is already taken." }, { status: 409 });
        }
        if (error.code === 'auth/invalid-photo-url') {
            return NextResponse.json({ error: "The provided photo URL is invalid." }, { status: 400 });
        }

        console.error("Error creating teacher:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}