import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import apiResponse from "./utils/apiResponse.js";
import { morganMiddleware } from "./utils/morgan.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { env } from "./config/env.js";

const app = express();

app.use(morganMiddleware);
app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));
app.use(cookieParser(env.COOKIE_SECRET));

app.get("/health", (req, res) => {
  res.json(apiResponse.success("API is running 🚀"));
});

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);

app.use(errorHandler);

export default app;
