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
            </head>
            <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f8f9fa;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden;">
                      <tr>
                        <td style="background-color: #000A16; padding: 20px;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Brightspark Institute</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px; color: #343a40; line-height: 1.6;">
                          <h2 style="color: #000A16; margin-top: 0; font-size: 20px;">Results Published</h2>
                          <p>Dear Parent/Guardian,</p>
                          <p>The results for the assessment "<strong>${assessment.title}</strong>" for <strong>${student.name}</strong> have been published.</p>
                          
                          <div style="background-color: #f1f3f5; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0; font-size: 16px; color: #495057;">Score achieved:</p>
                            <p style="margin: 10px 0; font-size: 36px; font-weight: bold; color: #000A16;">
                              ${grade.score} <span style="font-size: 20px; color: #6c757d;">/ ${assessment.totalMarks}</span>
                            </p>
                            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #28a745;">${percentage}%</p>
                          </div>
                          
                          <p>You can view a detailed performance report by logging into the student portal.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px; text-align: center; background-color: #f1f3f5; border-top: 1px solid #dee2e6;">
                          <p style="color: #6c757d; font-size: 12px; margin: 0;">The Brightspark Institute Team</p>
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