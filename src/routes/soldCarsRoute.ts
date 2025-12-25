// routes/carRoutes.ts
import express from "express";
import { getSoldCars } from "../controllers/soldcarsController";
// import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/cars/sold
router.get("/sold", getSoldCars);

export default router;
