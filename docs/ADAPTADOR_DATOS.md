# Adaptador de datos

La interfaz sigue llamando a `db.*`. `src/api/base44Client.js` elige el adaptador con `VITE_DATA_ADAPTER`.

| Valor | Qué hace |
| --- | --- |
| `local` (por defecto) | `localStorage`. Demo sin contraseña. |
| `supabase` con URL y clave anónima | Auth, tablas y Storage del proyecto ya creado. |
| `supabase` sin esas variables | Vuelve a local y lo avisa en consola. |

No hace falta la clave `service_role` en el navegador. No la pongas en Vercel como variable `VITE_`.

## Contrato que cubre Supabase

- `auth.me`, `isAuthenticated`, `updateMe`, `logout`, `redirectToLogin`
- `auth.signInWithPassword`, `signUp`, `signInWithOtp` (correo + contraseña y enlace mágico)
- `entities.<Nombre>.filter / list / get / create / update / delete`
- `functions.invoke` para compras, cofre, listado de personas, insignias y progreso semanal
- `integrations.Core.UploadFile` al bucket público `uploads`, carpeta `<uid>/…`
- `agents` del coach en `coach_conversations`, con Realtime si la publicación existe

`me()` toma el rol de `public.user_roles`. Aunque alguien escriba `role` dentro del JSON del perfil, no sirve para entrar al panel de admin.

## Esquema

Una tabla por entidad de `base44/entities/`, más `profiles`, `user_roles` y `coach_conversations`. El documento de cada fila va en `data jsonb`. `owner_id` apunta a `auth.users`.

RLS está activo en todas las tablas públicas de este esquema:

- Hábitos, registros, metas, preferencias y caminos: los lee y los cambia quien los creó. Un amigo aceptado puede leer hábitos. Un colaborador puede leer el camino y sus tareas.
- Perfiles: cualquier sesión puede leerlos (la app social lista personas). Solo actualizas el tuyo, y no puedes cambiar el correo de la fila.
- Catálogo (tienda, insignias, blog, plantillas): lectura pública. Escritura solo si `user_roles.role = 'admin'`.
- Notificaciones, amistades, regalos y solicitudes: las ven los dos correos implicados.
- Las funciones `private.is_admin`, `private.is_friend_email` y `private.can_read_project` son `security definer` y no están en un esquema expuesto. No se usa `user_metadata` para autorizar. Cada `UPDATE` tiene también política de `SELECT`.

Para aplicarlo en el proyecto vivo, ejecuta una sola vez `supabase/schema.sql` en el SQL Editor. El mismo texto está en la migración `supabase/migrations/20261112054221_habalyze_schema.sql`.

Fotos: bucket `uploads`, público para lectura, y solo la persona dueña puede insertar, reemplazar o borrar objetos dentro de su carpeta. Reemplazar un archivo pide las tres políticas (insert, select, update); están las tres.

## Qué está vivo y qué no

Vivo en el cliente, contra Postgres y Auth:

- Registro, entrada, enlace mágico y sesión
- Hábitos, caminos, tienda, cofre determinista, vestidor, subida de imágenes
- Coach y sugerencias con reglas locales (no hay modelo)

Sigue haciendo falta una Edge Function, y el cliente falla con un mensaje claro en vez de simular el cobro:

- PayPal (`createPayPalSubscription`, `paypalWebhook`)
- Telegram y recordatorios
- Correo de bienvenida, reactivación y resumen
- Un LLM de verdad para `InvokeLLM` y el coach
- Integridad fuerte de monedas: hoy la sesión escribe su propio saldo, igual que hacía la app. Un trigger o una función de servidor tendría que ser el siguiente paso si el saldo no puede fiarse del navegador

Las monedas iniciales (80) y el avatar Lumo los crea el trigger `private.handle_new_user` al registrarse. El nombre que se escribe en el alta se copia a `profiles.data` solo como etiqueta visible.
