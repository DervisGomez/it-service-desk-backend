import { RequestController } from "../../src/features/requests/request.controller.js";
import { createRequestRoutes } from "../../src/features/requests/request.routes.js";
import { testRequestService } from "./test-request-service.js";

const testRequestController = new RequestController(testRequestService);

export const testRequestRoutes = createRequestRoutes(testRequestController);
