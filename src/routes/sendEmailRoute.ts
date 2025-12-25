// import { Router } from "express";
// import { sendEmail } from "../utils/sendEmail";

// const router = Router();

// // POST /api/email/test
// router.post("/test", async (req, res) => {
//   try {
//     const { to, subject, text } = req.body;
//     const result = await sendEmail(to, subject, text);
//     res.status(200).json({ success: true, result });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to send email" });
//   }
// });

// export default router;
