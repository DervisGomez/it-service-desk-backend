import { serviceTypeRepository } from "./service-type.repository.js";

export class ServiceTypeService {
  async getActive() {
    return serviceTypeRepository.findActive();
  }
}

export const serviceTypeService = new ServiceTypeService();
