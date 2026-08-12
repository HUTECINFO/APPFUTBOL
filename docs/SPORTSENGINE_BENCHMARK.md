# Benchmark competitivo: SportsEngine

Revisión actualizada el 21 de julio de 2026 con fuentes oficiales de SportsEngine.

## Qué ofrece SportsEngine

SportsEngine HQ concentra registro, pagos, membresías y elegibilidad; temporadas y horarios; torneos; voluntariado; uniformes; aplicación móvil, sitios y comunicación; además de seguridad, verificaciones de antecedentes y gestión de riesgo. Su ecosistema añade streaming y highlights (Play), torneos/brackets (Tourney) y operaciones de negocios por clases (Motion).

Fuentes: [SportsEngine HQ](https://www.sportsengine.com/hq/), [portafolio de soluciones](https://www.sportsengine.com/solutions/home/), [registro de Motion](https://www.sportsengine.com/motion/features/registration/), [finanzas de Motion](https://www.sportsengine.com/motion/features/financials/) y [gestión de membresías](https://www.sportsengine.com/motion/features/memberships/).

## Posición actual del producto

| Área | Club One | SportsEngine | Decisión de producto |
|---|---|---|---|
| Multi-club, roles y marca | Implementado; aislamiento reforzado | Implementado | Mantener personalización por club y auditoría por tenant |
| Equipos y roster | Implementado | Implementado | Añadir importación, invitaciones y documentos |
| Calendario, RSVP y asistencia | Implementado | Implementado | Añadir recurrencia y prevención de conflictos |
| Cobros | Stripe, Conekta, efectivo y transferencias | Tarjeta/ACH, planes y reportes | Priorizar planes, facturación y conciliación mexicana |
| Comunicación | Chat por equipo y automatizaciones n8n | Email, SMS, push y tracking | Unificar bandeja, plantillas, entregas y preferencias |
| App familiar | PWA para jugador/tutor | App móvil | Mantener PWA instalable y sumar notificaciones push |
| Rendimiento deportivo | Táctica, goles, tarjetas, cambios, evaluaciones y rankings | No es el núcleo de HQ | Ventaja diferencial: fútbol nativo y desarrollo del jugador |
| Registro y membresías | Parcial: alta de club y roster | Muy completo | Brecha P0: formularios, cupos, descuentos, waivers y aprobación |
| Torneos y brackets | Eventos tipo torneo, sin bracket | Producto Tourney dedicado | Brecha P1: temporadas, grupos, eliminatorias y resultados |
| Seguridad y compliance | Auth, roles y webhooks firmados | Background checks y risk management | Brecha P0: consentimiento, expedientes y bitácora de auditoría |
| Streaming y highlights | No implementado | SportsEngine Play | Brecha P2; integrar proveedor antes que construir video propio |

## Criterio para superar a SportsEngine

No basta con replicar su catálogo. La oportunidad es ofrecer una operación más simple para fútbol en México: Conekta/SPEI y facturación local, WhatsApp con consentimiento, pizarra táctica y seguimiento de desarrollo, experiencia móvil web instalable, automatizaciones abiertas y precios transparentes. Las brechas P0 anteriores deben cerrarse antes de afirmar paridad total de plataforma.
