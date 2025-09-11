import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { sendMail } from "@/lib/mailer";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request) {
  try {
    const { assessmentId } = await request.json();
    if (!assessmentId) {
      return NextResponse.json({ error: "Assessment ID is required." }, { status: 400 });
    }

    const assessmentRef = adminDb.collection("assessments").doc(assessmentId);
    const gradesRef = adminDb.collection("grades").doc(assessmentId);

    const [assessmentDoc, gradesDoc] = await Promise.all([
      assessmentRef.get(),
      gradesRef.get(),
    ]);

    if (!assessmentDoc.exists) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    if (!gradesDoc.exists) return NextResponse.json({ error: "No grades saved for this assessment." }, { status: 404 });

    const assessment = assessmentDoc.data();
    const gradesData = gradesDoc.data().studentData || {};
    const studentUids = Object.keys(gradesData);

    if (studentUids.length === 0) return NextResponse.json({ error: "No students have grades." }, { status: 400 });

    const studentDocs = await Promise.all(
      studentUids.map(uid => adminDb.collection('students').doc(uid).get())
    );

    const emailPromises = studentDocs.map(async (studentDoc) => {
      if (!studentDoc.exists) return;

      const student = studentDoc.data();
      const grade = gradesData[student.uid];

      if (student.parentEmail && grade) {
        const percentage = Math.round((grade.score / assessment.totalMarks) * 100);

        // --- NEW, IMPROVED HTML TEMPLATE ---
        await sendMail({
          to: student.parentEmail,
          subject: `Results Published for ${assessment.title}`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Results Published</title>
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
              <h2 style="color:#111827;margin-top:0;font-size:28px;font-weight:bold;">Results Published</h2>
              <p style="color:#4a5568;line-height:1.6;">Dear Parent/Guardian,</p>
              <p style="color:#4a5568;line-height:1.6;">The results for the "<strong>${assessment.title}</strong>" assessment for <strong>${student.name}</strong> have now been published.</p>
              
              <!-- Score Display Block -->
              <div style="margin: 32px 0; padding: 20px; background-color: #f7fafc; border-radius: 6px; border-left: 4px solid #FBBF24; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #4a5568;">Score achieved:</p>
                <p style="margin: 10px 0; font-size: 42px; font-weight: bold; color: #111827; line-height: 1;">
                  ${grade.score} <span style="font-size: 24px; color: #718096; font-weight: normal;">/ ${assessment.totalMarks}</span>
                </p>
                <p style="margin: 0; font-size: 22px; font-weight: bold; color: #22c55e;">${percentage}%</p>
              </div>
              
              <p style="color:#4a5568;line-height:1.6;">You can view a detailed performance report by logging into the student portal.</p>
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
          `,
        });
      }
    });

    await Promise.all(emailPromises);

    await assessmentRef.update({
      isPublished: true,
      publishedAt: Timestamp.now(),
    });

    return NextResponse.json({ message: "Results published and emails sent successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Error publishing results:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}