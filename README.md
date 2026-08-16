# GECI-VA

Sistema Web de Gestión de Comando de Incidentes GECI-VA para la Coordinación de Protección Civil y Bomberos de Metepec, conforme a la NOM-019-SSPC-2019.

## Stack

- **Frontend:** Next.js 16 (App Router, SSR) + React 19 + TypeScript + Tailwind CSS
- **Backend:** API Routes de Next.js + Node.js
- **Base de datos:** PostgreSQL (Neon) con Prisma ORM
- **Autenticación:** NextAuth.js (JWT, RBAC por rol)
- **Validación:** Zod + React Hook Form
- **Reportes:** jsPDF, recharts

## Puesta en marcha local

```bash
npm install                  # esto también corre `prisma generate` automáticamente
cp .env.example .env.local   # y llena tus propias variables
npx prisma migrate dev       # crea las tablas en tu base de datos
npm run dev
```

## Despliegue en Vercel

1. Conecta este repositorio en Vercel.
2. En Project Settings > Environment Variables, agrega las mismas variables de `.env.example` con tus valores reales (usa la cadena de conexión **pooled** de Neon).
3. Vercel corre `npm install` (que genera el cliente de Prisma) y `npm run build` automáticamente en cada push.

## Estado del proyecto

Ver el plan de fases y el avance en las conversaciones del proyecto. Fase actual: **Fase 0 — Cimientos** completada.
