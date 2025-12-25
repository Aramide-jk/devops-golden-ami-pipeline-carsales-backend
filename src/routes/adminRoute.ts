import express from "express";
import {
  getAllInspections,
  updateInspectionStatus,
} from "../controllers/adminInspectionController";
import {
  getRequests,
  updateSellCarStatus,
  deleteSellCarRequest,
} from "../controllers/adminCarRequestController";
import { create, updateCar, deleteCar } from "../controllers/adminController";
import { upload } from "../middleware/uploadPost";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/inspections", protect, getAllInspections);
router.patch("/inspections/:id", protect, admin, updateInspectionStatus);

router.post("/sell-requests", protect, upload.array("images", 20), create);
router.get("/sell-requests", admin, protect, getRequests);
router.patch("/sell-requests/:id", protect, admin, updateSellCarStatus);
router.delete("/sell-requests/:id", protect, admin, deleteSellCarRequest);

router.post("/cars", protect, admin, upload.array("images", 20), create);
router.patch("/cars/:id", protect, admin, updateCar);
router.delete("/cars/:id", protect, admin, deleteCar);

export default router;
