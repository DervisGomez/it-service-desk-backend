import { healthRepository } from "./health.repository.js";

export class HealthService {
  async isReady() {
    try {
      await healthRepository.checkDatabaseConnection();
      return true;
    } catch {
      return false;
    }
  }
}

export const healthService = new HealthService();
