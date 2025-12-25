import express from "express";
import { handleContactForm } from "../controllers/contactController";

const router = express.Router();

// @route   POST /api/contact
router.post("/", handleContactForm);

export default router;
