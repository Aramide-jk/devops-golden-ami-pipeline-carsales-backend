import { Request, Response } from "express";
import Inspection from "../models/InspectionModel";

export const getAllInspections = async (req: Request, res: Response) => {
  try {
    const inspections = await Inspection.find()
      .populate("user", "name email")
      .populate("car", "brand model price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching inspections",
    });
  }
};


export const updateInspectionStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body; // expected: "confirmed", "cancelled", "completed"
    const { id } = req.params;

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed: pending, confirmed, cancelled, completed",
      });
    }

    const inspection = await Inspection.findById(id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found",
      });
    }

    inspection.status = status;
    await inspection.save();

    return res.status(200).json({
      success: true,
      message: `Inspection marked as ${status}`,
      data: inspection,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating inspection",
    });
  }
};
