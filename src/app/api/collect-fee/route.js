// src/app/api/collect-fee/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { sendMail } from "@/lib/mailer";
import { Timestamp } from "firebase-admin/firestore";
import { format } from 'date-fns';

export async function POST(request) {
  try {
    const { student, installment, paymentData } = await request.json();

    // Reconstruct the dueDate from a string back into a server-side Timestamp
    const installmentDueDate = Timestamp.fromDate(new Date(installment.dueDate));

    // --- Step 1: More specific validation ---
    if (!student?.id || !installment?.description || !paymentData?.amountPaid) {
      return NextResponse.json({ error: "Missing required payment data." }, { status: 400 });
    }

    const paymentDate = new Date(paymentData.paymentDate);

    // --- Step 2: Perform Database Operations Atomically ---
    const batch = adminDb.batch();

    const feeDetailRef = adminDb.collection("studentFeeDetails").doc(student.id);
    const transactionRef = adminDb.collection("feeTransactions").doc(); // Generate a new transaction ID
    const studentRef = adminDb.collection("students").doc(student.id);

    const [feeDetailDoc, studentDoc] = await Promise.all([feeDetailRef.get(), studentRef.get()]);

    if (!feeDetailDoc.exists) {
      return NextResponse.json({ error: "Student fee details not found." }, { status: 404 });
    }
    if (!studentDoc.exists) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const currentInstallments = feeDetailDoc.data().installments || [];
    let installmentFound = false; // Flag to ensure we update something

    const updatedInstallments = currentInstallments.map(inst => {
      // Use the reconstructed dueDate for comparison
      if (inst.description === installment.description && inst.dueDate.isEqual(installmentDueDate)) {
        installmentFound = true;
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

    // If no matching installment was found, throw an error
    if (!installmentFound) {
      throw new Error("Matching installment to update was not found in the database. The due date may be incorrect.");
    }

    const newTransaction = {
      id: transactionRef.id, // Store the ID within the document
      studentId: student.id,
      studentName: student.name,
      amount: Number(paymentData.amountPaid),
      paymentDate: Timestamp.fromDate(paymentDate),
      paymentMethod: paymentData.paymentMethod,
      description: installment.description,
      createdAt: Timestamp.now()
    };

    batch.update(feeDetailRef, { installments: updatedInstallments });
    batch.set(transactionRef, newTransaction);

    await batch.commit();

    // --- Step 3: Send the Improved, Receipt-Style Email ---
    const parentEmail = studentDoc.data().parentEmail;
    if (parentEmail) {
      const subject = `Payment Receipt from Brightspark Institute (Receipt #${transactionRef.id.substring(0, 8)})`;

      // UPDATED: White, Gray, and Black themed email template
      const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"><title>Payment Receipt</title>
              <style>body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f4f4f7;color:#333333;}</style>
            </head>
            <body style="background-color: #f4f4f7;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding: 20px;">
                  <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                    <tr>
                      <td style="background-color:#111827;padding:24px;text-align:center;">
                        <h1 style="color:#FBBF24;margin:0;font-size:24px;letter-spacing:1px;font-weight:bold;">BRIGHTSPARK INSTITUTE</h1>
                      </td>
                    </tr>
                    <tr><td style="padding:32px;">
                      <h2 style="color:#111827;margin-top:0;font-size:28px;font-weight:bold;">Payment Receipt</h2>
                      <p style="color:#4a5568;">Thank you for your payment for <strong>${student.name}</strong>.</p>
                      
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                        <tr>
                          <td style="color:#718096;font-size:14px;padding-bottom:8px;">RECEIPT #</td>
                          <td style="color:#718096;font-size:14px;padding-bottom:8px;text-align:right;">DATE PAID</td>
                        </tr>
                        <tr>
                          <td style="color:#1a202c;font-size:16px;font-weight:bold;padding-bottom:16px;border-bottom:1px solid #e2e8f0;">${transactionRef.id.substring(0, 8)}</td>
                          <td style="color:#1a202c;font-size:16px;padding-bottom:16px;text-align:right;border-bottom:1px solid #e2e8f0;">${format(paymentDate, 'MMMM dd, yyyy')}</td>
                        </tr>
                      </table>

                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                        <thead style="text-align:left;color:#718096;font-size:12px;text-transform:uppercase;">
                          <tr><th style="padding:8px 0;">Description</th><th style="padding:8px 0;text-align:right;">Amount</th></tr>
                        </thead>
                        <tbody>
                          <tr style="border-bottom:1px solid #e2e8f0;border-top:1px solid #e2e8f0;">
                            <td style="padding:16px 0;color:#2d3748;">${installment.description}</td>
                            <td style="padding:16px 0;text-align:right;font-weight:bold;color:#2d3748;">₹${Number(paymentData.amountPaid).toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td style="padding:20px 0 8px;text-align:right;color:#4a5568;">Total Paid:</td>
                            <td style="padding:20px 0 8px;text-align:right;font-size:24px;font-weight:bold;color:#22c55e;">₹${Number(paymentData.amountPaid).toLocaleString('en-IN')}</td>
                          </tr>
                        </tfoot>
                      </table>
                      
                      <div style="margin-top:32px;padding:16px;background-color:#f7fafc;border-radius:6px;border-left:4px solid #FBBF24;">
                        <p style="margin:0;color:#4a5568;">Paid via: <strong style="color:#1a202c;">${paymentData.paymentMethod}</strong></p>
                      </div>

                    </td></tr>
                    <tr>
                      <td style="padding:24px;text-align:center;background-color:#f7fafc;border-top:1px solid #e2e8f0;">
                         <p style="color:#718096;font-size:12px;margin:0;">Follow us on Instagram: <a href="https://www.instagram.com/brightspark_institute23" target="_blank" style="color:#1e40af;text-decoration:none;font-weight:bold;">@brightspark_institute23</a></p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>`;

      await sendMail({ to: parentEmail, subject, html: emailBody });
    }

    return NextResponse.json({ message: "Payment processed successfully!" });

  } catch (error) {
    console.error("Error in /api/collect-fee:", error);
    return NextResponse.json({ error: `Failed to process payment: ${error.message}` }, { status: 500 });
  }
}
