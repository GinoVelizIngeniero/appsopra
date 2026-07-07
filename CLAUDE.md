# Portal Sopraval — Monorepo React + Node.js

Portal unificado que migra los 3 sistemas Sopraval/Agrosuper a una arquitectura moderna con capas separadas.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + React Router v6 |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand |
| UI | Tailwind CSS v3 + lucide-react |
| Charts | Recharts |
| Formularios | react-hook-form + zod |
| Backend | Fastify v4 + TypeScript |
| ORM | Prisma + PostgreSQL |
| Auth | JWT (access 15m + refresh 7d) |
| Infra local | pnpm workspaces + Docker Compose |

## Módulos

- **Portal Requerimientos** — CRUD solicitudes infraestructura con flujo Pendiente→Valorizada→Autorizada/Postergada/Rechazada por rol
- **Portal ADF** — Motor OREDA con 5 modos de falla (extensible a 16), folio auto, causas/5-por-qués/planes generados automáticamente
- **Dashboard Confiabilidad** — MTBF/MTTR/Disponibilidad + Jackknife por medianas

## Setup rápido

```bash
# 1. Levantar PostgreSQL
docker-compose up -d

# 2. Variables de entorno
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# 3. Instalar dependencias
pnpm install

# 4. Migrar y seed base de datos
pnpm db:push
pnpm db:seed

# 5. Levantar en modo dev (ambas capas en paralelo)
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Swagger UI: http://localhost:3001/docs

## Usuarios seed

| Email | Contraseña | Rol |
|-------|-----------|-----|
| gvelizm@sopraval.cl | Admin2026! | ADMIN |
| rabarzua@sopraval.cl | Sopraval2026 | GERENTE |
| fescobara@sopraval.cl | Sopraval2026 | MANTENIMIENTO |
| cmadridp@sopraval.cl | Sopraval2026 | MANTENIMIENTO |
| trabajador1@sopraval.cl | Sopraval2026 | USER |
