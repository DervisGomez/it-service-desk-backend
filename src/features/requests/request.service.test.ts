import { beforeEach, describe, expect, it, vi } from "vitest";

const { repository } = vi.hoisted(() => ({
  repository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findTechnicianById: vi.fn(),
    findServiceTypeById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    countByStatus: vi.fn(),
  },
}));

vi.mock("./request.repository", () => ({
  requestRepository: repository,
}));

import { RequestService } from "./request.service";

const validCreateInput = {
  title: "Acceso al sistema",
  description: "No puedo acceder al sistema corporativo",
  serviceTypeId: 1,
};

describe("RequestService", () => {
  let service: RequestService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RequestService();
  });

  it("rejects creation when the service type does not exist", async () => {
    repository.findServiceTypeById.mockResolvedValue(null);

    await expect(service.create(validCreateInput)).rejects.toThrow(
      "SERVICE_TYPE_NOT_FOUND",
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects creation when the technician does not exist", async () => {
    repository.findServiceTypeById.mockResolvedValue({ id: 1 });
    repository.findTechnicianById.mockResolvedValue(null);

    await expect(
      service.create({ ...validCreateInput, technicianId: 2 }),
    ).rejects.toThrow("TECHNICIAN_NOT_FOUND");
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects an update when the new service type does not exist", async () => {
    repository.findById.mockResolvedValue({ id: 1 });
    repository.findServiceTypeById.mockResolvedValue(null);

    await expect(service.update(1, { serviceTypeId: 2 })).rejects.toThrow(
      "SERVICE_TYPE_NOT_FOUND",
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("rejects an update when the new technician does not exist", async () => {
    repository.findById.mockResolvedValue({ id: 1 });
    repository.findTechnicianById.mockResolvedValue(null);

    await expect(service.update(1, { technicianId: 2 })).rejects.toThrow(
      "TECHNICIAN_NOT_FOUND",
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("allows unassigning a technician", async () => {
    repository.findById.mockResolvedValue({ id: 1 });
    repository.update.mockResolvedValue({ id: 1 });

    await service.update(1, { technicianId: null });

    expect(repository.findTechnicianById).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(1, {
      technician: { disconnect: true },
    });
  });

  it("throws REQUEST_NOT_FOUND when the request does not exist", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getById(1)).rejects.toThrow("REQUEST_NOT_FOUND");
  });
});
