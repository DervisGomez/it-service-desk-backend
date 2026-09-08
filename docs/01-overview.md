# Visión general

## Problema

Las áreas de soporte TI necesitan registrar, consultar y dar seguimiento a solicitudes de servicio (incidencias, instalaciones, accesos, etc.) vinculadas a un tipo de servicio y, opcionalmente, a un técnico asignado.

## Objetivo

Exponer una API REST que permita:

- Consultar catálogos de técnicos y tipos de servicio activos.
- Crear, listar, filtrar, actualizar y eliminar solicitudes de soporte.
- Obtener métricas agregadas por estado para un panel de control.
- Verificar disponibilidad de la API y conectividad con la base de datos.

El proyecto se describe en `package.json` como _"REST API for IT Service Desk technical assessment"_.

## Alcance actual

### Incluido

- CRUD completo de solicitudes (`Request`).
- Lectura de técnicos activos (`Technician`).
- Lectura de tipos de servicio activos (`ServiceType`).
- Endpoints de salud (`/api/health`, `/api/health/ready`).
- Paginación y filtros en el listado de solicitudes.
- Validación de entrada con Zod.
- Documentación OpenAPI servida en `/api-docs`.
- Seed de datos de desarrollo/prueba.
- Tests unitarios e de integración.
- Pipeline CI con GitHub Actions.

### Fuera de alcance

- Autenticación y autorización.
- CRUD de técnicos o tipos de servicio (solo lectura de activos).
- Notificaciones, adjuntos o historial de cambios.
- Frontend (no documentado en este repositorio backend).

## Funcionalidades por dominio

### Solicitudes

| Operación      | Descripción                                                                                |
| -------------- | ------------------------------------------------------------------------------------------ |
| Listar         | Paginado con filtros por texto, estado, prioridad, técnico y tipo de servicio              |
| Obtener por ID | Incluye relaciones `technician` y `serviceType`                                            |
| Crear          | Requiere título, descripción y `serviceTypeId`; `technicianId` y `priority` son opcionales |
| Actualizar     | Campos parciales; permite desasignar técnico con `technicianId: null`                      |
| Eliminar       | Borrado físico del registro                                                                |
| Dashboard      | Conteo total y desglose por cada estado                                                    |

### Catálogos

- **Técnicos activos**: listado ordenado por nombre (`id`, `name`, `email`).
- **Tipos de servicio activos**: listado ordenado por nombre (`id`, `name`, `description`).

### Salud

- **Live** (`GET /api/health`): responde si el proceso HTTP está activo.
- **Ready** (`GET /api/health/ready`): verifica conectividad con PostgreSQL mediante `SELECT 1`.

## Estados y prioridades

Los valores provienen de enums definidos en `prisma/schema.prisma`:

**Estados (`RequestStatus`):** `PENDING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED`

**Prioridades (`RequestPriority`):** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

Valores por defecto al crear una solicitud: estado `PENDING`, prioridad `MEDIUM`.
