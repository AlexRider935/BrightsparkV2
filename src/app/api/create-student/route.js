import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebase/admin-config";
import { Timestamp } from "firebase-admin/firestore";
import { sendMail } from "@/lib/mailer";

// This is your internal domain for creating user emails.
const INTERNAL_EMAIL_DOMAIN = "brightspark.student";

// Helper function to safely create a Timestamp from a date string or return null
function createTimestamp(dateString) {
  if (dateString && !isNaN(new Date(dateString))) {
    return Timestamp.fromDate(new Date(dateString));
  }
  return null;
}

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

      // --- FIX APPLIED HERE ---
      dob: createTimestamp(profileData.dob),
      admissionDate: createTimestamp(profileData.admissionDate),

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

    // --- THEMED EMAIL LOGIC ---
    if (profileData.parentEmail) {
      try {
        // Themed HTML template
        const themedHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <title>Welcome to Brightspark Institute</title>
                      <style>
                        body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f4f4f7;color:#333333;}
                        a, a:visited { text-decoration: none; }
                      </style>
                    </head>
                    <body style="background-color: #f4f4f7;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px;">
                            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                              <tr>
                                <td style="background-color:#111827;padding:24px;text-align:center;">
                                  <h1 style="color:#FBBF24;margin:0;font-size:24px;letter-spacing:1px;font-weight:bold;">BRIGHTSPARK INSTITUTE</h1>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:32px;">
                                  <h2 style="color:#111827;margin-top:0;font-size:28px;font-weight:bold;">Welcome Aboard!</h2>
                                  <p style="color:#4a5568;line-height:1.6;">Dear Parent/Guardian,</p>
                                  <p style="color:#4a5568;line-height:1.6;">We are delighted to confirm that <strong>${fullName}</strong> has been successfully enrolled.</p>
                                  
                                  <div style="margin: 32px 0; padding: 20px; background-color: #f7fafc; border-radius: 6px; border-left: 4px solid #FBBF24;">
                                    <h3 style="margin-top:0; margin-bottom: 16px; color: #111827; font-size: 18px;">Login Credentials</h3>
                                    <ul style="list-style:none;padding:0;margin:0;color:#4a5568;font-size:14px;line-height:1.8;">
                                      <li><strong>Username:</strong> <span style="color:#1a202c; font-weight:bold;">${username}</span></li>
                                      <li><strong>Password:</strong> <span style="color:#1a202c; font-weight:bold;">${password}</span></li>
                                      ${profileData.batch ? `<li><strong>Assigned Batch:</strong> ${profileData.batch}</li>` : ''}
                                    </ul>
                                  </div>

                                  <div style="margin: 32px 0; padding: 20px; background-color: #f7fafc; border-radius: 6px;">
                                    <h3 style="margin-top:0; margin-bottom: 16px; color: #111827; font-size: 18px;">Your Registered Contact Details</h3>
                                    <ul style="list-style:none;padding:0;margin:0;color:#4a5568;font-size:14px;line-height:1.8;">
                                      ${profileData.fatherContact ? `<li><strong>Father's Phone:</strong> ${profileData.fatherContact}</li>` : ''}
                                      ${profileData.motherContact ? `<li><strong>Mother's Phone:</strong> ${profileData.motherContact}</li>` : ''}
                                      ${profileData.whatsappNumber ? `<li><strong>WhatsApp Number:</strong> ${profileData.whatsappNumber}</li>` : ''}
                                      ${profileData.parentEmail ? `<li><strong>Email ID:</strong> ${profileData.parentEmail}</li>` : ''}
                                    </ul>
                                  </div>

                                  <p style="color:#4a5568;line-height:1.6;">Thank you for this academic journey. Please feel free to log in to the student portal.</p>
                                  <br/>
                                  <p style="color:#4a5568;line-height:1.6;margin:0;">Best regards,</p>
                                  <p style="color:#1a202c;font-weight:bold;margin:4px 0 0 0;">Team Brightspark Institute</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 24px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
                                  
                                  <!-- THIS IS THE ONLY LINE THAT HAS BEEN ADDED -->
                                  <p style="color:#718096;font-size:12px;margin:0 0 8px 0;">Portal Link: <a href="https://www.brightspark.space/portal/login/student" target="_blank" style="color:#1e40af;text-decoration:none;font-weight:bold;">Click here</a></p>
                                  
                                  <p style="color:#718096;font-size:12px;margin:0;">Follow us on Instagram: <a href="https://www.instagram.com/brightspark_institute23" target="_blank" style="color:#1e40af;text-decoration:none;font-weight:bold;">@brightspark_institute23</a></p>
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
          to: profileData.parentEmail,
          subject: `Welcome to Brightspark Institute, ${profileData.firstName}!`,
          html: themedHtml,
        });
      } catch (mailError) {
        console.error("Student created, but failed to send welcome email:", mailError);
      }
    }
    // --- End of Email Logic ---

    return NextResponse.json({ message: "Student enrolled successfully!", uid: uid }, { status: 201 });

  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      // This now correctly checks for the internal email, which is based on the username.
      return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
    }
    console.error("Error creating student:", error);
    return NextResponse.json({ error: `An internal server error occurred: ${error.message}` }, { status: 500 });
  }
}