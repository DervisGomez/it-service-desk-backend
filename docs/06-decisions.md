# Decisiones técnicas

Registro de las principales decisiones implementadas en el código y su justificación inferida del diseño actual.

## Arquitectura por features con capas internas

**Decisión:** Organizar el código en módulos por dominio (`health`, `requests`, `technicians`, `service-types`) con capas Routes → Controller → Service → Repository.

**Justificación:** Separa responsabilidades HTTP, reglas de negocio y acceso a datos. Facilita testear servicios con repositorios mockeados (tests unitarios) e inyectar dependencias alternativas en integración (`createRequestRoutes`, constructores con defaults).

## Prisma con adapter `@prisma/adapter-pg`

**Decisión:** Usar `PrismaPg` con el driver `pg` en lugar del cliente Prisma estándar sin adapter.

**Justificación:** Prisma 7 soporta adapters para conexiones explícitas a PostgreSQL. La misma configuración se replica en seed y tests para consistencia.

## Validación con Zod en middleware reutilizable

**Decisión:** Esquemas Zod en `request.schemas.ts` y middleware `validate` genérico para body, params y query.

**Justificación:** Centraliza reglas de entrada, produce mensajes en español y delega errores a `errorMiddleware` como `VALIDATION_ERROR` 400 con detalle por campo.

## Errores de dominio como strings en Error.message

**Decisión:** Lanzar `new Error("REQUEST_NOT_FOUND")` (y similares) desde servicios; mapear en controlador o middleware global.

**Justificación:** Evita una jerarquía de clases de error personalizadas. El middleware `errorMiddleware` concentra el mapeo a códigos HTTP y respuestas JSON uniformes.

## Formato de respuesta envelope

**Decisión:** Todas las respuestas usan `{ success, data, message }` y errores `{ success, false, message, code }`.

**Justificación:** Contrato predecible para consumidores (p. ej. frontend Angular en `:4200` según CORS predeterminado). La paginación va en `meta`, no mezclada con `data`.

## Catálogos de solo lectura

**Decisión:** Endpoints GET para técnicos y tipos de servicio; sin POST/PUT/DELETE.

**Justificación:** Los catálogos se gestionan vía seed/migraciones. La API expone solo lo necesario para formularios de solicitudes (listas de activos). Los repositorios filtran `active: true` y proyectan campos mínimos.

## Verificación de existencia en servicio, no en BD solamente

**Decisión:** Antes de crear/actualizar solicitudes, `RequestService` comprueba que `serviceTypeId` y `technicianId` existan mediante consultas explícitas.

**Justificación:** Traduce violaciones de FK en errores 404 semánticos (`TECHNICIAN_NOT_FOUND`, `SERVICE_TYPE_NOT_FOUND`) en lugar de errores genéricos de Prisma.

## Desasignación de técnico con `null`

**Decisión:** En actualización, `technicianId: null` ejecuta `{ disconnect: true }` en Prisma; no se valida existencia del técnico en ese caso.

**Justificación:** Permite quitar asignación sin borrar la solicitud. Cubierto por test unitario en `request.service.test.ts`.

## Rate limiting y Helmet globales

**Decisión:** 100 req/15 min por IP, Helmet y CORS configurables desde el arranque.

**Justificación:** Protección básica para una API pública de evaluación/demo sin autenticación. Límite de body JSON a 1 MB reduce riesgo de payloads abusivos.

## Sin autenticación

**Decisión:** No hay middleware de auth ni tokens.

**Justificación:** Alcance acotado a evaluación técnica. Todos los endpoints son accesibles; la seguridad depende del entorno de despliegue.

## Swagger estático vs anotaciones

**Decisión:** OpenAPI definido manualmente en `swagger.ts` con `apis: []`.

**Justificación:** Documentación explícita y controlada en un solo archivo. Requiere mantenimiento manual si cambian endpoints (p. ej. DELETE devuelve 200, no 204 como indica parcialmente la spec).

## Seed destructivo

**Decisión:** El seed ejecuta `deleteMany` en todas las tablas de dominio antes de insertar.

**Justificación:** Garantiza estado reproducible en desarrollo y CI. Adecuado para entornos locales/test; no diseñado para datos de producción.

## Tests: integración parcial de app

**Decisión:** Health usa la aplicación completa (`app.ts`); solicitudes y catálogos montan subconjuntos de rutas con Express mínimo.

**Justificación:** Aísla tests de solicitudes con cliente Prisma de test sin arrancar servidor. Health valida el wiring real incluyendo middlewares globales y conexión a BD de `DATABASE_URL`.

## CI con misma URL para app y tests

**Decisión:** En GitHub Actions, `DATABASE_URL` y `DATABASE_URL_TEST` apuntan a la misma base PostgreSQL efímera.

**Justificación:** Simplifica el pipeline: una sola instancia, migrate deploy, seed y tests contra datos conocidos (8 solicitudes, 4 técnicos, 5 tipos).

## Índices en campos de filtro

**Decisión:** Índices en `requests` para `technicianId`, `serviceTypeId`, `status` y `priority`.

**Justificación:** El listado admite filtros por esos campos; los índices mejoran consultas paginadas en PostgreSQL.

## Express 5 y ES modules

**Decisión:** `"type": "module"` en `package.json`, imports con extensión `.js`, TypeScript con `module: NodeNext`.

**Justificación:** Alineación con ESM nativo en Node.js 24 y Express 5. El build genera JavaScript compatible con `node dist/server.js`.
