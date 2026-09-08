# IT Service Desk API

API REST para la gestión de solicitudes de soporte TI, técnicos y tipos de servicio. Desarrollada como parte de una evaluación técnica Full Stack.

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Runtime | Node.js 24 |
| Lenguaje | TypeScript 5.9 |
| Framework HTTP | Express 5 |
| Base de datos | PostgreSQL 17 |
| ORM | Prisma 7.10 |
| Validación | Zod 4 |
| Pruebas | Vitest + Supertest |
| Documentación interactiva | Swagger UI (OpenAPI 3.0.3) |
| Seguridad HTTP | Helmet, CORS, express-rate-limit |
| Contenedores | Docker Compose (solo PostgreSQL) |
| CI | GitHub Actions |

## Requisitos previos

- Node.js 24
- npm
- PostgreSQL >= 15 (local o vía Docker Compose)
- Variables de entorno configuradas (ver [05-development.md](./docs/05-development.md))

## Instalación

```bash
cd backend
npm install
npm run db:generate
```

## Configuración

Copia `.env.example` a `.env` y configura las variables. La aplicación exige `DATABASE_URL` y `DATABASE_URL_TEST` al arrancar (definidas en `src/config/env.ts`).

```bash
cp .env.example .env
```

Consulta el detalle de cada variable en [05-development.md](./docs/05-development.md).

## Base de datos

Con PostgreSQL en ejecución:

```bash
npm run db:migrate   # Aplica migraciones en desarrollo
npm run db:seed      # Carga datos de ejemplo (borra datos previos)
```

Para levantar PostgreSQL con Docker Compose:

```bash
docker compose up -d
```

## Ejecución

```bash
# Desarrollo (recarga automática con tsx)
npm run dev

# Producción
npm run build
npm start
```

La API escucha en el puerto definido por `PORT` (predeterminado: `3000`).

- API base: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api-docs`

## Pruebas

Los tests de integración usan `DATABASE_URL_TEST` contra una base de datos con migraciones y seed aplicados.

```bash
npm test              # Ejecuta la suite completa una vez
npm run test:watch    # Modo observación
npm run check         # format:check + lint + test + build
```

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con `tsx watch` |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta `dist/server.js` |
| `npm test` | Ejecuta tests con Vitest |
| `npm run test:watch` | Vitest en modo watch |
| `npm run lint` | ESLint sobre el proyecto |
| `npm run format` | Formatea con Prettier |
| `npm run format:check` | Verifica formato sin modificar |
| `npm run check` | Pipeline local: formato, lint, tests y build |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:seed` | Ejecuta `prisma/seed.ts` |

## Documentación técnica

| Documento | Contenido |
|---|---|
| [01-overview.md](./docs/01-overview.md) | Problema, objetivo, alcance y funcionalidades |
| [02-architecture.md](./docs/02-architecture.md) | Estructura, capas y flujo de peticiones |
| [03-data-model.md](./docs/03-data-model.md) | Entidades, relaciones y diagrama ER |
| [04-api.md](./docs/04-api.md) | Endpoints, validaciones, respuestas y errores |
| [05-development.md](./docs/05-development.md) | Entorno, Docker, Prisma, tests y calidad |
| [06-decisions.md](./docs/06-decisions.md) | Decisiones técnicas y justificación |
