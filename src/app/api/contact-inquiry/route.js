import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { Timestamp } from "firebase-admin/firestore";
import { sendMail } from "@/lib/mailer";

export async function POST(request) {
    try {
        const { name, email, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // --- Aligned Data Structure ---
        const inquiryData = {
            studentName: name, // Use studentName to match the admissions page
            parentName: name,  // Use name as a fallback for parent name
            contact: email,    // Use email as the primary contact from the form
            email: email,      // Store the email explicitly
            message: message,  // Store the original message
            classApplied: "Not Specified", // Add a default value
            inquiryDate: Timestamp.now(),
            status: "New Inquiry",
        };

        await adminDb.collection("admissions").add(inquiryData);

        const adminEmail = "brightsparkedu.23@gmail.com";
        const subject = `New Contact Inquiry from ${name}`;
        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"><title>New Contact Inquiry</title>
              <style>body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f4f4f7;color:#333333;}</style>
            </head>
            <body style="background-color: #f4f4f7;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding: 20px;">
                  <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                    <tr><td style="background-color:#111827;padding:24px;text-align:center;"><h1 style="color:#FBBF24;margin:0;font-size:24px;letter-spacing:1px;font-weight:bold;">WEBSITE INQUIRY</h1></td></tr>
                    <tr><td style="padding:32px;">
                      <h2 style="color:#111827;margin-top:0;font-size:28px;font-weight:bold;">New Message Received</h2>
                      <p style="color:#4a5568;">You have received a new inquiry from the website contact form.</p>
                      <div style="margin: 32px 0; padding: 20px; background-color: #f7fafc; border-radius: 6px; border-left: 4px solid #FBBF24;">
                        <p style="margin:0 0 12px 0;color:#4a5568;"><strong>From:</strong> ${name}</p>
                        <p style="margin:0 0 12px 0;color:#4a5568;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#1e40af;text-decoration:none;">${email}</a></p>
                        <h3 style="margin-top:16px; margin-bottom: 8px; color: #111827; font-size: 16px;">Message:</h3>
                        <p style="margin: 0; color: #4a5568; line-height: 1.7;">${message.replace(/\n/g, '<br>')}</p>
                      </div>
                      <p style="color:#4a5568;">This inquiry has also been saved to the 'Admissions' section of the admin portal.</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
        `;

        await sendMail({ to: adminEmail, subject: subject, html: emailBody });

        return NextResponse.json({ message: "Inquiry submitted successfully!" }, { status: 200 });

    } catch (error) {
        console.error("Error in contact inquiry API:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}