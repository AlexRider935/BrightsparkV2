import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { sendMail } from "@/lib/mailer";

export async function POST(request) {
    try {
        const { studentId, assignmentTitle, teacherComments, studentName, dueDate } = await request.json();

        if (!studentId || !assignmentTitle || !teacherComments || !studentName || !dueDate) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        // 1. Fetch the student's document to get their parent's email
        const studentRef = adminDb.collection("students").doc(studentId);
        const studentSnap = await studentRef.get();

        // --- FIX: Changed .exists() to the .exists property ---
        if (!studentSnap.exists) {
            return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
        }

        const studentData = studentSnap.data();
        const parentEmail = studentData.parentEmail;

        if (!parentEmail) {
            console.log(`Skipping email for ${studentName} (ID: ${studentId}) as no parent email is on file.`);
            // We can still return success because the main goal is to allow resubmission.
            return NextResponse.json({ message: "No parent email found, but proceeding with resubmission." }, { status: 200 });
        }

        // 2. Construct and send the email
        const formattedDueDate = new Date(dueDate.seconds * 1000).toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const subject = `Action Required: Resubmission for Assignment "${assignmentTitle}"`;

        const emailBody = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Hello ${studentName},</h2>
        <p>Your teacher has requested that you resubmit your assignment:</p>
        <p style="font-size: 1.2em; font-weight: bold;">${assignmentTitle}</p>
        <p>Your teacher left the following comments:</p>
        <blockquote style="background-color: #f4f4f4; border-left: 5px solid #ccc; padding: 15px; margin: 15px 0;">
          <p><em>"${teacherComments}"</em></p>
        </blockquote>
        <p>Please review the comments, make the necessary changes, and submit your work again through the student portal.</p>
        <p>The deadline remains: <strong>${formattedDueDate}</strong>.</p>
        <hr>
        <p style="font-size: 0.9em; color: #777;">This is an automated notification from Brightspark Institute.</p>
      </div>
    `;

        await sendMail({
            to: parentEmail,
            subject: subject,
            html: emailBody,
        });

        return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 });

    } catch (error) {
        console.error("Error in /api/request-resubmission:", error);
        return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }
}