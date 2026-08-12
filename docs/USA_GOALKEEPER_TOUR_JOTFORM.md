# USA Goalkeeper Tour 2026 — configuración de Jotform

La página pública vive en `/usa-goalkeeper-tour-2026`. Está preparada para enviar a cada familia a un formulario independiente por sede.

La página ofrece un selector **ES / EN**. Configura los formularios de Jotform con los mismos dos idiomas (campos, autorizaciones, correo de confirmación y página final) para que la experiencia no cambie de idioma al salir del sitio.

## 1. Formularios por sede

Crear un formulario maestro y duplicarlo cuatro veces:

| Sede | Fecha | Variable del sitio |
| --- | --- | --- |
| El Paso, TX | September 19–20, 2026 | `NEXT_PUBLIC_JOTFORM_EL_PASO_URL` |
| Dallas–Fort Worth, TX | October 3–4, 2026 | `NEXT_PUBLIC_JOTFORM_DALLAS_FORT_WORTH_URL` |
| Houston, TX | October 17–18, 2026 | `NEXT_PUBLIC_JOTFORM_HOUSTON_URL` |
| San Antonio, TX | October 31–November 1, 2026 | `NEXT_PUBLIC_JOTFORM_SAN_ANTONIO_URL` |

Aunque cada sede tenga su propio formulario, conservar como primer campo visible **Select your clinic location**, preseleccionado y bloqueado para la sede correspondiente. Esto deja la ciudad registrada también dentro de cada envío.

## 2. Estructura del formulario

### Page 1 — Location & player

- Select your clinic location (required, preselected)
- Player full name (required)
- Date of birth (required)
- Age (calculated or required)
- Birth year / category (required)
- City of residence (required)

### Page 2 — Parent / guardian

- Parent or guardian full name (required)
- Relationship to player (required)
- Email (required)
- Phone (required)
- Address (required)
- Emergency contact name (required)
- Emergency contact phone (required)

### Page 3 — Goalkeeper profile

- Current club or academy
- Years playing goalkeeper
- Level: Beginner / Intermediate / Advanced
- Jersey size
- Glove size
- Injuries, allergies, medication, or relevant medical conditions

### Page 4 — Authorizations & signature

- Sports liability waiver
- Emergency medical treatment authorization
- Photo and video authorization
- Cancellation and refund policy
- Code of conduct
- Medical insurance confirmation
- Parent or guardian e-signature and signature date

All required authorizations must be accepted before the payment page is shown. The final legal language should be reviewed by a Texas-licensed attorney before publishing the forms.

### Page 5 — Payment

- Product: `USA Goalkeeper Tour 2026 Registration`
- Price: `USD $350.00`
- Quantity: one participant per submission
- Stripe card payment
- Optional coupon codes for academies, siblings, or invited guests

The submission should be considered **confirmed only when Stripe reports a successful payment**. Incomplete or failed payment submissions must not consume one of the 60 confirmed spots.

### Page 6 — Confirmation

Show the player, city, dates, amount, confirmation number, venue status, arrival time, equipment list, contact phone, and communication-channel link.

## 3. Capacity and waitlist

For each form:

1. Set the registration product inventory to 60 successful payments.
2. Close the paid form when inventory reaches zero.
3. Replace the closed-form message with a link to that city's waitlist form.
4. Do not collect payment on the waitlist.
5. Promote a waitlisted player only after a confirmed spot is released.

Recommended status values in the Jotform table: `Payment pending`, `Confirmed`, `Refunded`, `Cancelled`, and `Waitlist`.

## 4. City table columns

Keep one table per form with these visible columns:

- Confirmation number
- Player
- Age / birth year
- Level
- Jersey and glove sizes
- Payment status and amount
- Signature received
- Parent email and phone
- Medical notes
- Check-in status
- Assigned group

## 5. Automatic email

Subject: `Registration Confirmed – USA Goalkeeper Tour 2026`

Send only after successful payment. Include:

- Player name
- Selected city and clinic dates
- Amount paid
- Confirmation number
- Final or provisional address
- Arrival time
- Equipment list
- Contact phone
- Communication-channel link

Schedule additional messages 30 days, 14 days, 7 days, and 48 hours before the clinic, plus a thank-you message after the event. These can be automated from Jotform integrations or an n8n workflow using the city and payment-status fields.

## 6. Check-in

Use the Jotform submission ID or a generated confirmation number as the QR value. At arrival, verify:

- Payment is confirmed
- Required authorizations are signed
- Kit or jersey was delivered
- Age/level group is assigned
- Attendance is recorded

## 7. Activating the website buttons

Add each public Jotform URL to `.env.local`, then restart the app:

```env
NEXT_PUBLIC_JOTFORM_EL_PASO_URL="https://form.jotform.com/..."
NEXT_PUBLIC_JOTFORM_DALLAS_FORT_WORTH_URL="https://form.jotform.com/..."
NEXT_PUBLIC_JOTFORM_HOUSTON_URL="https://form.jotform.com/..."
NEXT_PUBLIC_JOTFORM_SAN_ANTONIO_URL="https://form.jotform.com/..."
```

Until a URL exists, the corresponding city displays **Registration opens soon** instead of an active external link.
