# Adaptador de datos

El export de Base44 llegó dañado: `vite.config.js` llamaba a `base44()` sin importarlo, `index.html` y `public/manifest.json` tenían un stub de JavaScript delante del contenido, las URLs de iconos apuntaban a `db.com`, y cada pantalla que usaba el SDK empezaba con un `db` falso que devolvía listas vacías. No había un `base44Client` real.

## Qué reemplaza este árbol

| Pieza | Antes | Ahora |
| --- | --- | --- |
| Auth, entidades, funciones, correo, subida, coach | Base44 en runtime | `src/api/local/createLocalDb.js` |
| Build | plugin `@base44/vite-plugin` | Vite + alias `@` |
| Sesión | token de Base44 | `sessionUserId` en `localStorage` |
| Coach | agente `habit_coach` | respuestas locales a partir de los hábitos guardados |
| Sugerencias de hábitos | `InvokeLLM` | plantillas en español según el texto |
| PayPal | `createPayPalSubscription` | simulación de 30 días, sin cobro |
| Telegram, WhatsApp, email, SMS | funciones Deno | se anotan en local y no se envían |
| Cofre | caja aleatoria de pago | siguiente pieza de la colección, en orden fijo y gratis |

La UI sigue llamando a `db.*`. Cambiar de adaptador es sustituir el objeto que exporta `src/api/base44Client.js`.

## Qué sigue dependiendo de Base44 (o de un backend propio)

Las funciones en `base44/functions/` conservan el código Deno original (`npm:@base44/sdk`) y **no se ejecutan** en local. Hace falta un servidor para:

- PayPal real (`createPayPalSubscription`, `paypalWebhook`)
- Bot de Telegram y recordatorios
- Correo de bienvenida, reactivación y resumen semanal
- Un modelo de IA de verdad para el coach y para `InvokeLLM`
- Imágenes generadas y subida de archivos a un almacenamiento compartido
- OAuth (`src/pages/OAuthConsent.jsx` sigue siendo la pantalla de Base44)

Supabase encaja como siguiente paso: Auth para la sesión, una tabla por entidad de `base44/entities/`, Storage para fotos y Edge Functions para PayPal y Telegram. El esqueleto está en `src/api/adapters/supabaseAdapter.js`. No hay proyecto creado.

## Cuentas

No hay contraseñas en el repo. La demo local es `demo.local@habalyze.app` y tiene rol `admin` solo para poder abrir el panel dentro de la simulación.
