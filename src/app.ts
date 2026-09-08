import express from "express";
import cors from "cors";
import healthRoutes from "./features/health/health.routes.js";
import requestRoutes from "./features/requests/request.routes.js";
import serviceTypeRoutes from "./features/service-types/service-type.routes.js";
import technicianRoutes from "./features/technicians/technician.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/service-types", serviceTypeRoutes);

app.use(errorMiddleware);

export default app;
