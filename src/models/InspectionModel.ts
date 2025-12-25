import mongoose, { Schema, Document } from "mongoose";

export interface IInspection extends Document {
  user: mongoose.Schema.Types.ObjectId;
  car: mongoose.Schema.Types.ObjectId;
  date: Date;
  time: string;
  location: string;
  phone: string;
  email: string;
  note?: string;
  status: string;
}

const InspectionSchema = new Schema<IInspection>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    car: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInspection>("Inspection", InspectionSchema);



// import mongoose, { Schema, Document } from "mongoose";

// export interface IInspection extends Document {
//   user: mongoose.Schema.Types.ObjectId | { name: string };
//   car:
//     | mongoose.Schema.Types.ObjectId
//     | { brand: string; model: string; year: string };
//   email: string;
//   phone: string;
//   date: Date;
//   time: string;
//   location: string;
//   status: "pending" | "confirmed" | "completed" | "cancelled";
//   createdAt: Date;
//   updatedAt: Date;
// }

// const inspectionSchema = new Schema<IInspection>(
//   {
//     user: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     car: { type: Schema.Types.ObjectId, ref: "Car", required: true },
//     date: { type: Date, required: true },
//     time: { type: String, required: true },
//     location: { type: String, required: true },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "completed", "cancelled"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model<IInspection>("Inspection", inspectionSchema);

// import { Schema, model, Document, Types } from "mongoose";

// export interface InspectionDocument extends Document {
//   user: Types.ObjectId;
//   car: Types.ObjectId;
//   date: Date;
//   location: string;
//   phone: string;
//   notes?: string;
//   status: "pending" | "confirmed" | "completed" | "cancelled";
// }

// const inspectionSchema = new Schema<InspectionDocument>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     car: {
//       type: Schema.Types.ObjectId,
//       ref: "Car",
//       required: true,
//     },
//     date: {
//       type: Date,
//       required: true,
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     phone: {
//       type: String,
//       required: true,
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "completed", "cancelled"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export default model<InspectionDocument>("Inspection", inspectionSchema);

// import { Schema, model, Document } from "mongoose";

// export interface InspectionDocument {
//   user: Schema.Types.ObjectId;
//   car: Schema.Types.ObjectId;
//   date: Date;
//   location: string;
//   phone: string;
//   brand: string;
//   model: string;
//   notes?: string;
//   status: "pending" | "confirmed" | "completed" | "cancelled";
// }

// const inspectionSchema = new Schema<InspectionDocument>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     car: {
//       type: Schema.Types.ObjectId,
//       ref: "Car",
//       required: true,
//     },
//     date: {
//       type: Date,
//       required: true,
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     brand: {
//       type: String,
//       // required: true,
//     },
//     model: {
//       type: String,
//       // required: true
//     },
//     notes: {
//       type: String,
//     },
//     phone: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "completed", "cancelled"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export default model<InspectionDocument>("Inspection", inspectionSchema);
