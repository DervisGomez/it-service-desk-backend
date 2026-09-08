import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition: swaggerJSDoc.Options["definition"] = {
  openapi: "3.0.3",

  info: {
    title: "IT Service Desk API",
    version: "1.0.0",
    description:
      "REST API for managing IT service requests, technicians and service types.",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Health",
      description: "API health and readiness endpoints",
    },
    {
      name: "Requests",
      description: "IT service request management",
    },
    {
      name: "Technicians",
      description: "Technician catalog",
    },
    {
      name: "Service Types",
      description: "Service type catalog",
    },
  ],

  components: {
    schemas: {
      Priority: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        example: "HIGH",
      },

      RequestStatus: {
        type: "string",
        enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
        example: "PENDING",
      },

      Technician: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Pedro Pérez",
          },
          email: {
            type: "string",
            format: "email",
            example: "pedro.perez@example.com",
          },
          active: {
            type: "boolean",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      ServiceType: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Mantenimiento Impresora",
          },
          description: {
            type: "string",
            nullable: true,
            example: "Mantenimiento preventivo y correctivo de impresoras",
          },
          active: {
            type: "boolean",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      Request: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          title: {
            type: "string",
            example: "Impresora no imprime",
          },
          description: {
            type: "string",
            example: "La impresora de recepción dejó de imprimir documentos.",
          },
          priority: {
            $ref: "#/components/schemas/Priority",
          },
          status: {
            $ref: "#/components/schemas/RequestStatus",
          },
          technicianId: {
            type: "integer",
            nullable: true,
            example: 1,
          },
          serviceTypeId: {
            type: "integer",
            example: 1,
          },
          technician: {
            nullable: true,
            allOf: [
              {
                $ref: "#/components/schemas/Technician",
              },
            ],
          },
          serviceType: {
            $ref: "#/components/schemas/ServiceType",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      CreateRequest: {
        type: "object",
        required: ["title", "description", "priority", "serviceTypeId"],
        properties: {
          title: {
            type: "string",
            minLength: 5,
            maxLength: 120,
            example: "Impresora no imprime",
          },
          description: {
            type: "string",
            minLength: 10,
            maxLength: 1000,
            example: "La impresora de recepción dejó de imprimir documentos.",
          },
          priority: {
            $ref: "#/components/schemas/Priority",
          },
          technicianId: {
            type: "integer",
            nullable: true,
            example: 1,
          },
          serviceTypeId: {
            type: "integer",
            example: 1,
          },
        },
      },

      UpdateRequest: {
        type: "object",
        properties: {
          title: {
            type: "string",
            minLength: 5,
            maxLength: 120,
            example: "Impresora de recepción no imprime",
          },
          description: {
            type: "string",
            minLength: 10,
            maxLength: 1000,
            example: "Se requiere revisión de la impresora.",
          },
          priority: {
            $ref: "#/components/schemas/Priority",
          },
          status: {
            $ref: "#/components/schemas/RequestStatus",
          },
          technicianId: {
            type: "integer",
            nullable: true,
            example: 2,
          },
          serviceTypeId: {
            type: "integer",
            example: 1,
          },
        },
      },

      Pagination: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            example: 1,
          },
          limit: {
            type: "integer",
            example: 10,
          },
          total: {
            type: "integer",
            example: 8,
          },
          totalPages: {
            type: "integer",
            example: 1,
          },
        },
      },

      ApiError: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "La solicitud no fue encontrada",
          },
        },
      },
    },
  },

  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        description: "Returns the current API status.",
        responses: {
          "200": {
            description: "API is available",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    status: "ok",
                  },
                  message: "API disponible",
                },
              },
            },
          },
        },
      },
    },

    "/api/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Check API readiness",
        description:
          "Checks whether the API is ready to process requests, including database connectivity.",
        responses: {
          "200": {
            description: "API and database are ready",
            content: {
              "application/json": {
                example: {
                  status: "ready",
                  database: "connected",
                },
              },
            },
          },
          "503": {
            description: "Database unavailable",
          },
        },
      },
    },

    "/api/requests": {
      get: {
        tags: ["Requests"],
        summary: "List service requests",
        description:
          "Returns a paginated list of service requests with optional filters.",
        parameters: [
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
            },
            description: "Search by request title or description.",
            example: "impresora",
          },
          {
            name: "status",
            in: "query",
            schema: {
              $ref: "#/components/schemas/RequestStatus",
            },
          },
          {
            name: "priority",
            in: "query",
            schema: {
              $ref: "#/components/schemas/Priority",
            },
          },
          {
            name: "technicianId",
            in: "query",
            schema: {
              type: "integer",
            },
          },
          {
            name: "serviceTypeId",
            in: "query",
            schema: {
              type: "integer",
            },
          },
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          "200": {
            description: "Requests retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: [
                    {
                      id: 1,
                      title: "Impresora no imprime",
                      description:
                        "La impresora de recepción dejó de imprimir.",
                      priority: "HIGH",
                      status: "ASSIGNED",
                      technicianId: 1,
                      serviceTypeId: 1,
                    },
                  ],
                  meta: {
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 1,
                      totalPages: 1,
                    },
                  },
                  message: "Solicitudes obtenidas correctamente",
                },
              },
            },
          },
          "400": {
            description: "Invalid query parameters",
          },
        },
      },

      post: {
        tags: ["Requests"],
        summary: "Create service request",
        description: "Creates a new IT service request.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Request created successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    id: 9,
                    title: "Impresora no imprime",
                    description: "La impresora de recepción dejó de imprimir.",
                    priority: "HIGH",
                    status: "PENDING",
                    technicianId: null,
                    serviceTypeId: 1,
                  },
                  message: "Solicitud creada correctamente",
                },
              },
            },
          },
          "400": {
            description: "Invalid request data",
          },
          "404": {
            description: "Technician or service type does not exist",
          },
        },
      },
    },

    "/api/requests/{id}": {
      get: {
        tags: ["Requests"],
        summary: "Get request by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              minimum: 1,
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Request retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Request",
                },
              },
            },
          },
          "400": {
            description: "Invalid request ID",
          },
          "404": {
            description: "Request not found",
          },
        },
      },

      put: {
        tags: ["Requests"],
        summary: "Update service request",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              minimum: 1,
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Request updated successfully",
          },
          "400": {
            description: "Invalid request data",
          },
          "404": {
            description: "Request or related entity not found",
          },
        },
      },

      delete: {
        tags: ["Requests"],
        summary: "Delete service request",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              minimum: 1,
            },
            example: 1,
          },
        ],
        responses: {
          "204": {
            description: "Request deleted successfully",
          },
          "400": {
            description: "Invalid request ID",
          },
          "404": {
            description: "Request not found",
          },
        },
      },
    },

    "/api/requests/dashboard": {
      get: {
        tags: ["Requests"],
        summary: "Get request dashboard statistics",
        description: "Returns aggregated information about service requests.",
        responses: {
          "200": {
            description: "Dashboard data retrieved successfully",
          },
        },
      },
    },

    "/api/technicians": {
      get: {
        tags: ["Technicians"],
        summary: "List active technicians",
        responses: {
          "200": {
            description: "Technicians retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: [
                    {
                      id: 1,
                      name: "Pedro Pérez",
                      email: "pedro.perez@example.com",
                      active: true,
                    },
                  ],
                  message: "Técnicos obtenidos correctamente",
                },
              },
            },
          },
        },
      },
    },

    "/api/service-types": {
      get: {
        tags: ["Service Types"],
        summary: "List active service types",
        responses: {
          "200": {
            description: "Service types retrieved successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: [
                    {
                      id: 1,
                      name: "Mantenimiento Impresora",
                      description:
                        "Mantenimiento preventivo y correctivo de impresoras",
                      active: true,
                    },
                  ],
                  message: "Tipos de servicio obtenidos correctamente",
                },
              },
            },
          },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [],
});
