import { prisma } from "../../config/prisma.js";

export class TechnicianRepository {
  async findActive() {
    return prisma.technician.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}

export const technicianRepository = new TechnicianRepository();
