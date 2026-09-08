import { technicianRepository } from "./technician.repository.js";

export class TechnicianService {
  async getActive() {
    return technicianRepository.findActive();
  }
}

export const technicianService = new TechnicianService();
