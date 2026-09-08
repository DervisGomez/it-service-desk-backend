import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "./config/env.js";
import healthRoutes from "./features/health/health.routes.js";
import requestRoutes from "./features/requests/request.routes.js";
import serviceTypeRoutes from "./features/service-types/service-type.routes.js";
import technicianRoutes from "./features/technicians/technician.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/service-types", serviceTypeRoutes);

app.use(errorMiddleware);

export default app;
