import express from "express";
import {
  bookInspection,
  getAllInspections,
  updateInspection,
} from "../controllers/inspectionController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// User books inspection
router.post("/", protect, bookInspection);

// Admin views + updates inspections
router.get("/", protect, getAllInspections);
router.patch("/:id/status", protect, admin, updateInspection);

export default router;
