import express from "express";
import {
  createRequest,
  getRequests,
} from "../controllers/adminCarRequestController";
import { protect, admin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadSell";
// console.log("UPLOAD:", upload);

const router = express.Router();

const uploadFields = upload.fields([
  { name: "interiorImages", maxCount: 10 },
  { name: "exteriorImages", maxCount: 10 },
  { name: "idFront", maxCount: 1 },
  { name: "idBack", maxCount: 1 },
  { name: "carReg", maxCount: 1 },
  { name: "customPaper", maxCount: 1 },
]);

router.post("/", protect, uploadFields, createRequest);
router.get("/", protect, admin, getRequests);

export default router;
