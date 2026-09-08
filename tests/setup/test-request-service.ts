import { RequestRepository } from "../../src/features/requests/request.repository.js";
import { RequestService } from "../../src/features/requests/request.service.js";
import { testPrisma } from "./test-prisma.js";

const testRequestRepository = new RequestRepository(testPrisma);

export const testRequestService = new RequestService(testRequestRepository);
