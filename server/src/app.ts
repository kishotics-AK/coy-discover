
import express from "express";
import cors from "cors";

import feedRoutes from "./routes/feed";
import swipeRoutes from "./routes/swipe";
import matchesRoutes from "./routes/matches";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "success",
    message: "Coy Discover backend is running!",
  });
});

app.use("/feed", feedRoutes);
app.use("/swipe", swipeRoutes);
app.use("/matches", matchesRoutes);

export default app;
