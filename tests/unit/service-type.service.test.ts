import { beforeEach, describe, expect, it, vi } from "vitest";

const { repository } = vi.hoisted(() => ({
  repository: {
    findActive: vi.fn(),
  },
}));

vi.mock("../../src/features/service-types/service-type.repository.js", () => ({
  serviceTypeRepository: repository,
}));

import { ServiceTypeService } from "../../src/features/service-types/service-type.service.js";

describe("ServiceTypeService", () => {
  let service: ServiceTypeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ServiceTypeService();
  });

  it("calls findActive once", async () => {
    repository.findActive.mockResolvedValue([]);

    await service.getActive();

    expect(repository.findActive).toHaveBeenCalledOnce();
  });

  it("returns the service types provided by the repository", async () => {
    const serviceTypes = [
      { id: 1, name: "Soporte de red", description: "Atención de red" },
    ];
    repository.findActive.mockResolvedValue(serviceTypes);

    await expect(service.getActive()).resolves.toEqual(serviceTypes);
  });

  it("propagates repository errors", async () => {
    repository.findActive.mockRejectedValue(new Error("Database unavailable"));

    await expect(service.getActive()).rejects.toThrow("Database unavailable");
  });
});
