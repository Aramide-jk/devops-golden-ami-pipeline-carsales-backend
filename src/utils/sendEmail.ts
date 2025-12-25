import nodemailer from "nodemailer";

// utils/sendEmail.ts
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"JK Autos" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// export const sendEmail = async ({
//   to,
//   subject,
//   htmlContent,
// }: {
//   to: string;
//   subject: string;
//   htmlContent: string;
// }) => {
//   try {
//     // Create transporter using Gmail
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER, // your Gmail address
//         pass: process.env.EMAIL_PASS, // your App Password (not your Gmail password)
//       },
//     });

//     // Mail options
//     const mailOptions = {
//       from: `"Jk_Autos" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html: htmlContent,
//     };

//     // Send email
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", info.response);
//   } catch (error: any) {
//     console.error("Failed to send email:", error.message);
//   }
// };
