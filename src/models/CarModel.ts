import mongoose, { Schema } from "mongoose";

export interface ICar {
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  fuelType: string;
  mileage: number;
  transmission: string;
  condition: "brand new" | "foreign used" | "local used";
  engine: string;
  features: string[];
  status: "available" | "sold" | "pending";
  location: string;
  images: string[];
  createdBy: mongoose.Types.ObjectId;
}

const carSchema = new Schema<ICar>(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    fuelType: { type: String, required: true },
    mileage: { type: Number, required: true },
    transmission: { type: String, required: true },
    engine: { type: String, required: true },
    features: [{ type: String }],
    condition: {
      type: String,
      enum: ["brand new", "foreign used", "local used"],
      default: "local used",
    },
    status: {
      type: String,
      enum: ["available", "sold", "pending"],
      default: "available",
    },
    location: { type: String, required: true },
    images: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICar>("Car", carSchema);
