import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { sendMail } from "@/lib/mailer";
import { Timestamp } from "firebase-admin/firestore";
import { format } from 'date-fns';

export async function POST(request) {
    try {
        const { student, installment, paymentData } = await request.json();

        if (!student || !installment || !paymentData) {
            return NextResponse.json({ error: "Missing required payment data." }, { status: 400 });
        }

        const paymentDate = new Date(paymentData.paymentDate);

        // --- Step 1: Perform Database Operations Atomically ---
        const batch = adminDb.batch();

        // Reference to the student's fee detail document
        const feeDetailRef = adminDb.collection("studentFeeDetails").doc(student.id);

        // Create a reference for a new document in the historical transactions collection
        const transactionRef = adminDb.collection("feeTransactions").doc();

        const feeDetailDoc = await feeDetailRef.get();
        if (!feeDetailDoc.exists) {
            throw new Error("Student fee details not found.");
        }

        const currentInstallments = feeDetailDoc.data().installments || [];
        const updatedInstallments = currentInstallments.map(inst => {
            // Find the matching installment by description and due date to update it
            if (inst.description === installment.description && inst.dueDate.isEqual(installment.dueDate)) {
                return {
                    ...inst,
                    status: 'paid',
                    paymentDate: Timestamp.fromDate(paymentDate),
                    amountPaid: Number(paymentData.amountPaid),
                    paymentMethod: paymentData.paymentMethod
                };
            }
            return inst;
        });

        // Add the updates to the batch
        batch.update(feeDetailRef, { installments: updatedInstallments });
        batch.set(transactionRef, {
            studentId: student.id,
            studentName: student.name,
            amount: Number(paymentData.amountPaid),
            paymentDate: Timestamp.fromDate(paymentDate),
            paymentMethod: paymentData.paymentMethod,
            description: installment.description,
            createdAt: Timestamp.now()
        });

        await batch.commit(); // Commit both database changes at once

        // --- Step 2: Send the Receipt Email ---
        const parentEmail = student.parentEmail;
        if (parentEmail) {
            const subject = `Fee Payment Receipt from Brightspark Institute`;
            const emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Fee Payment Receipt</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f8f9fa;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden;">
                  <tr>
                    <td style="background-color: #000A16; padding: 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 22px; text-transform: uppercase;">BRIGHTSPARK INSTITUTE ✨</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; color: #343a40; line-height: 1.6;">
                      <h2 style="color: #000A16; margin-top: 0; font-size: 20px;">Payment Received!</h2>
                      <p>Dear Parent/Guardian,</p>
                      <p>Thank you for your payment. We have successfully received the fee for <strong>${student.name}</strong>. Here are the details:</p>
                      
                      <div style="background-color: #f1f3f5; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #495057;">Payment for: <strong>${installment.description}</strong></p>
                        <p style="margin: 0; font-size: 32px; font-weight: bold; color: #000A16;">
                          ₹${Number(paymentData.amountPaid).toLocaleString('en-IN')}
                        </p>
                        <p style="margin: 10px 0 0; font-size: 14px; color: #495057;">
                          Paid on ${format(paymentDate, 'MMMM dd, yyyy')} via ${paymentData.paymentMethod}
                        </p>
                      </div>
                      
                      <p>This payment has been recorded in the student portal.</p>
                    </td>
                  </tr>
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

            await sendMail({ to: parentEmail, subject, html: emailBody });
        }

        return NextResponse.json({ message: "Payment processed successfully!" });

    } catch (error) {
        console.error("Error in /api/collect-fee:", error);
        return NextResponse.json({ error: "Failed to process payment." }, { status: 500 });
    }
}