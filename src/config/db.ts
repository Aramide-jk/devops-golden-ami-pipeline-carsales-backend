import mongoose from "mongoose";
import logger from "./logger";

const connectDB = async (mongoUri: string) => {
  try {
    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error("MongoDB connection failed: %s", error.message, {
      stack: error.stack,
    });
    process.exit(1);
  }
};

export default connectDB;

// import mongoose from "mongoose";

// const connectDB = async (mongoUri: string) => {
//   try {
//     const conn = await mongoose.connect(mongoUri);
//     console.log(`MongoDB connected: ${conn.connection.host}`);
//   } catch (error: any) {
//     console.error(" MongoDB connection failed:", error.message);
//     process.exit(1);
//   }
// };

// export default connectDB;
