import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { errorMiddleware } from "../../src/middlewares/error.middleware.js";
import serviceTypeRoutes from "../../src/features/service-types/service-type.routes.js";
import technicianRoutes from "../../src/features/technicians/technician.routes.js";

const app = express();

app.use(express.json());
app.use("/api/technicians", technicianRoutes);
app.use("/api/service-types", serviceTypeRoutes);
app.use(errorMiddleware);

describe("Catalog API", () => {
  it("GET /api/technicians should return active technicians", async () => {
    const response = await request(app).get("/api/technicians");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(4);
  });

  it("GET /api/service-types should return active service types", async () => {
    const response = await request(app).get("/api/service-types");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(5);
  });
});
