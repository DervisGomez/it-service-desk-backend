import { Prisma, RequestPriority, RequestStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

export interface RequestFilters {
  search?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  technicianId?: number;
  serviceTypeId?: number;
}

export class RequestRepository {
  async findAll(filters: RequestFilters = {}) {
    const where: Prisma.RequestWhereInput = {
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.technicianId && {
        technicianId: filters.technicianId,
      }),
      ...(filters.serviceTypeId && {
        serviceTypeId: filters.serviceTypeId,
      }),
      ...(filters.search && {
        OR: [
          {
            title: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    return prisma.request.findMany({
      where,
      include: {
        technician: true,
        serviceType: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: number) {
    return prisma.request.findUnique({
      where: { id },
      include: {
        technician: true,
        serviceType: true,
      },
    });
  }

  async create(data: Prisma.RequestCreateInput) {
    return prisma.request.create({
      data,
      include: {
        technician: true,
        serviceType: true,
      },
    });
  }

  async update(id: number, data: Prisma.RequestUpdateInput) {
    return prisma.request.update({
      where: { id },
      data,
      include: {
        technician: true,
        serviceType: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.request.delete({
      where: { id },
    });
  }

  async countByStatus(status: RequestStatus) {
    return prisma.request.count({
      where: { status },
    });
  }

  async count() {
    return prisma.request.count();
  }
}

export const requestRepository = new RequestRepository();
