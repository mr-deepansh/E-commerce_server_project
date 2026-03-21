import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();
// Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

export default app;