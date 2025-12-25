import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoute"
import inspectionRoutes from "./routes/inspectionRoute";
import adminRoutes from "./routes/adminRoute";

import { errorHandler } from "./middleware/errorMiddleware";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet()); // secure HTTP headers
app.use(morgan("dev")); // request logger

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000", // React local dev
      "http://localhost:5174", // Vite local dev
      "https://jkautoss.netlify.app" // production frontend
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(errorHandler);
app.use(errorHandler);

export default app;
