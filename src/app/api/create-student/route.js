// src/app/api/create-student/route.js

import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebase/admin-config";
import { Timestamp } from "firebase-admin/firestore";

// This is your internal domain for creating user emails.
// It won't be visible to students.
const INTERNAL_EMAIL_DOMAIN = "brightspark.student";

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password, ...profileData } = body;

        // 1. UPDATED VALIDATION: Check for firstName and lastName.
        if (!username || !password || !profileData.firstName || !profileData.lastName) {
            return NextResponse.json({ error: "Username, password, and name are required." }, { status: 400 });
        }

        // 2. NEW: Create the full 'name' field on the server.
        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

        // --- Step 1: Create the internal email and the user in Firebase Auth ---
        const internalEmail = `${username.toLowerCase().trim()}@${INTERNAL_EMAIL_DOMAIN}`;

        const userRecord = await adminAuth.createUser({
            email: internalEmail,
            password: password,
            displayName: fullName, // Use the combined full name here
        });
        const { uid } = userRecord;

        // --- Step 2: Prepare the student profile for Firestore ---
        // --- Step 2: Prepare the student profile for Firestore ---
        const studentProfile = {
            ...profileData,
            name: fullName,
            username: username.toLowerCase().trim(),
            uid: uid,
            role: "student",
            admissionNo: profileData.rollNumber,
            dob: Timestamp.fromDate(new Date(profileData.dob)),
            admissionDate: Timestamp.fromDate(new Date(profileData.admissionDate)),
            // Add safety checks for contact numbers
            parentContact: profileData.parentContact ? `+91${profileData.parentContact.replace(/\D/g, '')}` : "",
            emergencyContact: profileData.emergencyContact ? `+91${profileData.emergencyContact.replace(/\D/g, '')}` : "",
            whatsappNumber: profileData.whatsappNumber ? `+91${profileData.whatsappNumber.replace(/\D/g, '')}` : "",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // --- Step 3: Create documents in Firestore using a Batch Write ---
        const batch = adminDb.batch();

        // Doc 1: The main 'students' profile
        const studentRef = adminDb.collection("students").doc(uid);
        batch.set(studentRef, studentProfile);

        // Doc 2: The 'users' role document for login and role checks
        const userRef = adminDb.collection("users").doc(uid);
        batch.set(userRef, {
            name: fullName, // Use the combined name
            username: username.toLowerCase().trim(),
            email: internalEmail, // Store for reference
            role: "student",
        });

        await batch.commit();

        return NextResponse.json({ message: "Student enrolled successfully!", uid: uid }, { status: 201 });

    } catch (error) {
        if (error.code === "auth/email-already-exists") {
            return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
        }
        console.error("Error creating student:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}