import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { errorMiddleware } from "../../src/middlewares/error.middleware.js";
import { testPrisma } from "../setup/test-prisma.js";
import { testRequestRoutes } from "../setup/test-request-router.js";

const app = express();

app.use(express.json());
app.use("/api/requests", testRequestRoutes);
app.use(errorMiddleware);

describe("Requests API", () => {
  it("GET /api/requests should return requests from the test database", async () => {
    const response = await request(app).get("/api/requests");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(8);
    expect(response.body.meta.pagination.total).toBe(8);
  });

  it("POST /api/requests should create and persist a request", async () => {
    const response = await request(app).post("/api/requests").send({
      title: "Mantenimiento de impresora",
      description:
        "La impresora del área administrativa presenta problemas de impresión.",
      priority: "HIGH",
      technicianId: 1,
      serviceTypeId: 5,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Mantenimiento de impresora");
    expect(response.body.data.priority).toBe("HIGH");
    expect(response.body.data.technicianId).toBe(1);
    expect(response.body.data.serviceTypeId).toBe(5);

    const persistedRequest = await testPrisma.request.findUnique({
      where: {
        id: response.body.data.id,
      },
    });

    expect(persistedRequest).not.toBeNull();
    expect(persistedRequest?.title).toBe("Mantenimiento de impresora");
    await testPrisma.request.delete({
      where: {
        id: response.body.data.id,
      },
    });
  });

  it("GET /api/requests/:id should return an existing request", async () => {
    const listResponse = await request(app).get("/api/requests");

    const requestId = listResponse.body.data[0].id;

    const response = await request(app).get(`/api/requests/${requestId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(requestId);
  });

  it("GET /api/requests/:id should return 404 for a non-existing request", async () => {
    const response = await request(app).get("/api/requests/99999");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("REQUEST_NOT_FOUND");
  });

  it("POST /api/requests should return 400 for invalid data", async () => {
    const response = await request(app).post("/api/requests").send({
      title: "Bad",
      description: "short",
      priority: "INVALID",
      serviceTypeId: 5,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/requests should reject a non-existing technician", async () => {
    const response = await request(app).post("/api/requests").send({
      title: "Mantenimiento de impresora",
      description:
        "La impresora del área administrativa presenta problemas de impresión.",
      priority: "HIGH",
      technicianId: 99999,
      serviceTypeId: 5,
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("TECHNICIAN_NOT_FOUND");
  });

  it("PUT /api/requests/:id should update an existing request", async () => {
    const createResponse = await request(app).post("/api/requests").send({
      title: "Solicitud para actualizar",
      description:
        "Solicitud creada para verificar el endpoint de actualización.",
      priority: "LOW",
      serviceTypeId: 1,
    });

    expect(createResponse.status).toBe(201);

    const requestId = createResponse.body.data.id;

    const response = await request(app).put(`/api/requests/${requestId}`).send({
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      technicianId: 1,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.priority).toBe("CRITICAL");
    expect(response.body.data.status).toBe("IN_PROGRESS");
    expect(response.body.data.technicianId).toBe(1);

    await testPrisma.request.delete({
      where: { id: requestId },
    });
  });

  it("DELETE /api/requests/:id should delete an existing request", async () => {
    const createResponse = await request(app).post("/api/requests").send({
      title: "Solicitud para eliminar",
      description:
        "Solicitud creada para verificar el endpoint de eliminación.",
      priority: "LOW",
      serviceTypeId: 1,
    });

    expect(createResponse.status).toBe(201);

    const requestId = createResponse.body.data.id;

    const response = await request(app).delete(`/api/requests/${requestId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedRequest = await testPrisma.request.findUnique({
      where: { id: requestId },
    });

    expect(deletedRequest).toBeNull();
  });
});
