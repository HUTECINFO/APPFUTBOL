# App móvil Club One (iOS y Android)

La app nativa es un contenedor de **Capacitor 8** que carga la plataforma Next.js
desplegada. Toda la lógica (NextAuth, Supabase, Stripe, API routes) sigue en el
servidor: cada deploy web actualiza la app al instante, sin pasar por revisión,
siempre que no cambie la parte nativa.

| | |
|---|---|
| Bundle ID / Package | `mx.hutec.clubone` (no se puede cambiar después de publicar) |
| Nombre | Club One |
| iOS mínimo | 15.0 · solo iPhone · vertical |
| Android | minSdk 24 · targetSdk 36 |
| Versión inicial | 1.0.0 (build 1) |

## Qué incluye

- Splash e íconos generados desde `mobile/assets/` (`npm run mobile:assets`).
- Pantalla sin conexión empaquetada (`mobile/www/offline.html`) y aviso en vivo
  cuando se pierde la red.
- Barra de estado clara sobre fondo oscuro, safe areas (notch / barra de gestos)
  y edge-to-edge en Android 15+.
- Botón atrás de Android: regresa en pestañas internas y minimiza en Inicio o Login.
- Vibración háptica al cambiar de pestaña.
- La landing comercial se salta: la app abre directo en `/app/inicio` (o el login).
- Stripe Checkout se abre dentro de la app y el regreso vuelve a la misma sesión.
- **Eliminar cuenta** en Perfil (`DELETE /api/cuenta`) y página pública
  `/eliminar-cuenta`, requisitos de Apple (5.1.1(v)) y Google Play.
- Manifiesto de privacidad de iOS (`ios/App/App/PrivacyInfo.xcprivacy`), permisos
  de cámara y fotos con descripción, cifrado exento declarado.
- Sin banner de cookies dentro de la app (no hay analítica ni rastreo).

## 1. Desplegar el servidor (requisito)

La app carga una URL **https** pública. Producción corre en Vercel (deploy automático al hacer push a `main`) con
las variables de `.env.example`, y en producción:

- `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL` = `https://www.clubone.sbs`.
- `NEXT_PUBLIC_SUPPORT_EMAIL` = correo de soporte (aparece en `/eliminar-cuenta`).
- Webhook de Stripe apuntando a `https://TU-DOMINIO/api/webhooks/stripe`.

## 2. Apuntar la app al servidor

```bash
cp .env.mobile.example .env.mobile
# edita CAPACITOR_SERVER_URL="https://app.clubone.mx"
npm run mobile:release   # valida que sea https y sincroniza iOS y Android
```

`mobile:release` se debe correr **antes de cada build para las tiendas**: la URL
queda grabada en los proyectos nativos.

Para probar en simulador contra `npm run dev`:

```bash
echo 'CAPACITOR_SERVER_URL="http://localhost:3000"' > .env.mobile
npm run mobile:sync
# Android con dispositivo/emulador: adb reverse tcp:3000 tcp:3000
```

## 3. iOS → App Store

Requisitos: Mac con Xcode, cuenta de Apple Developer ($99 USD/año).

1. En [developer.apple.com](https://developer.apple.com/account/resources/identifiers)
   registra el App ID `mx.hutec.clubone`.
2. En [App Store Connect](https://appstoreconnect.apple.com) → Apps → **+** →
   nueva app con ese Bundle ID, idioma principal Español (México).
3. `npm run mobile:ios` abre Xcode. En **App → Signing & Capabilities** elige tu
   Team y deja "Automatically manage signing".
4. Destino **Any iOS Device (arm64)** → **Product → Archive** → **Distribute App →
   App Store Connect → Upload**.
5. En App Store Connect completa:
   - Capturas de iPhone 6.9" (1320×2868) y 6.5" (1284×2778).
   - Descripción, palabras clave, URL de soporte y
     **URL de privacidad**: `https://TU-DOMINIO/aviso-de-privacidad`.
   - **Privacidad de la app**: Nombre, Correo, Teléfono, ID de usuario, Contenido
     del usuario e Historial de compras → vinculados al usuario, uso
     "Funcionalidad de la app", **sin rastreo**.
   - Clasificación por edad (cuestionario) y categoría **Deportes**.
   - **Información para la revisión**: una cuenta demo de **tutor o jugador** con
     datos (equipo, eventos, mensualidades) y una nota:
     > Club One es una plataforma para clubes de fútbol. Los pagos son
     > mensualidades e inscripciones a entrenamientos y eventos presenciales
     > (servicios físicos, guía 3.1.3(e)), procesados con Stripe. La cuenta se
     > elimina en Perfil → Eliminar mi cuenta.
6. Envía a revisión (TestFlight primero si quieres probar con tu equipo).

Versiones siguientes: sube `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` en
Xcode (General → Identity) antes de archivar.

## 4. Android → Google Play

Requisitos: cuenta de Google Play Console ($25 USD, pago único).

1. Crea la llave de subida **una sola vez** y guárdala en un lugar seguro
   (si se pierde, hay que pedir a Google que la restablezca):
   ```bash
   cd android
   keytool -genkeypair -v -keystore clubone-upload.jks -alias clubone \
     -keyalg RSA -keysize 2048 -validity 10000
   cp keystore.properties.example keystore.properties   # y pon las contraseñas
   ```
   `keystore.properties` y `*.jks` están en `.gitignore`.
2. Compila el bundle firmado:
   ```bash
   npm run mobile:release
   cd android && ./gradlew bundleRelease
   # → android/app/build/outputs/bundle/release/app-release.aab
   ```
   (o en Android Studio: `npm run mobile:android` → Build → Generate Signed Bundle).
3. En [Play Console](https://play.google.com/console) → Crear app → sube el
   `.aab` a **Prueba interna**, acepta Play App Signing.
4. Completa la ficha y las declaraciones:
   - Ícono 512×512 (`mobile/assets/icon-only.png` reducido), gráfico destacado
     1024×500 y al menos 2 capturas de teléfono.
   - **Política de privacidad**: `https://TU-DOMINIO/aviso-de-privacidad`.
   - **Eliminación de cuentas**: `https://TU-DOMINIO/eliminar-cuenta`.
   - **Seguridad de los datos**: mismos datos que en iOS, cifrados en tránsito,
     el usuario puede pedir su eliminación, no se comparten con terceros para
     publicidad.
   - Acceso a la app: credenciales de la cuenta demo.
   - Público objetivo: adultos (tutores, entrenadores y administradores). Si
     jugadores menores usan sus propias cuentas, revisa la política de Familias.
   - Las cuentas personales nuevas de Play deben correr una **prueba cerrada con
     al menos 12 testers durante 14 días** antes de pasar a producción.
5. Versiones siguientes: incrementa `versionCode` (y `versionName`) en
   `android/app/build.gradle`.

## Cuándo hay que volver a publicar

| Cambio | ¿Nueva versión en tiendas? |
|---|---|
| Pantallas, estilos, API, base de datos | No, basta el deploy web |
| Dominio del servidor (`CAPACITOR_SERVER_URL`) | Sí |
| Ícono, splash, permisos, plugins nativos, `capacitor.config.ts` | Sí |

Después de cambiar ícono o splash: `npm run mobile:assets && npm run mobile:release`.

## Pendientes recomendados

- **Notificaciones push** (recordatorios de pago, convocatorias): requiere un
  proyecto de Firebase (`google-services.json`) y una llave APNs de Apple; se
  agrega con `@capacitor/push-notifications`.
- **Universal Links / App Links** para que los correos de activación abran la app:
  requiere el Team ID de Apple y la huella SHA-256 de Play App Signing.
