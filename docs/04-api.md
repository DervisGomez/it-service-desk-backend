# Referencia de API

Base URL: `http://localhost:3000` (configurable con `PORT`).

Documentación interactiva: [`/api-docs`](http://localhost:3000/api-docs).

No existe autenticación; todos los endpoints son públicos.

## Formato común

Ver [02-architecture.md](./02-architecture.md#formato-de-respuesta) para la estructura de respuestas.

---

## Health

### `GET /api/health`

Comprueba que el proceso HTTP está activo. No consulta la base de datos.

**Respuesta 200**

```json
{
  "success": true,
  "data": { "status": "ok" },
  "message": "API disponible"
}
```

---

### `GET /api/health/ready`

Comprueba conectividad con PostgreSQL (`SELECT 1`).

**Respuesta 200**

```json
{
  "success": true,
  "data": { "status": "ready", "database": "connected" },
  "message": "API lista para recibir solicitudes"
}
```

**Respuesta 503**

```json
{
  "success": false,
  "message": "API no disponible temporalmente",
  "code": "SERVICE_UNAVAILABLE"
}
```

---

## Solicitudes

Prefijo: `/api/requests`

### `GET /api/requests`

Lista solicitudes paginadas con filtros opcionales. Orden: `createdAt` descendente. Incluye `technician` y `serviceType` completos.

**Query parameters**

| Parámetro | Tipo | Validación | Predeterminado |
|---|---|---|---|
| `search` | string | Trim; busca en `title` y `description` (insensible a mayúsculas) | — |
| `status` | enum | `PENDING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | — |
| `priority` | enum | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | — |
| `technicianId` | number | Entero positivo | — |
| `serviceTypeId` | number | Entero positivo | — |
| `page` | number | Entero >= 1 | `1` |
| `limit` | number | Entero 1–100 | `10` |

**Respuesta 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Impresora no imprime",
      "description": "La impresora del área administrativa presenta errores al enviar documentos.",
      "priority": "HIGH",
      "status": "ASSIGNED",
      "technicianId": 1,
      "serviceTypeId": 5,
      "createdAt": "2026-09-07T22:14:26.000Z",
      "updatedAt": "2026-09-07T22:14:26.000Z",
      "technician": {
        "id": 1,
        "name": "Pedro Pérez",
        "email": "pedro.perez@interactuar.local",
        "active": true,
        "createdAt": "2026-09-07T22:14:26.000Z"
      },
      "serviceType": {
        "id": 5,
        "name": "Mantenimiento de impresoras",
        "description": "Soporte y mantenimiento de impresoras y dispositivos de impresión.",
        "active": true,
        "createdAt": "2026-09-07T22:14:26.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1
    }
  },
  "message": "Solicitudes obtenidas correctamente"
}
```

**Respuesta 400** — Parámetros de query inválidos (`VALIDATION_ERROR`).

---

### `GET /api/requests/dashboard`

Estadísticas agregadas de solicitudes.

**Respuesta 200**

```json
{
  "success": true,
  "data": {
    "total": 8,
    "byStatus": {
      "pending": 3,
      "assigned": 2,
      "inProgress": 2,
      "resolved": 1,
      "cancelled": 0
    }
  },
  "message": "Dashboard obtenido correctamente"
}
```

---

### `GET /api/requests/:id`

Obtiene una solicitud por ID con relaciones incluidas.

**Path parameters**

| Parámetro | Validación |
|---|---|
| `id` | Entero positivo (coerción desde string) |

**Respuesta 200** — Objeto `Request` en `data`.

**Respuesta 400** — ID inválido (`VALIDATION_ERROR`).

**Respuesta 404**

```json
{
  "success": false,
  "message": "La solicitud no existe",
  "code": "REQUEST_NOT_FOUND"
}
```

---

### `POST /api/requests`

Crea una solicitud. Estado inicial: `PENDING`. Prioridad: la enviada o `MEDIUM` por defecto.

**Body (JSON)**

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `title` | string | Sí | Trim; 5–120 caracteres |
| `description` | string | Sí | Trim; 10–1000 caracteres |
| `serviceTypeId` | number | Sí | Entero positivo; debe existir |
| `priority` | enum | No | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `technicianId` | number | No | Entero positivo; debe existir si se envía |

**Ejemplo de petición**

```json
{
  "title": "Mantenimiento de impresora",
  "description": "La impresora del área administrativa presenta problemas de impresión.",
  "priority": "HIGH",
  "technicianId": 1,
  "serviceTypeId": 5
}
```

**Respuesta 201** — Solicitud creada con relaciones en `data`.

**Respuesta 400** — Datos inválidos (`VALIDATION_ERROR` con array `errors`).

**Respuesta 404**

| Código | Condición |
|---|---|
| `TECHNICIAN_NOT_FOUND` | `technicianId` no existe |
| `SERVICE_TYPE_NOT_FOUND` | `serviceTypeId` no existe |

---

### `PUT /api/requests/:id`

Actualización parcial. Solo se modifican los campos enviados.

**Path parameters:** igual que `GET /api/requests/:id`.

**Body (JSON)** — Todos opcionales:

| Campo | Validación adicional |
|---|---|
| `title` | 5–120 caracteres |
| `description` | 10–1000 caracteres |
| `priority` | Enum de prioridad |
| `status` | Enum de estado |
| `serviceTypeId` | Entero positivo; debe existir |
| `technicianId` | Entero positivo, o `null` para desasignar |

**Ejemplo — asignar técnico y cambiar estado**

```json
{
  "priority": "CRITICAL",
  "status": "IN_PROGRESS",
  "technicianId": 1
}
```

**Ejemplo — desasignar técnico**

```json
{
  "technicianId": null
}
```

**Respuesta 200** — Solicitud actualizada en `data`.

**Respuesta 400** — Datos inválidos.

**Respuesta 404**

| Código | Condición |
|---|---|
| `REQUEST_NOT_FOUND` | ID inexistente |
| `TECHNICIAN_NOT_FOUND` | Nuevo `technicianId` inexistente |
| `SERVICE_TYPE_NOT_FOUND` | Nuevo `serviceTypeId` inexistente |

---

### `DELETE /api/requests/:id`

Elimina físicamente la solicitud.

**Respuesta 200**

```json
{
  "success": true,
  "data": null,
  "message": "Solicitud eliminada correctamente"
}
```

**Respuesta 400** — ID inválido.

**Respuesta 404** — `REQUEST_NOT_FOUND`.

---

## Técnicos

### `GET /api/technicians`

Lista técnicos con `active: true`, ordenados por `name` ascendente.

**Respuesta 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "name": "Ana Martínez",
      "email": "ana.martinez@interactuar.local"
    },
    {
      "id": 3,
      "name": "Carlos Rodríguez",
      "email": "carlos.rodriguez@interactuar.local"
    }
  ],
  "message": "Técnicos obtenidos correctamente"
}
```

Solo expone `id`, `name` y `email` (no `active` ni `createdAt`).

---

## Tipos de servicio

### `GET /api/service-types`

Lista tipos de servicio con `active: true`, ordenados por `name` ascendente.

**Respuesta 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "name": "Gestión de accesos",
      "description": "Creación, modificación o recuperación de accesos a sistemas."
    },
    {
      "id": 1,
      "name": "Mantenimiento de equipos",
      "description": "Diagnóstico y mantenimiento preventivo o correctivo de equipos."
    }
  ],
  "message": "Tipos de servicio obtenidos correctamente"
}
```

Solo expone `id`, `name` y `description`.

---

## Códigos de error globales

Gestionados por `error.middleware.ts`:

| HTTP | Código | Origen |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Fallo de validación Zod |
| 404 | `REQUEST_NOT_FOUND` | Solicitud inexistente |
| 404 | `TECHNICIAN_NOT_FOUND` | Técnico inexistente |
| 404 | `SERVICE_TYPE_NOT_FOUND` | Tipo de servicio inexistente |
| 404 | `RESOURCE_NOT_FOUND` | Prisma `P2025` |
| 409 | `CONFLICT` | Prisma `P2002` (unicidad) |
| 409 | `RELATION_CONSTRAINT_ERROR` | Prisma `P2003` |
| 500 | `INTERNAL_SERVER_ERROR` | Error no controlado |
| 503 | `SERVICE_UNAVAILABLE` | Base de datos no disponible en `/ready` |

**Ejemplo de error de validación**

```json
{
  "success": false,
  "message": "Los datos enviados no son válidos",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "title", "message": "El título debe tener al menos 5 caracteres" },
    { "field": "description", "message": "La descripción debe tener al menos 10 caracteres" }
  ]
}
```

## Límites y cabeceras

- Rate limit: **100 peticiones / 15 minutos** por IP (cabeceras estándar draft-8).
- Cuerpo JSON máximo: **1 MB**.
- CORS: origen permitido según `CORS_ORIGIN`.
