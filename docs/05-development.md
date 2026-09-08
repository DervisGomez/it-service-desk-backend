# Guía de desarrollo

## Requisitos

| Herramienta | Versión referenciada en el proyecto |
|---|---|
| Node.js | 24 (CI en `.github/workflows/ci.yml`) |
| PostgreSQL | >= 15 (`.env.example`); imagen Docker/CI: 17-alpine |
| npm | Incluido con Node.js |

## Variables de entorno

Definidas en `src/config/env.ts`:

| Variable | Requerida | Predeterminado | Descripción |
|---|---|---|---|
| `DATABASE_URL` | Sí | — | Conexión PostgreSQL para la aplicación y Prisma CLI |
| `DATABASE_URL_TEST` | Sí | — | Conexión para tests de integración (`tests/setup/test-prisma.ts`) |
| `PORT` | No | `3000` | Puerto HTTP (entero 1–65535) |
| `NODE_ENV` | No | `development` | Entorno de ejecución |
| `CORS_ORIGIN` | No | `http://localhost:4200` | Origen permitido por CORS |

**Nota:** `.env.example` solo documenta `DATABASE_URL`. La aplicación falla al arrancar si falta `DATABASE_URL_TEST`; configúrala apuntando a una base de datos de prueba separada o a la misma instancia con otro esquema/base.

Ejemplo mínimo:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:4200
DATABASE_URL="postgresql://user:password@localhost:5432/it_service_desk"
DATABASE_URL_TEST="postgresql://user:password@localhost:5432/it_service_desk_test"
```

## Docker Compose

`docker-compose.yml` levanta únicamente PostgreSQL. Variables esperadas en el entorno del host (p. ej. archivo `.env` junto al compose):

| Variable | Uso |
|---|---|
| `POSTGRES_DB` | Nombre de la base de datos |
| `POSTGRES_USER` | Usuario |
| `POSTGRES_PASSWORD` | Contraseña |
| `POSTGRES_PORT` | Puerto expuesto en el host |

```bash
docker compose up -d
```

El servicio no incluye la API; esta se ejecuta con `npm run dev` en el host.

## Prisma

### Configuración

- Esquema: `prisma/schema.prisma`
- Config CLI: `prisma.config.ts` (usa `DATABASE_URL`)
- Migraciones: `prisma/migrations/`
- Cliente generado: `@prisma/client` con adapter `@prisma/adapter-pg`

### Comandos

```bash
npm run db:generate   # Genera el cliente Prisma
npm run db:migrate    # prisma migrate dev (desarrollo)
npm run db:seed       # Carga datos de ejemplo
```

En CI se usa `npx prisma migrate deploy` seguido de `npm run db:seed`.

### Seed

`prisma/seed.ts`:

1. Elimina solicitudes, tipos de servicio y técnicos existentes.
2. Inserta 4 técnicos, 5 tipos de servicio y 8 solicitudes.

Requiere `DATABASE_URL`. No usar en producción sin evaluar el borrado previo.

## TypeScript

`tsconfig.json`:

- Target ES2022, módulos NodeNext.
- `rootDir`: `src/`, `outDir`: `dist/`.
- Modo estricto activado.
- Solo compila archivos en `src/**/*.ts` (tests excluidos del build).

## Pruebas

Framework: **Vitest** (`vitest.config.ts` excluye `dist/**`).

### Estructura

| Tipo | Ubicación | Alcance |
|---|---|---|
| Unitarios | `tests/unit/` | Servicios con repositorios mockeados |
| Integración | `tests/integration/` | HTTP con Supertest |

### Tests de integración

Requieren base de datos accesible vía `DATABASE_URL_TEST` con migraciones y seed aplicados.

| Archivo | Endpoints probados |
|---|---|
| `health.integration.test.ts` | `/api/health`, `/api/health/ready` (usa `app` completa) |
| `request.integration.test.ts` | CRUD de solicitudes (router de test con `DATABASE_URL_TEST`) |
| `catalog.integration.test.ts` | `/api/technicians`, `/api/service-types` |

El setup de solicitudes (`tests/setup/`) inyecta `RequestRepository` y `RequestService` con `testPrisma`.

```bash
npm test
npm run test:watch
```

## Lint y formato

| Herramienta | Configuración | Comando |
|---|---|---|
| ESLint 10 | `eslint.config.js` (typescript-eslint + prettier) | `npm run lint` |
| Prettier 3 | `.prettierrc.json` (80 cols, comillas dobles, trailing comma) | `npm run format` / `format:check` |

ESLint ignora `dist/` y `node_modules/`. Regla destacada: `@typescript-eslint/no-unused-vars` con excepción para args que empiezan por `_`.

## Build y verificación

```bash
npm run build    # tsc → dist/
npm run check    # format:check + lint + test + build
```

Producción:

```bash
npm run build
npm start        # node dist/server.js
```

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

Disparadores: push y PR a `main` y `develop`.

Pasos:

1. PostgreSQL 17 como servicio.
2. `npm ci`
3. `prisma migrate deploy`
4. `npm run db:seed`
5. `npm run format:check`
6. `npm run lint`
7. `npm test`
8. `npm run build`

Variables de entorno del job definidas en el workflow (incluye `DATABASE_URL` y `DATABASE_URL_TEST` apuntando a la misma base de test).

## Swagger

Especificación estática en `src/config/swagger.ts`, servida en `/api-docs`. No se genera automáticamente desde anotaciones JSDoc (`apis: []`); mantener sincronizada manualmente con el código si se modifican endpoints.

## Estructura de arranque

1. `server.ts` importa `app.ts` y escucha en `env.port`.
2. `env.ts` carga `dotenv/config` y valida variables al importarse.
3. `prisma.ts` crea el cliente global usado por repositorios.
