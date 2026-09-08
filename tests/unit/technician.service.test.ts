import { beforeEach, describe, expect, it, vi } from "vitest";

const { repository } = vi.hoisted(() => ({
  repository: {
    findActive: vi.fn(),
  },
}));

vi.mock("../../src/features/technicians/technician.repository.js", () => ({
  technicianRepository: repository,
}));

import { TechnicianService } from "../../src/features/technicians/technician.service.js";

describe("TechnicianService", () => {
  let service: TechnicianService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TechnicianService();
  });

  it("calls findActive once", async () => {
    repository.findActive.mockResolvedValue([]);

    await service.getActive();

    expect(repository.findActive).toHaveBeenCalledOnce();
  });

  it("returns the technicians provided by the repository", async () => {
    const technicians = [
      { id: 1, name: "Ana Martínez", email: "ana@example.com" },
    ];
    repository.findActive.mockResolvedValue(technicians);

    await expect(service.getActive()).resolves.toEqual(technicians);
  });

  it("propagates repository errors", async () => {
    repository.findActive.mockRejectedValue(new Error("Database unavailable"));

    await expect(service.getActive()).rejects.toThrow("Database unavailable");
  });
});
