# Club One

*One club. One platform.*

Plataforma SaaS premium para gestionar clubes y academias deportivas de forma sencilla.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Animaciones:** Framer Motion
- **Estado:** Zustand / TanStack Query
- **Base de datos:** Supabase (PostgreSQL + Data API)
- **Auth:** NextAuth.js (roles: SUPER_ADMIN, CLUB_ADMIN, ENTRENADOR, JUGADOR, TUTOR)
- **Mensajería:** API autenticada con sincronización automática
- **Pagos:** Stripe / Conekta (modo test)
- **Automatizaciones:** Webhooks para n8n

## Instalación

```bash
npm install
```

## Configuración

Usa `.env.example` como plantilla para `.env` y `.env.local`:

```bash
cp .env.example .env
```

En Supabase copia **Project URL**, **Publishable key** y **Secret key** desde
**Connect** a `.env.local`. También se admiten las claves legacy `anon` y
`service_role`. La clave secreta nunca debe llevar el prefijo `NEXT_PUBLIC_`.

## Base de datos

Aplica los archivos de `supabase/migrations` desde **SQL Editor**, o configura
temporalmente `SUPABASE_DB_URL` con el Session pooler y ejecuta:

```bash
npm run db:migrate
npm run db:seed
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Cuentas de demo

- Super Admin: `super@clubone.io` / `admin123`
- Club Admin: `club@demo.mx` / `club123`
- Entrenador: `coach@demo.mx` / `coach123`

## Rutas principales

- `/` — Landing page
- `/login`, `/registro` — Autenticación
- `/super-admin/dashboard` — Panel de plataforma
- `/club/[clubId]/dashboard` — Dashboard del club
- `/club/[clubId]/equipos` — Gestión de equipos
- `/club/[clubId]/equipos/[equipoId]/roster` — Roster
- `/club/[clubId]/equipos/[equipoId]/tactica` — Pizarra táctica
- `/club/[clubId]/calendario` — Eventos y RSVP
- `/club/[clubId]/chat` — Chat de equipo
- `/club/[clubId]/cobros` — Mensualidades y pagos
- `/club/[clubId]/registro` — Gestión de solicitudes de inscripción
- `/club/[clubId]/background-checks` — Verificación de antecedentes
- `/club/[clubId]/configuracion` — Configuración del club + bitácora de auditoría
- `/inscripcion/[slug]` — Formulario público de inscripción
- `/usa-goalkeeper-tour-2026` — Landing y selección de sede del USA Goalkeeper Tour 2026
- `/app/inicio` — Vista mobile PWA

La configuración de los cuatro formularios externos y sus enlaces está en [`docs/USA_GOALKEEPER_TOUR_JOTFORM.md`](docs/USA_GOALKEEPER_TOUR_JOTFORM.md).

## Webhooks

- `POST /api/webhooks/n8n/payment-reminder`
- `POST /api/webhooks/n8n/weekly-report`
- `POST /api/webhooks/n8n/absence-alert`
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/conekta`

Los webhooks de n8n requieren `Authorization: Bearer <N8N_WEBHOOK_SECRET>`. Stripe valida `stripe-signature` y Conekta valida el encabezado `DIGEST` con `CONEKTA_WEBHOOK_PUBLIC_KEY`.

## Operación y salud

- `GET /api/health` — comprueba base de datos e indica qué integraciones están configuradas, sin revelar secretos.
- El benchmark y la ruta de paridad competitiva están en [`docs/SPORTSENGINE_BENCHMARK.md`](docs/SPORTSENGINE_BENCHMARK.md).

## Licencia

© Club One. Todos los derechos reservados.
