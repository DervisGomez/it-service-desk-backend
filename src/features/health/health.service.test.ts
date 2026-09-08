import { beforeEach, describe, expect, it, vi } from "vitest";

const { repository } = vi.hoisted(() => ({
  repository: {
    checkDatabaseConnection: vi.fn(),
  },
}));

vi.mock("./health.repository.js", () => ({
  healthRepository: repository,
}));

import { HealthService } from "./health.service.js";

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HealthService();
  });

  it("returns true when the database connection succeeds", async () => {
    repository.checkDatabaseConnection.mockResolvedValue(undefined);

    await expect(service.isReady()).resolves.toBe(true);
    expect(repository.checkDatabaseConnection).toHaveBeenCalledOnce();
  });

  it("returns false when the database connection fails", async () => {
    repository.checkDatabaseConnection.mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(service.isReady()).resolves.toBe(false);
  });
});
