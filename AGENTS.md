# Habalyze — guía para agentes

Habalyze es una app de hábitos en español. El cliente es Vite y React. La producción está en https://habalyze.vercel.app con `VITE_DATA_ADAPTER=supabase`. Este archivo es la guía de a bordo: léelo antes de tocar código.

No despliegues producción. No hagas merge. No pegues claves, URLs con la anon key real, ni valores de `.env`.

## Cómo correrla

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_DATA_ADAPTER=local` guarda una demo en el navegador (Lina, `demo.local@habalyze.app`). No hace falta Supabase.

`VITE_DATA_ADAPTER=supabase` usa Auth y Postgres. `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se rellenan solo en el entorno local o en Vercel. Si faltan, la app vuelve a local. La anon key de producción ya está en Vercel: no la copies al repo.

Comandos:

- `npm run build` — tiene que pasar.
- `npm run lint` — el aviso de lint no sustituye al build.
- `python3 scripts/generate_neo_pixel_cozy.py` — regenera los PNG y el manifest.

## Mapa y dueños

Un PR, un dominio. Parte siempre de `main`.

| Dominio | Rutas | No tocar a la vez |
|---|---|---|
| Avatar | `src/components/avatar/`, `src/pages/Avatar.jsx`, `src/avatar/neoPixelManifest.json`, `public/assets/neo_pixel_cozy/`, `scripts/generate_neo_pixel_cozy.py` | Tienda, si el cambio también reescribe el catálogo |
| Datos | `src/api/` | Migraciones, si el cambio exige columnas nuevas |
| Tienda | `src/pages/Shop.jsx`, `src/components/shop/`, `src/components/common/shopConstants.jsx` | Avatar |
| Social | `src/pages/Social.jsx`, `src/components/social/` | Auth |
| Auth y UI | `src/pages/Login.jsx`, `src/Layout.jsx`, `src/pages/Landing.jsx`, `src/components/ui/` | Social |
| SQL | `supabase/migrations/`, `supabase/apply/`, `supabase/next/` | El adaptador, hasta que la migración esté aplicada |

La UI visible (hábitos, metas, caminos, premium, perfil) puede acompañar a Auth y UI si el cambio es de presentación. Un cambio de esquema no va en el mismo PR que un redibujado del avatar.

## Avatar

El canon corto está en `docs/CANON_NEO_PIXEL_COZY.md`. Los cinco personajes son Brasa, Vek, Mora, Nix y Lumo. Hay cuatro rigs: `humanoid_standard`, `humanoid_wide`, `humanoid_tall`, `humanoid_seated`.

Para añadir una pieza:

1. Dibuja en `scripts/generate_neo_pixel_cozy.py` con píxeles enteros y alpha 0 o 255.
2. Ejecuta el script. Cada capa de ropa sale en 96×128 para cada rig, ya colocada en las anclas.
3. El manifest se reescribe solo. La tienda local sale de ese manifest.
4. Si la pieza no cabe en el canon, añádela a `gaps` del manifest. No subas un PNG de otro tamaño ni un recorte con halo.

`avatar_config.engine = "legacy"` usa el avatar dibujado de `PixelAvatar.jsx`. El vestidor tiene el botón «Avatar anterior». El valor por defecto es `neo`.

## Tablas

La base viva (`habalyze`, ref `byyzkxhecszuocjovmas`, sa-east-1) ya tiene el esquema de los PR 1 y 2: 44 tablas con RLS, catálogo, bucket `uploads` y los triggers de `profiles` y `user_roles`. No ejecutes `supabase/schema.sql` otra vez. No borres tablas ni datos.

Para una tabla nueva:

1. `npx supabase migration new nombre_corto`
2. RLS activado, políticas que coincidan con el acceso real, `security invoker` en las vistas.
3. Funciones con `security definer` solo en `private`.
4. El rol de admin se lee de `user_roles`, nunca de `user_metadata`.
5. Deja el SQL en el repo. Lo aplica Seb. No uses el MCP contra producción para escribir.

La migración `20261112062556_columnas_core.sql` (copia lista en `supabase/apply/`) añade columnas a perfiles, hábitos, registros, metas, tienda y amistades, y las rellena desde `data`. El cliente puede seguir igual. El archivo de `supabase/next/` no se aplica todavía.

## Qué ya está en producción

- App en Vercel, adaptador Supabase, variables ya configuradas.
- Esquema y catálogo iniciales aplicados.
- Las columnas core de esta rama todavía no, hasta que se aplique el SQL nuevo.
- PayPal, Telegram, correo real y el coach con modelo externo no están conectados. El detalle está en `docs/TAREAS.md`.

## Ramas

Nombre `cursor/<dominio-corto>-...` cuando el trabajo sale de un agente en la nube. Descripción del PR en español. Sin secretos en el diff: busca `.env` con valores, `service_role` y claves `sb_secret_` antes de hacer commit.
