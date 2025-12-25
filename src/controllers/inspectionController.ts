import { Request, Response } from "express";
import Inspection from "../models/InspectionModel";
import { IUser } from "../models/UserModel";
import { sendEmail } from "../utils/sendEmail";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const bookInspection = async (req: AuthRequest, res: Response) => {
  try {
    const { car, date, time, location, phone, note, email } = req.body;
    const userId = req.user?._id;

    if (!car || !date || !time || !location || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const newInspection = new Inspection({
      user: userId, // keep reference to user
      car,
      date,
      time,
      location,
      phone,
      email,
      note,
    });

    const savedInspection = await newInspection.save();

    res.status(201).json({
      success: true,
      message: "Inspection booked successfully",
      data: savedInspection,
    });
  } catch (error) {
    console.error("Error creating inspection:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create inspection",
    });
  }
};
export const getAllInspections = async (req: Request, res: Response) => {
  try {
    const inspections = await Inspection.find()
      .populate("user", "name email phone")
      .populate("car", "brand model year")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections,
    });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching inspections",
    });
  }
};

// export const updateInspection = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
//   if (!allowedStatuses.includes(status)) {
//     return res.status(400).json({ message: "Invalid status" });
//   }

//   try {
//     const inspection = await Inspection.findById(id)
//       .populate<{ user: { name: string; email: string; phone?: string } }>(
//         "user"
//       ).populate<{ car: { brand: string; model: string; year: string; location?: string } }>("car");

//       // .populate<{ car: { brand: string; model: string; year: string } }>("car");

//     if (!inspection) {
//       return res.status(404).json({ message: "Inspection not found" });
//     }

//     inspection.status = status;
//     await inspection.save();

//     const userName = inspection.user?.name || "Customer";
//     const userEmail = inspection.email || inspection.user?.email;
//     const userPhone = inspection.phone || inspection.user?.phone || "N/A";
//     const carBrand = inspection.car?.brand || "";
//     const carModel = inspection.car?.model || "";
//     const carYear = inspection.car?.year || "";
//     const inspectionDate = inspection.date?.toDateString?.() || "";
//     const inspectionTime = inspection.time || "";
//     const location = inspection.car?.location || inspection.location;

//     let subject: string | undefined;
//     let message: string | undefined;

//     switch (status) {
//       case "confirmed":
//         subject = "Your Car Inspection Has Been Confirmed";
//         message = `
//           <p>Hello ${userName},</p>
//           <p>Your inspection for <b>${carBrand} ${carModel} ${carYear}</b> scheduled on
//           <b>${inspectionDate}</b> at <b>${inspectionTime}</b> has been confirmed.</p>
//           <p><b>Location:</b> ${location}</p>
//           <p><b>Phone:</b> ${userPhone}</p>
//         `;
//         break;
//       case "completed":
//         subject = "Your Car Inspection Is Completed";
//         message = `<p>Hello ${userName},</p><p>Your inspection has been successfully completed. Thank you!</p>`;
//         break;
//       case "cancelled":
//         subject = "Your Car Inspection Has Been Cancelled";
//         message = `<p>Hello ${userName},</p><p>We regret to inform you that your inspection has been cancelled.</p>`;
//         break;
//     }

//     // Send the email if valid
//     if (subject && message && userEmail) {
//       await sendEmail({
//         to: userEmail,
//         subject,
//         htmlContent: message,
//       });
//     }

//     return res.json({
//       message: "Inspection status updated successfully",
//       inspection,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

export const updateInspection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Validate allowed statuses
    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    // ✅ Find and populate necessary fields
    const inspection = await Inspection.findById(id)
      .populate<{ user: { name: string; email: string; phone?: string } }>(
        "user",
        "name email phone"
      )
      .populate<{
        car: { brand: string; model: string; year: string; location?: string };
      }>("car");

    if (!inspection) {
      return res
        .status(404)
        .json({ success: false, message: "Inspection not found" });
    }

    // ✅ Update inspection status
    inspection.status = status;
    await inspection.save();

    // ✅ Extract details safely
    const userName = inspection.user?.name || "Customer";
    const userEmail = inspection.email || inspection.user?.email;
    const userPhone = inspection.phone || inspection.user?.phone || "N/A";
    const carBrand = inspection.car?.brand || "";
    const carModel = inspection.car?.model || "";
    const carYear = inspection.car?.year || "";
    const inspectionDate = inspection.date
      ? new Date(inspection.date).toDateString()
      : "";
    const inspectionTime = inspection.time || "";
    const location =
      inspection.car?.location || inspection.location || "Not specified";

    // ✅ Prepare email subject and HTML
    let subject = "";
    let html = "";

    switch (status) {
      case "confirmed":
        subject = "Your Car Inspection Has Been Confirmed";
        html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #007bff;">Hello ${userName},</h2>
            <p>Your car inspection for <b>${carBrand} ${carModel} ${carYear}</b> has been confirmed.</p>
            <p>
              <b>Date:</b> ${inspectionDate}<br />
              <b>Time:</b> ${inspectionTime}<br />
              <b>Location:</b> ${location}<br />
              <b>Contact:</b> ${userPhone}
            </p>
            <p>Thank you for choosing <b>JK Autos</b>. We look forward to serving you!</p>
            <p style="font-size: 13px; color: #666;">This is an automated message. Please do not reply.</p>
          </div>
        `;
        break;

      case "completed":
        subject = "Your Car Inspection Has Been Completed";
        html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #007bff;">Hello ${userName},</h2>
            <p>Your inspection for <b>${carBrand} ${carModel} ${carYear}</b> has been successfully completed.</p>
            <p>We appreciate your trust in <b>JK Autos</b>. Have a great day!</p>
            <p style="font-size: 13px; color: #666;">This is an automated message. Please do not reply.</p>
          </div>
        `;
        break;

      case "cancelled":
        subject = "Your Car Inspection Has Been Cancelled";
        html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #007bff;">Hello ${userName},</h2>
            <p>We regret to inform you that your inspection for <b>${carBrand} ${carModel} ${carYear}</b> has been cancelled.</p>
            <p>If you believe this was a mistake or wish to reschedule, please contact support.</p>
            <p>Thank you for your understanding.</p>
            <p style="font-size: 13px; color: #666;">This is an automated message. Please do not reply.</p>
          </div>
        `;
        break;
    }

    // ✅ Send email (only if there's a valid recipient)
    if (userEmail && subject && html) {
      try {
        await sendEmail({
          to: userEmail,
          subject,
          html,
        });
        console.log(`✅ Email sent to ${userEmail} (status: ${status})`);
      } catch (err) {
        console.error("❌ Failed to send inspection email:", err);
      }
    }

    // ✅ Return success response
    return res.status(200).json({
      success: true,
      message: "Inspection status updated successfully",
      data: inspection,
    });
  } catch (err) {
    console.error("❌ Error updating inspection:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating inspection",
    });
  }
};
