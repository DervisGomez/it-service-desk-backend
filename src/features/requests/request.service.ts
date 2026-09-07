import { RequestPriority, RequestStatus } from "@prisma/client";
import { requestRepository } from "./request.repository";
import type {
  CreateRequestInput,
  UpdateRequestInput,
} from "./request.schemas";
import type { RequestFilters } from "./request.types";

export class RequestService {
  async getAll(filters: RequestFilters) {
    return requestRepository.findAll(filters);
  }

  async getById(id: number) {
    const request = await requestRepository.findById(id);
    if (!request) throw new Error("REQUEST_NOT_FOUND");
    return request;
  }

  async create(input: CreateRequestInput) {
    await this.ensureServiceTypeExists(input.serviceTypeId);

    if (input.technicianId !== undefined) {
      await this.ensureTechnicianExists(input.technicianId);
    }

    return requestRepository.create({
      title: input.title,
      description: input.description,
      priority: input.priority ?? RequestPriority.MEDIUM,
      technician: input.technicianId
        ? { connect: { id: input.technicianId } }
        : undefined,
      serviceType: { connect: { id: input.serviceTypeId } },
    });
  }

  async update(id: number, input: UpdateRequestInput) {
    await this.getById(id);

    if (input.serviceTypeId !== undefined) {
      await this.ensureServiceTypeExists(input.serviceTypeId);
    }

    if (input.technicianId !== undefined && input.technicianId !== null) {
      await this.ensureTechnicianExists(input.technicianId);
    }

    return requestRepository.update(id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.serviceTypeId !== undefined && {
        serviceType: { connect: { id: input.serviceTypeId } },
      }),
      ...(input.technicianId !== undefined && {
        technician:
          input.technicianId === null
            ? { disconnect: true }
            : { connect: { id: input.technicianId } },
      }),
    });
  }

  async delete(id: number) {
    await this.getById(id);
    await requestRepository.delete(id);
  }

  async getDashboard() {
    const [total, pending, assigned, inProgress, resolved, cancelled] =
      await Promise.all([
        requestRepository.count(),
        requestRepository.countByStatus(RequestStatus.PENDING),
        requestRepository.countByStatus(RequestStatus.ASSIGNED),
        requestRepository.countByStatus(RequestStatus.IN_PROGRESS),
        requestRepository.countByStatus(RequestStatus.RESOLVED),
        requestRepository.countByStatus(RequestStatus.CANCELLED),
      ]);

    return {
      total,
      byStatus: { pending, assigned, inProgress, resolved, cancelled },
    };
  }

  private async ensureTechnicianExists(id: number) {
    const technician = await requestRepository.findTechnicianById(id);

    if (!technician) {
      throw new Error("TECHNICIAN_NOT_FOUND");
    }
  }

  private async ensureServiceTypeExists(id: number) {
    const serviceType = await requestRepository.findServiceTypeById(id);

    if (!serviceType) {
      throw new Error("SERVICE_TYPE_NOT_FOUND");
    }
  }
}

export const requestService = new RequestService();
