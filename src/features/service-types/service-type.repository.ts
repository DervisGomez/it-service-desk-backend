import { prisma } from "../../config/prisma.js";
import { PrismaClient } from "@prisma/client";

export class ServiceTypeRepository {
  constructor(private readonly db: PrismaClient = prisma) {}
  async findActive() {
    return this.db.serviceType.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }
}

export const serviceTypeRepository = new ServiceTypeRepository();
