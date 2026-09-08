import { prisma } from "../../config/prisma.js";

export class HealthRepository {
  async checkDatabaseConnection() {
    await prisma.$queryRaw`SELECT 1`;
  }
}

export const healthRepository = new HealthRepository();
