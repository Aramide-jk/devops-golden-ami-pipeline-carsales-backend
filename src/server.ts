import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";

// --- Route Imports ---
import authRoutes from "./routes/authRoute";
import inspectionRoutes from "./routes/inspectionRoute";
import adminRoutes from "./routes/adminRoute";
import sellRoutes from "./routes/sellCarRequestRoutes";
// import sendEmailRoutes from "./routes/sendEmailRoute";
import carRoute from "./routes/carRoute";
import contactRoutes from "./routes/contactRoute";
import soldRoutes from "./routes/soldCarsRoute";
import { errorHandler } from "./middleware/errorMiddleware";

// --- Environment Setup ---
const NODE_ENV = process.env.NODE_ENV ?? "development";
const isDevelopment = NODE_ENV === "development";
const isProduction = NODE_ENV === "production";

const PORT = isProduction
  ? process.env.PORT ?? 8000
  : process.env.DEV_PORT ?? 5000;

const DB_URL = isProduction
  ? process.env.MONGO_URI
  : process.env.LOCAL_MONGO_URI;

const allowedOrigins = (
  isProduction
    ? [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL2,
        process.env.FRONTEND_URL_PRO,
      ]
    : [process.env.FRONTEND_URL_LOCAL, process.env.FRONTEND_URL_VITE]
).filter((origin): origin is string => !!origin);

const app: Application = express();

// --------------------
// Security & Middlewares
// --------------------

console.log("allowedOrigins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (isDevelopment) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(express.json({ limit: "10mb" }));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    // contentSecurityPolicy: isProduction ? undefined : false,
    // crossOriginResourcePolicy: false,
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (isProduction) {
  app.set("trust proxy", 1);
}

// --------------------
// Health Check Route
// --------------------
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: `CarSales Backend is running successfully`,
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

// --------------------
// API Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", carRoute);
app.use("/api", soldRoutes);
app.use("/api/sell-requests", sellRoutes);
app.use("/api/contact", contactRoutes);
// app.use("/api/email", sendEmailRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

if (!DB_URL) {
  console.error("FATAL ERROR: Database connection string is not defined.");
  console.error(
    `Please set ${
      isProduction ? "MONGO_URI" : "LOCAL_MONGO_URI"
    } in your .env file`
  );
  process.exit(1);
}

connectDB(DB_URL)
  .then(() => {
    if (NODE_ENV !== "test") {
      const server = app.listen(PORT, () => {
        console.log(`Server started successfully on port ${PORT}`);
        console.log(`Environment: ${NODE_ENV.toUpperCase()}`);
      });

      // Graceful shutdown
      const gracefulShutdown = (signal: string) => {
        console.log(`\n${signal} received. Starting graceful shutdown...`);
        server.close(() => {
          console.log("HTTP server closed");
          process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
          console.error("Forced shutdown after timeout");
          process.exit(1);
        }, 10000);
      };

      process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
      process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    }
  })
  .catch((err) => {
    console.error(`Database Connection Failed! Error: ${err.message}`);
    console.error(
      "Please ensure your MongoDB service is running and accessible."
    );
    process.exit(1);
  });

export default app;

// import dotenv from "dotenv";
// dotenv.config();
// import express, { Application } from "express";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import connectDB from "./config/db";

// // Routes
// import authRoutes from "./routes/authRoute";
// import inspectionRoutes from "./routes/inspectionRoute";
// import adminRoutes from "./routes/adminRoute";
// import sellRoutes from "./routes/sellCarRequestRoutes";
// import sendEmailRoutes from "./routes/sendEmailRoute";
// import carRoute from "./routes/carRoute";
// import soldRoutes from "./routes/soldCarsRoute";
// // import { errorHandler } from "./middleware/errorMiddleware";

// // const FRONTEND_URL_MAIN = process.env.FRONTEND_URL;
// // const FRONTEND_URL_ADMIN = process.env.FRONTEND_URL_PRO;
// // const FRONTEND_URL_LOCAL = process.env.FRONTEND_URL_LOCAL;
// // const FRONTEND_URL_MAIN_LOCAL = process.env.FRONTEND_URL_VITE;
// // --------------------
// // Environment setup
// // --------------------
// const NODE_ENV = process.env.NODE_ENV || "development";

// const PORT = process.env.PORT || 5000;

// const DB_URL =
//   NODE_ENV === "production"
//     ? process.env.MONGO_URI
//     : process.env.LOCAL_MONGO_URI;

// const FRONTEND_URL =
//   NODE_ENV === "production"
//     ? [process.env.FRONTEND_URL, process.env.FRONTEND_URL_PRO].filter(Boolean)
//     : [process.env.FRONTEND_URL_LOCAL];

// console.log("=================================");
// console.log(`NODE_ENV: ${NODE_ENV}`);
// console.log(`PORT: ${PORT}`);
// console.log(`DB_URL: ${DB_URL}`);
// console.log(`FRONTEND_URL: ${FRONTEND_URL}`);
// console.log("=================================");

// const app: Application = express();

// // --------------------
// // Middlewares
// // --------------------
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(helmet());
// if (NODE_ENV === "development") app.use(morgan("dev"));

// // --------------------
// // CORS setup
// // --------------------
// // const allowedOrigins: string[] = [
// //   FRONTEND_URL_MAIN,
// //   FRONTEND_URL_ADMIN,
// //   NODE_ENV === "development" ? FRONTEND_URL_LOCAL : undefined,
// // ].filter((url): url is string => !!url);

// const allowedOrigins = [
//   process.env.FRONTEND_URL_PRO,
//   process.env.FRONTEND_URL,
//   process.env.FRONTEND_URL_LOCAL,
//   process.env.FRONTEND_URL_VITE,
// ].filter((origin): origin is string => !!origin);

// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );

// // --------------------
// // Health check route (important for Railway)
// // --------------------
// app.get("/", (req, res) => {
//   res.send("CarSales Backend is running successfully!");
// });

// // --------------------
// // Routes
// // --------------------
// app.use("/api/auth", authRoutes);
// app.use("/api/inspections", inspectionRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api", carRoute);
// app.use("/api", soldRoutes);
// app.use("/api/sell-requests", sellRoutes);
// app.use("/api/email", sendEmailRoutes);

// if (!DB_URL) {
//   console.error("Error: Database connection string is not defined.");
//   process.exit(1);
// }

// connectDB(DB_URL)
//   .then(() => {
//     if (NODE_ENV !== "test") {
//       app.listen(PORT, () => {
//         console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
//       });
//     }
//   })
//   .catch((err) => {
//     console.error("Failed to start server:", err);
//     process.exit(1);
//   });

// export default app;

// import dotenv from "dotenv";
// dotenv.config();

// import express, { Application, Request, Response } from "express";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import connectDB from "./config/db";

// // --- Route Imports ---
// import authRoutes from "./routes/authRoute";
// import inspectionRoutes from "./routes/inspectionRoute";
// import adminRoutes from "./routes/adminRoute";
// import sellRoutes from "./routes/sellCarRequestRoutes";
// import sendEmailRoutes from "./routes/sendEmailRoute";
// import carRoute from "./routes/carRoute";
// import soldRoutes from "./routes/soldCarsRoute";
// import { errorHandler } from "./middleware/errorMiddleware";

// // --- Environment Setup ---
// const NODE_ENV = process.env.NODE_ENV ?? "development";
// const PORT = process.env.PORT ?? 5000;

// const DB_URL =
//   NODE_ENV === "production"
//     ? process.env.MONGO_URI
//     : process.env.LOCAL_MONGO_URI;

// const allowedOrigins = [
//   process.env.FRONTEND_URL,
//   process.env.FRONTEND_URL_PRO,
//   process.env.FRONTEND_URL_LOCAL,
//   process.env.FRONTEND_URL_VITE,
// ].filter((origin): origin is string => !!origin);

// console.log("=================================");
// console.log(`NODE_ENV: ${NODE_ENV}`);
// console.log(`PORT: ${PORT}`);
// // console.log(`DB_URL: ${DB_URL ? "Defined" : "UNDEFINED"}`);
// console.log(`Allowed Origins: ${allowedOrigins.join(", ")}`);
// console.log("=================================");

// const app: Application = express();

// // --------------------
// // Middlewares
// // --------------------
// app.use(helmet());
// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );
// if (NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // --------------------
// // Health check route
// // --------------------
// app.get("/", (req: Request, res: Response) => {
//   res.send(`CarSales Backend is running successfully in ${NODE_ENV} mode!`);
// });

// // --------------------
// // Routes
// // --------------------
// app.use("/api/auth", authRoutes);
// app.use("/api/inspections", inspectionRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api", carRoute);
// app.use("/api", soldRoutes);
// app.use("/api/sell-requests", sellRoutes);
// app.use("/api/email", sendEmailRoutes);

// // --------------------

// app.use(errorHandler);

// // --------------------
// // Database Connection & Server Start
// // --------------------
// if (!DB_URL) {
//   console.error("FATAL ERROR: Database connection string is not defined.");

//   process.exit(1);
// }

// connectDB(DB_URL)
//   .then(() => {
//     if (NODE_ENV !== "test") {
//       app.listen(PORT, () => {
//         console.log(`Server started successfully on port ${PORT}`);
//       });
//     }
//   })
//   .catch((err) => {
//     console.error(`Database Connection Failed! Error: ${err.message}`);
//     console.error(
//       "Please ensure your MongoDB service is running and accessible."
//     );
//     process.exit(1);
//   });

// export default app;
