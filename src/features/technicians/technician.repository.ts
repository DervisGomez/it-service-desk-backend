import { prisma } from "../../config/prisma.js";
import { PrismaClient } from "@prisma/client";

export class TechnicianRepository {
  constructor(private readonly db: PrismaClient = prisma) {}
  async findActive() {
    return this.db.technician.findMany({
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
