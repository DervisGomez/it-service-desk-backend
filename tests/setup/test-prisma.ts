import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "../../src/config/env.js";

const adapter = new PrismaPg({
  connectionString: env.databaseUrlTest,
});

export const testPrisma = new PrismaClient({
  adapter,
});
