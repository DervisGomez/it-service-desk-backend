import { prisma } from "../../config/prisma.js";

export class ServiceTypeRepository {
  async findActive() {
    return prisma.serviceType.findMany({
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
