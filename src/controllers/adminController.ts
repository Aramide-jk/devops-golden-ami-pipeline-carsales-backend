import { Request, Response } from "express";
import { AuthRequest } from "../types/type.auth";
import Car from "../models/CarModel";
import logger from "../config/logger";
import mongoose from "mongoose";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const {
      brand,
      model,
      year,
      price,
      description,
      fuelType,
      mileage,
      transmission,
      condition = "foreign used",
      engine,
      status = "available",
      location,
    } = req.body;

    let features = req.body.features;
    if (typeof features === "string") {
      try {
        features = JSON.parse(features);
      } catch {
        features = features.split(",").map((item: string) => item.trim());
      }
    } else if (!Array.isArray(features)) {
      features = [];
    }

    let uploadedUrls: string[] = [];

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      if (files.length > 20) {
        return res
          .status(400)
          .json({ message: "You can upload up to 20 images only" });
      }

      uploadedUrls = files.map((file: any) => file.path);
    } else if (req.body.images && Array.isArray(req.body.images)) {
      uploadedUrls = req.body.images;
    }

    if (!uploadedUrls || uploadedUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const car = await Car.create({
      brand,
      model,
      year,
      price,
      description,
      fuelType,
      mileage,
      transmission,
      condition,
      engine,
      features,
      status,
      location,
      images: uploadedUrls,
      createdBy: req.user?._id,
    });

    logger.info("Car created: %s %s", car.brand, car.model);

    res.status(201).json(car);
  } catch (error: any) {
    logger.error("Failed to create car: %s", error.message, {
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Failed to create car",
      error: error.message,
    });
  }
};

export const updateCar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateData: any = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    if (updateData.year) updateData.year = Number(updateData.year);
    if (updateData.price) updateData.price = Number(updateData.price);

    const updatedCar = await Car.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    return res.status(200).json(updatedCar);
  } catch (error: any) {
    console.error("Error updating car:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      res.status(404).json({ success: false, message: "Car not found" });
      return;
    }

    await car.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Car removed successfully" });
  } catch (error: any) {
    logger.error("Error deleting car: %s", error.message, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting car" });
  }
};

// export const getAllCars = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const cars = await Car.find()
//       .populate("createdBy", "name email")
//       .sort({ createdAt: -1 });
//     // res.json(cars);
//     res.status(200).json({ success: true, count: cars.length, data: cars });
//   } catch (error: any) {
//     logger.error("Error fetching cars: %s", error.message, {
//       stack: error.stack,
//     });
//     res
//       .status(500)
//       .json({ success: false, message: "Server error while fetching cars" });
//   }
// };
export const getAllCars = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 16;
    const skip = (page - 1) * limit;

    const query = { status: "available" };

    const cars = await Car.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCars = await Car.countDocuments(query);

    res.status(200).json({
      success: true,
      count: cars.length,
      currentPage: page,
      totalPages: Math.ceil(totalCars / limit),
      totalCars,
      data: cars,
    });
  } catch (error: any) {
    logger.error("Error fetching cars: %s", error.message, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching cars" });
  }
};

export const getCarById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid car ID format" });
      return;
    }

    const car = await Car.findById(id);

    if (!car) {
      res.status(404).json({ success: false, message: "Car not found" });
      return;
    }

    res.status(200).json({ success: true, data: car });
  } catch (error: any) {
    logger.error("Error fetching car: %s", error.message, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching car" });
  }
};
