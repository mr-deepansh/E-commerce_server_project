import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import apiResponse from "./utils/apiResponse.js";
import { morganMiddleware } from "./utils/morgan.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.route.js";

const app = express();
// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(morganMiddleware);

// Health check route
app.get("/health", (req, res) => {
  res.json(apiResponse.success("API is running 🚀"));
});

app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);
export default app;
