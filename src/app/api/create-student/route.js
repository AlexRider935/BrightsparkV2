// src/app/api/create-student/route.js

import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebase/admin-config";
import { Timestamp } from "firebase-admin/firestore";
import { sendMail } from "@/lib/mailer";

// This is your internal domain for creating user emails.
const INTERNAL_EMAIL_DOMAIN = "brightspark.student";

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password, ...profileData } = body;

        if (!username || !password || !profileData.firstName || !profileData.lastName) {
            return NextResponse.json({ error: "Username, password, and name are required." }, { status: 400 });
        }

        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        const internalEmail = `${username.toLowerCase().trim()}@${INTERNAL_EMAIL_DOMAIN}`;

        const userRecord = await adminAuth.createUser({
            email: internalEmail,
            password: password,
            displayName: fullName,
        });
        const { uid } = userRecord;

        const studentProfile = {
            ...profileData,
            name: fullName,
            username: username.toLowerCase().trim(),
            uid: uid,
            role: "student",
            admissionNo: profileData.rollNumber,
            dob: Timestamp.fromDate(new Date(profileData.dob)),
            admissionDate: Timestamp.fromDate(new Date(profileData.admissionDate)),
            parentContact: profileData.parentContact ? `+91${profileData.parentContact.replace(/\D/g, '')}` : "",
            emergencyContact: profileData.emergencyContact ? `+91${profileData.emergencyContact.replace(/\D/g, '')}` : "",
            whatsappNumber: profileData.whatsappNumber ? `+91${profileData.whatsappNumber.replace(/\D/g, '')}` : "",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const batch = adminDb.batch();
        const studentRef = adminDb.collection("students").doc(uid);
        batch.set(studentRef, studentProfile);

        const userRef = adminDb.collection("users").doc(uid);
        batch.set(userRef, {
            name: fullName,
            username: username.toLowerCase().trim(),
            email: internalEmail,
            role: "student",
        });

        await batch.commit();

        // --- HARDCODED EMAIL LOGIC ---
        if (profileData.parentEmail) {
            try {
                await sendMail({
                    to: profileData.parentEmail,
                    subject: `Welcome to Brightspark Institute, ${profileData.firstName}!`,
                    html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        /* --- STYLE FIX: Ensures links are not purple --- */
        a, a:visited {
            color: #1a0dab !important; /* A standard, dark blue link color */
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div style="font-family: sans-serif; padding: 20px; color: #333333; line-height: 1.6;">
        <h1 style="color: #000A16;">Welcome to Brightspark Institute!</h1>
        <p>Dear Parent/Guardian,</p>
        <p>We are delighted to confirm that <strong>${fullName}</strong> has been successfully enrolled.</p>
        
        <p><strong>Important Information & Credentials:</strong></p>
        <ul>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Password:</strong> ${password}</li>
            ${profileData.batch ? `<li><strong>Assigned Batch:</strong> ${profileData.batch}</li>` : ''}
            <li><strong>Portal Link:</strong> <a href="https://brightspark.space/portal/login/student" target="_blank" style="color: #1a0dab;">https://brightspark.space/portal/login/student</a></li>
        </ul>

        <p><strong>Your Registered Contact Details:</strong></p>
        <ul>
            ${profileData.fatherContact ? `<li><strong>Father's Phone:</strong> ${profileData.fatherContact}</li>` : ''}
            ${profileData.motherContact ? `<li><strong>Mother's Phone:</strong> ${profileData.motherContact}</li>` : ''}
            ${profileData.whatsappNumber ? `<li><strong>WhatsApp Number:</strong> ${profileData.whatsappNumber}</li>` : ''}
            ${profileData.parentEmail ? `<li><strong>Email ID:</strong> ${profileData.parentEmail}</li>` : ''}
        </ul>

        <p>Please connect through Instagram as well for more updates.</p>
        <ul>
            <li><strong>Our Instagram:</strong> <a href="https://www.instagram.com/brightspark_institute23" target="_blank" style="color: #1a0dab;">https://www.instagram.com/brightspark_institute23</a></li>
        </ul>

        <p>Thank you for choosing us for this academic journey.</p>
        <br/>
        <p>Best regards,</p>
        <p>Ankit Mahala</p>
        <p><strong>Team Brightspark✨ Institute</strong></p>
    </div>
</body>
</html>
                    `,
                });
            } catch (mailError) {
                console.error("Student created, but failed to send welcome email:", mailError);
            }
        }
        // --- End of Email Logic ---

        return NextResponse.json({ message: "Student enrolled successfully!", uid: uid }, { status: 201 });

    } catch (error) {
        if (error.code === "auth/email-already-exists") {
            return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
        }
        console.error("Error creating student:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}