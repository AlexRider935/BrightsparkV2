// src/lib/mailer.js
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

/**
 * Sends an email using the pre-configured transporter.
 * @param {object} mailOptions - The mail options.
 * @param {string} mailOptions.to - The recipient's email address.
 * @param {string} mailOptions.subject - The subject of the email.
 * @param {string} mailOptions.html - The HTML content of the email.
 */
export const sendMail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `Brightspark Institute <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent successfully to:", to);
        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error: "Failed to send email." };
    }
};