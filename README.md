# IT Service Desk API

REST API for managing IT service requests, technicians and service types.

This project was developed as part of a Full Stack technical assessment.

## Tech Stack

- Node.js 24
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Zod
- Vitest
- Supertest
- Swagger / OpenAPI
- Docker
- GitHub Actions

## Architecture

The backend follows a feature-based architecture with clear separation of responsibilities:

```text
HTTP Request
     ↓
Routes
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
Prisma
     ↓
PostgreSQL
