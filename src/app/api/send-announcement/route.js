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
              <h2 style="color:#111827;margin-top:0;font-size:28px;font-weight:bold;">New Announcement: ${title}</h2>
              <p style="color:#4a5568;line-height:1.6;">Dear Parent/Guardian,</p>
              <p style="color:#4a5568;line-height:1.6;">Please find the latest announcement from the institute below. This notice is for: <strong>${target}</strong>.</p>
              
              <!-- Announcement Content Block -->
              <div style="margin: 32px 0; padding: 20px; background-color: #f7fafc; border-radius: 6px; border-left: 4px solid #FBBF24;">
                <p style="margin: 0; font-size: 16px; color: #4a5568; line-height: 1.7;">
                  ${content.replace(/\n/g, '<br>')}
                </p>
              </div>
              
              <p style="color:#4a5568;margin-bottom: 25px;line-height:1.6;">You can view this and all other announcements by logging into the student portal.</p>
              
              <!-- Student Portal Button -->
              <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left">
                    <a href="https://brightspark.space/portal/login/student" target="_blank" style="background-color: #FBBF24; color: #111827; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: bold;">
                      Go to Student Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
              <p style="color:#718096;font-size:12px;margin:0;">
                Follow us on Instagram: <a href="https://www.instagram.com/brightspark_institute23" target="_blank" style="color:#1e40af;text-decoration:none;font-weight:bold;">@brightspark_institute23</a>
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