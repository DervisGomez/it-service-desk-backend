import { Prisma, PrismaClient, RequestStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type { RequestFilters } from "./request.types.js";

export class RequestRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

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
      this.db.request.findMany({
        where,
        include: { technician: true, serviceType: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.db.request.count({ where }),
    ]);

    return {
      requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    return this.db.request.findUnique({
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
    return this.db.request.create({
      data,
      include: { technician: true, serviceType: true },
    });
  }

  async update(id: number, data: Prisma.RequestUpdateInput) {
    return this.db.request.update({
      where: { id },
      data,
      include: { technician: true, serviceType: true },
    });
  }

  async delete(id: number) {
    return this.db.request.delete({ where: { id } });
  }

  async countByStatus(status: RequestStatus) {
    return this.db.request.count({ where: { status } });
  }

  async count() {
    return this.db.request.count();
  }
}

export const requestRepository = new RequestRepository();
