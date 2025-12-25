import mongoose, { Schema } from "mongoose";

export interface ISellCarRequest {
  user: mongoose.Types.ObjectId; 
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine: string;
  serviceHistory: string;
  modifications: string;
  reason: string;
  description?: string;
  location?: string;
  interiorImages: string[];
  exteriorImages: string[];
  features: string[];
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  idFront?: string;
  idBack?: string;
  carReg?: string;
  customPaper?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const SellCarRequestSchema = new Schema<ISellCarRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },
    engine: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    interiorImages: [{ type: String }],
    exteriorImages: [{ type: String }],
    features: [{ type: String }],
    serviceHistory: [{ type: String }],
    modifications: [{ type: String }],
    reason: [{ type: String }],

    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    ownerPhone: { type: String, required: true },

    idFront: { type: String, required: true },
    idBack: { type: String, required: true },
    carReg: { type: String, required: true },
    customPaper: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISellCarRequest>(
  "SellCarRequest",
  SellCarRequestSchema
);
