import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { sendMail } from "@/lib/mailer";

export async function POST(request) {
    try {
        const { title, content, target } = await request.json();

        if (!title || !content || !target) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        let studentsQuery;

        if (target === "All Students") {
            studentsQuery = adminDb.collection("students");
        } else if (target !== "All Users" && target !== "All Teachers") {
            studentsQuery = adminDb.collection("students").where("batch", "==", target);
        } else {
            return NextResponse.json({ message: "Announcement created, no email required for this audience." });
        }

        const studentsSnap = await studentsQuery.get();

        if (studentsSnap.empty) {
            console.warn(`No students found for the target audience: "${target}". No emails will be sent.`);
            return NextResponse.json({ message: "Announcement created, but no student recipients were found for the selected audience." });
        }

        const parentEmails = new Set();
        studentsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.parentEmail) {
                parentEmails.add(data.parentEmail);
            }
        });

        if (parentEmails.size === 0) {
            console.warn(`Found students for "${target}", but none had a 'parentEmail' field. No emails sent.`);
            return NextResponse.json({ message: "Announcement created, but no parent emails are on file for the target students." });
        }

        const emailList = Array.from(parentEmails);

        const subject = `New Announcement from Brightspark Institute: ${title}`;

        // --- UPDATED EMAIL BODY ---
        const emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>New Announcement</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f8f9fa;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000A16; padding: 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 22px; text-transform: uppercase;">BRIGHTSPARK INSTITUTE ✨</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 30px; color: #343a40; line-height: 1.6;">
                      <h2 style="color: #000A16; margin-top: 0; font-size: 20px;">New Announcement: ${title}</h2>
                      <p>Dear Parent/Guardian,</p>
                      <p>Please find the latest announcement from the institute below. This notice is for: <strong>${target}</strong>.</p>
                      
                      <!-- Announcement Content Block -->
                      <div style="background-color: #f1f3f5; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 16px; color: #495057; line-height: 1.7;">
                          ${content.replace(/\n/g, '<br>')}
                        </p>
                      </div>
                      
                      <p style="margin-bottom: 25px;">You can view this and all other announcements by logging into the student portal.</p>
                      
                      <!-- Student Portal Button -->
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="left">
                            <a href="https://brightspark.space/portal/login/student" target="_blank" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block; font-size: 14px; font-weight: bold;">
                              Go to Student Portal
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; text-align: center; background-color: #f1f3f5; border-top: 1px solid #dee2e6;">
                      <p style="color: #6c757d; font-size: 12px; margin: 0 0 10px 0;">Brightspark Institute ✨ Team</p>
                      <p style="color: #6c757d; font-size: 12px; margin: 0;">
                        Follow us on Instagram: <a href="https://www.instagram.com/brightspark_institute23" target="_blank" style="color: #007bff; text-decoration: none;">@brightspark_institute23</a>
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
            to: emailList.join(', '),
            subject: subject,
            html: emailBody,
        });

        return NextResponse.json({ message: `Email sent successfully to ${emailList.length} recipients.` });

    } catch (error) {
        console.error("Error in /api/send-announcement:", error);
        return NextResponse.json({ error: "Failed to send announcement email." }, { status: 500 });
    }
}