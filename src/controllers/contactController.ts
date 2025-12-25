import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { sendEmail } from "../utils/sendEmail";

// A simple email validation utility
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @desc    Handle contact form submission
 * @route   POST /api/contact
 * @access  Public
 */
export const handleContactForm = asyncHandler(
  async (req: Request, res: Response) => {
    const { fullName, email, phone, subject, message } = req.body;

    // --- 1. Validate Input ---
    if (!fullName || !email || !subject || !message) {
      res.status(400);
      throw new Error(
        "Please provide all required fields: fullName, email, subject, and message."
      );
    }

    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error("Please provide a valid email address.");
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("FATAL: ADMIN_EMAIL is not defined in .env file.");
      res.status(500);
      throw new Error(
        "Server configuration error. Could not process the request."
      );
    }

    // --- 2. Prepare and Send Email to Admin ---
    const adminMailSubject = `New Contact Form Message: ${subject}`;
    const adminMailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #0056b3;">New Message from JK Autos Contact Form</h2>
        <p>You have received a new message from your website's contact form.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <h3>Subject: ${subject}</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
        <p style="font-size: 12px; color: #777;">This email was sent from the contact form on your website.</p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: adminMailSubject,
      html: adminMailHtml,
    });

    // --- 3. Prepare and Send Confirmation Email to User ---
    const userMailSubject = `We've received your message - JK_Autos`;
    const userMailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #0056b3;">Hello ${fullName},</h2>
        <p>Thank you for contacting JK Autos! We have successfully received your message and will get back to you as soon as possible.</p>
        <p>Here is a copy of your message:</p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 15px; margin-left: 0; font-style: italic;">
          <strong>Subject:</strong> ${subject}<br/>
          <strong>Message:</strong> ${message}
        </blockquote>
        <p>Best regards,<br/>The JK Autos Team</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: userMailSubject,
      html: userMailHtml,
    });

    // --- 4. Send Success Response ---
    res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  }
);
