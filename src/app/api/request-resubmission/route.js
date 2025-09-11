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

        if (!studentSnap.exists) {
            return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
        }

        const studentData = studentSnap.data();
        const parentEmail = studentData.parentEmail;

        if (!parentEmail) {
            console.log(`Skipping email for ${studentName} (ID: ${studentId}) as no parent email is on file.`);
            return NextResponse.json({ message: "No parent email found, but proceeding with resubmission." }, { status: 200 });
        }

        // 2. Construct and send the email
        const formattedDueDate = new Date(dueDate.seconds * 1000).toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const subject = `Action Required: Resubmission for Assignment "${assignmentTitle}"`;

        // --- THE ONLY CHANGE IS THIS HTML TEMPLATE ---
        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Assignment Resubmission Required</title>
              <style>body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f4f4f7;color:#333333;}</style>
            </head>
            <body style="background-color: #f4f4f7;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                      <!-- Header -->
                      <tr>
                        <td style="background-color:#111827;padding:24px;text-align:center;">
                          <h1 style="color:#FBBF24;margin:0;font-size:24px;letter-spacing:1px;font-weight:bold;">BRIGHTSPARK INSTITUTE</h1>
                        </td>
                      </tr>
                      <!-- Body -->
                      <tr>
                        <td style="padding:32px;">
                          <h2 style="color:#111827;margin-top:0;font-size:28px;font-weight:bold;">Resubmission Required</h2>
                          <p style="color:#4a5568;line-height:1.6;">Hello ${studentName},</p>
                          <p style="color:#4a5568;line-height:1.6;">Your teacher has requested that you resubmit your assignment for: <strong>${assignmentTitle}</strong>.</p>
                          
                          <!-- Teacher Comments Block -->
                          <div style="margin: 32px 0; padding: 20px; background-color: #f7fafc; border-radius: 6px; border-left: 4px solid #FBBF24;">
                            <h3 style="margin-top:0; margin-bottom: 12px; color: #111827; font-size: 16px;">Teacher's Comments:</h3>
                            <p style="margin: 0; font-style: italic; color: #4a5568; line-height: 1.7;">
                              "${teacherComments}"
                            </p>
                          </div>
                          
                          <p style="color:#4a5568;line-height:1.6;">Please review the comments, make the necessary changes, and submit your work again through the student portal.</p>
                          <p style="color:#4a5568;line-height:1.6;">The submission deadline remains: <strong>${formattedDueDate}</strong>.</p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 24px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
                          <p style="color:#718096;font-size:12px;margin:0;">
                            This is an automated notification from Brightspark Institute.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
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