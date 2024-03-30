import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "../routes/user.routes.js";
import tagRoutes from "../routes/tag.routes.js";

const app = express();

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tags", tagRoutes);

// Test Route
app.get("/api", (req, res) => {
  res.json({
    message: "Hello World!",
  });
});

export default app;
