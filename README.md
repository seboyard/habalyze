# Habalyze

Aplicación en español para hábitos, objetivos y caminos, con XP, monedas, avatar y coach.

## Arrancar en local, sin servicios

```bash
npm install
npm run dev
```

Por defecto `VITE_DATA_ADAPTER=local`. En la portada, **Probar en local**, correo `demo.local@habalyze.app`, sin contraseña. Los datos viven en el navegador.

```bash
npm run build
```

## Arrancar contra Supabase

El proyecto `habalyze` ya existe. No hace falta crearlo y **no subas claves al repo**.

1. En el SQL Editor del proyecto, pega y ejecuta `supabase/schema.sql` (es el mismo SQL que `supabase/migrations/20261112054221_habalyze_schema.sql`).
2. Copia `.env.example` a `.env` y rellena solo en tu máquina:

```bash
VITE_DATA_ADAPTER=supabase
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<clave anónima o publishable>
```

3. `npm run dev`. La pantalla de entrada pide correo y contraseña, y también puede enviar un enlace mágico.
4. En el panel de Auth de Supabase, añade la URL local (`http://localhost:5173`) y la de Vercel a **Site URL** y **Redirect URLs**, si no el enlace mágico no vuelve a la app.
5. Para abrir el panel de administración, después del primer registro:

```sql
insert into public.user_roles (user_id, role)
values ('UUID-DEL-USUARIO', 'admin')
on conflict (user_id) do update set role = 'admin';
```

El rol vive en `user_roles`, no en `user_metadata`.

Si faltan la URL o la clave, aunque pongas `VITE_DATA_ADAPTER=supabase`, la app sigue en el adaptador local.

## Vercel

`vercel.json` reescribe las rutas del cliente a `index.html` para que `/dashboard` y el resto no den 404. El proyecto de Vercel ya está creado. Las variables `VITE_DATA_ADAPTER`, `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se configuran allí, no en git. La integración de GitHub puede seguir sin enlazarse: el primer despliegue hay que lanzarlo a mano. Producción debe quedar pública; la protección de los previews se ajusta en el panel de Vercel.

## Qué falta fuera de este cliente

PayPal, Telegram, el correo real y un modelo de IA siguen sin Edge Functions. El cliente responde con un error claro o, en el coach y las sugerencias de hábitos, con texto local. El detalle está en `docs/ADAPTADOR_DATOS.md`.

## Avatar

Capas Neo Pixel Cozy en `public/assets/neo_pixel_cozy/v1/`. Huecos: `docs/AVATARES_NEO_PIXEL_COZY.md`.
