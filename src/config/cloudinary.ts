import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "cars",
      allowed_formats: ["jpg", "png", "jpeg"],
      // public_id: file.originalname.split(".")[0],
    };
  },
});
export const upload = multer({ storage });

// const upload = multer({ storage });

// export { cloudinary, upload };

// (async function () {
//   const results = await cloudinary.uploader.upload("../assets/logo.png");
//   console.log(results);
//   const url = cloudinary.url(results.public_id, {
//     transformation: [
//       {
//         quality: "auto",
//         fetch_format: "auto",
//       },
//       { width: 1200, height: 1200 },
//     ],
//   });
//   console.log(url);
// });

// (async () => {

//   const result = await cloudinary.uploader.upload("../assets/logo.png", {
//     folder: "sellCarRequests",
//     allowed_formats: ["jpg", "jpeg", "png"],
//   });

//   console.log(result);
// })();

// if (process.env.NODE_ENV !== "production") {
//   (global as any).cloudinary = cloudinary;
// }

// export default cloudinary;
