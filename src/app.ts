import express from "express";
import cors from "cors";
import requestRoutes from "./features/requests/request.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
    },
    message: "API is running",
  });
});

app.use("/api/requests", requestRoutes);

app.use(errorMiddleware);

export default app;
