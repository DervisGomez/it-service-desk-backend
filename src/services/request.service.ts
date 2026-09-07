import { RequestPriority, RequestStatus } from "@prisma/client";
import { requestRepository } from "../repositories/request.repository";

export interface CreateRequestInput {
  title: string;
  description: string;
  priority?: RequestPriority;
  technicianId?: number;
  serviceTypeId: number;
}

export interface UpdateRequestInput {
  title?: string;
  description?: string;
  priority?: RequestPriority;
  status?: RequestStatus;
  technicianId?: number | null;
  serviceTypeId?: number;
}

export class RequestService {
  async getAll(filters: {
    search?: string;
    status?: RequestStatus;
    priority?: RequestPriority;
    technicianId?: number;
    serviceTypeId?: number;
  }) {
    return requestRepository.findAll(filters);
  }

  async getById(id: number) {
    const request = await requestRepository.findById(id);

    if (!request) {
      throw new Error("REQUEST_NOT_FOUND");
    }

    return request;
  }

  async create(input: CreateRequestInput) {
    return requestRepository.create({
      title: input.title,
      description: input.description,
      priority: input.priority ?? RequestPriority.MEDIUM,
      technician: input.technicianId
        ? {
            connect: {
              id: input.technicianId,
            },
          }
        : undefined,
      serviceType: {
        connect: {
          id: input.serviceTypeId,
        },
      },
    });
  }

  async update(id: number, input: UpdateRequestInput) {
    await this.getById(id);

    return requestRepository.update(id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.priority !== undefined && {
        priority: input.priority,
      }),
      ...(input.status !== undefined && {
        status: input.status,
      }),
      ...(input.serviceTypeId !== undefined && {
        serviceType: {
          connect: {
            id: input.serviceTypeId,
          },
        },
      }),
      ...(input.technicianId !== undefined && {
        technician:
          input.technicianId === null
            ? {
                disconnect: true,
              }
            : {
                connect: {
                  id: input.technicianId,
                },
              },
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
      byStatus: {
        pending,
        assigned,
        inProgress,
        resolved,
        cancelled,
      },
    };
  }
}

export const requestService = new RequestService();
