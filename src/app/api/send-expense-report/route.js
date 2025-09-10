// src/app/api/send-expense-report/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { sendMail } from "@/lib/mailer";
import { Timestamp }from "firebase-admin/firestore";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function POST(request) {
    try {
        // --- Step 1: Determine the date range for the previous month ---
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        const startOfLastMonth = startOfMonth(lastMonth);
        const endOfLastMonth = endOfMonth(lastMonth);

        // --- Step 2: Fetch all expenses from the previous month ---
        const expensesQuery = adminDb.collection("expenses")
            .where('expenseDate', '>=', Timestamp.fromDate(startOfLastMonth))
            .where('expenseDate', '<=', Timestamp.fromDate(endOfLastMonth))
            .orderBy('expenseDate', 'asc');
        
        const expensesSnapshot = await expensesQuery.get();
        const expenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (expenses.length === 0) {
            return NextResponse.json({ message: `No expenses found for ${format(lastMonth, "MMMM yyyy")}. No report sent.` });
        }

        // --- Step 3: Fetch all admin email addresses ---
        const adminsQuery = adminDb.collection("users").where('role', '==', 'admin');
        const adminsSnapshot = await adminsQuery.get();
        const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email).filter(Boolean);

        if (adminEmails.length === 0) {
            return NextResponse.json({ error: "No admin users with emails found to send the report." }, { status: 404 });
        }

        // --- Step 4: Calculate totals and format the email body ---
        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const reportMonth = format(lastMonth, "MMMM yyyy");
        const subject = `Monthly Expense Report: ${reportMonth}`;

        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"><title>Expense Report</title>
              <style>body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f4f4f7;color:#333333;} table{border-collapse:collapse;width:100%;} th,td{padding:12px 15px;text-align:left;border-bottom:1px solid #e2e8f0;}</style>
            </head>
            <body style="background-color: #f4f4f7;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding: 20px;">
                  <table width="700" border="0" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                    <tr>
                      <td style="background-color:#111827;padding:24px;text-align:center;">
                        <h1 style="color:#FBBF24;margin:0;font-size:24px;letter-spacing:1px;font-weight:bold;">BRIGHTSPARK INSTITUTE</h1>
                      </td>
                    </tr>
                    <tr><td style="padding:32px;">
                      <h2 style="color:#111827;margin-top:0;font-size:28px;font-weight:bold;">Expense Report</h2>
                      <p style="color:#4a5568;font-size:18px;">${reportMonth}</p>
                      
                      <div style="margin:24px 0;padding:20px;background-color:#f7fafc;border-radius:6px;">
                        <span style="font-size:16px;color:#4a5568;">Total Expenses:</span>
                        <span style="font-size:24px;font-weight:bold;color:#1a202c;display:block;">₹${totalExpenses.toLocaleString('en-IN')}</span>
                      </div>

                      <h3 style="color:#111827;margin-top:32px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">Detailed Breakdown</h3>
                      <table>
                        <thead style="background-color:#f7fafc;color:#718096;font-size:12px;text-transform:uppercase;">
                          <tr><th>Date</th><th>Category</th><th>Description</th><th style="text-align:right;">Amount</th></tr>
                        </thead>
                        <tbody>
                          ${expenses.map(exp => `
                            <tr>
                              <td>${format(exp.expenseDate.toDate(), 'dd MMM yyyy')}</td>
                              <td>${exp.category}</td>
                              <td>${exp.description}</td>
                              <td style="text-align:right;font-weight:bold;">₹${exp.amount.toLocaleString('en-IN')}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </td></tr>
                    <tr>
                      <td style="padding:24px;text-align:center;background-color:#f7fafc;border-top:1px solid #e2e8f0;">
                         <p style="color:#718096;font-size:12px;margin:0;">This is an automated report.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
        `;

        // --- Step 5: Send the email to all admins ---
        await sendMail({ to: adminEmails.join(','), subject, html: emailBody });

        return NextResponse.json({ message: `Expense report for ${reportMonth} sent successfully to ${adminEmails.length} admin(s).` });

    } catch (error) {
        console.error("Error in /api/send-expense-report:", error);
        return NextResponse.json({ error: `Failed to send report: ${error.message}` }, { status: 500 });
    }
}