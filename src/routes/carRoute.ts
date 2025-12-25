import express from "express";

import {
  getAllCars,
  getCarById,
} from "../controllers/adminController";
// import { protect } from "../middleware/authMiddleware";

const router = express.Router();


router.get("/cars", getAllCars);
router.get("/cars/:id", getCarById);

export default router;
