import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";

describe("Health API", () => {
  it("GET /api/health should return 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });
  it("GET /api/health/ready should return 200 when database is available", async () => {
    const response = await request(app).get("/api/health/ready");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ready");
    expect(response.body.data.database).toBe("connected");
  });
});
