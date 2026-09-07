import { Prisma, RequestStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { RequestFilters } from "./request.types";

export class RequestRepository {
  async findAll(filters: RequestFilters) {
    const { page, limit, ...whereFilters } = filters;

    const where: Prisma.RequestWhereInput = {
      ...(whereFilters.status && { status: whereFilters.status }),
      ...(whereFilters.priority && { priority: whereFilters.priority }),
      ...(whereFilters.technicianId && {
        technicianId: whereFilters.technicianId,
      }),
      ...(whereFilters.serviceTypeId && {
        serviceTypeId: whereFilters.serviceTypeId,
      }),
      ...(whereFilters.search && {
        OR: [
          {
            title: {
              contains: whereFilters.search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: whereFilters.search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: { technician: true, serviceType: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return { requests, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number) {
    return prisma.request.findUnique({
      where: { id },
      include: { technician: true, serviceType: true },
    });
  }

  async findTechnicianById(id: number) {
    return prisma.technician.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  async findServiceTypeById(id: number) {
    return prisma.serviceType.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  async create(data: Prisma.RequestCreateInput) {
    return prisma.request.create({
      data,
      include: { technician: true, serviceType: true },
    });
  }

  async update(id: number, data: Prisma.RequestUpdateInput) {
    return prisma.request.update({
      where: { id },
      data,
      include: { technician: true, serviceType: true },
    });
  }

  async delete(id: number) {
    return prisma.request.delete({ where: { id } });
  }

  async countByStatus(status: RequestStatus) {
    return prisma.request.count({ where: { status } });
  }

  async count() {
    return prisma.request.count();
  }
}

export const requestRepository = new RequestRepository();
