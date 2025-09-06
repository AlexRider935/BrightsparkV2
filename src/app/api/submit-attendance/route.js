// src/app/api/submit-attendance/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { Timestamp, FieldValue, FieldPath } from "firebase-admin/firestore";
import { format } from "date-fns";
import { sendMail } from "@/lib/mailer";

export async function POST(request) {
    try {
        const body = await request.json();
        const { batchId, batchName, date, studentStatus, teacherName } = body;

        // --- Validation and Security Checks ---
        if (!batchId || !date || !studentStatus) {
            return NextResponse.json({ error: "Missing required attendance data." }, { status: 400 });
        }
        const submissionDate = new Date(date);
        const today = new Date();
        if (format(submissionDate, "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")) {
            return NextResponse.json({ error: "Attendance can only be marked for the current day." }, { status: 403 });
        }
        const dateKey = format(submissionDate, "yyyy-MM-dd");
        const attendanceDocId = `${batchId}_${dateKey}`;
        const masterRecordRef = adminDb.collection("attendanceRecords").doc(attendanceDocId);
        const existingRecord = await masterRecordRef.get();
        if (existingRecord.exists) {
            return NextResponse.json({ error: "Attendance for this batch has already been submitted today and is locked." }, { status: 409 });
        }

        // --- Perform the Dual Write using a Batch ---
        const batch = adminDb.batch();
        const masterRecord = {
            batchId, batchName, date: Timestamp.fromDate(submissionDate),
            teacherName: teacherName || "N/A", studentStatus, submittedAt: FieldValue.serverTimestamp(),
        };
        batch.set(masterRecordRef, masterRecord);

        for (const studentId in studentStatus) {
            const studentAttendanceRef = adminDb.collection("students").doc(studentId).collection("attendance").doc(dateKey);
            batch.set(studentAttendanceRef, {
                status: studentStatus[studentId], batchId, batchName,
                date: Timestamp.fromDate(submissionDate), markedBy: teacherName || "N/A",
            });
        }

        // Commit the attendance records to the database first
        await batch.commit();

        // --- NEW: Send Absentee Notifications ---
        try {
            // 1. Find all students who were marked absent
            const absentStudentIds = Object.keys(studentStatus).filter(id => studentStatus[id] === 'Absent');

            if (absentStudentIds.length > 0) {
                // 2. Fetch the email template from Firestore
                const templatesRef = adminDb.collection("settings").doc("emailTemplates");
                const templateDoc = await templatesRef.get();
                const absentTemplate = templateDoc.data()?.absentNotification;

                if (absentTemplate) {
                    // 3. Fetch all absent students' data in a single efficient query
                    const studentsRef = adminDb.collection('students');
                    const studentsSnap = await studentsRef.where(FieldPath.documentId(), 'in', absentStudentIds).get();
                    const emailPromises = [];
                    studentsSnap.forEach(doc => {
                        const studentData = doc.data();
                        // 4. For each student with a parent email, prepare and send the notification
                        if (studentData.parentEmail) {
                            const formattedDate = format(submissionDate, "EEEE, dd MMMM yyyy");
                            let finalSubject = absentTemplate.subject.replace(/{{studentName}}/g, studentData.name).replace(/{{date}}/g, formattedDate);
                            let finalBody = absentTemplate.body
                                .replace(/{{studentName}}/g, studentData.name)
                                .replace(/{{date}}/g, formattedDate)
                                .replace(/{{batchName}}/g, batchName);

                            emailPromises.push(sendMail({
                                to: studentData.parentEmail,
                                subject: finalSubject,
                                html: finalBody,
                            }));
                        }
                    });

                    // 5. Send all emails in parallel and log the outcome
                    await Promise.allSettled(emailPromises);
                    console.log(`Attempted to send ${emailPromises.length} absentee notifications.`);
                } else {
                    console.error("Absentee notification template not found in Firestore.");
                }
            }
        } catch (emailError) {
            // Log the email error but don't fail the entire request,
            // as the attendance has already been successfully saved.
            console.error("Attendance saved, but failed to send absentee emails:", emailError);
        }
        // --- END OF NEW LOGIC ---

        return NextResponse.json({ message: "Attendance submitted successfully!" }, { status: 201 });

    } catch (error) {
        console.error("Error submitting attendance:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}