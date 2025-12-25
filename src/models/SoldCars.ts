// models/Car.ts
import mongoose, { Schema} from "mongoose";

export interface ICar {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  description: string;
  engine: string;
  images: string[];
  condition: string;
  location: string;
  status: "available" | "sold" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const CarSchema = new Schema<ICar>(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },
    color: { type: String, required: true },
    fuelType: { type: String, required: true },
    transmission: { type: String, required: true },
    description: { type: String, required: true },
    engine: { type: String, required: true },
    images: [{ type: String }],
    condition: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "sold", "pending"],
      default: "available",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICar>("Car", CarSchema);
