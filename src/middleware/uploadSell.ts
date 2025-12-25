// middleware/upload.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "sellCars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  }),
});

export const upload = multer({ storage });
