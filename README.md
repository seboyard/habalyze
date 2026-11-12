# Habalyze

Aplicación en español para hábitos, objetivos y caminos, con XP, monedas, avatar, comunidad y un coach. Esta rama se puede desarrollar **sin Base44**: los datos viven en el navegador.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (normalmente `http://localhost:5173`).

1. En la portada pulsa **Probar en local**.
2. Entra con `demo.local@habalyze.app`. No hay contraseña: la sesión es local.
3. Si quieres vaciar la demo, en esa pantalla está **Restablecer datos de demostración**.

Comprobar que compila:

```bash
npm run build
```

Copia `.env.example` a `.env` solo si vas a cambiar el adaptador. No pongas secretos en el repositorio.

## Datos

Por defecto `VITE_DATA_ADAPTER=local`. El cliente sigue exponiendo `db.auth`, `db.entities`, `db.functions`, `db.integrations` y `db.agents`, que es la superficie que ya usaba la interfaz.

- **Local:** `localStorage` (`habalyze.local.v1`), con hábitos, tienda y amigos de demostración.
- **Supabase:** el archivo `src/api/adapters/supabaseAdapter.js` describe el contrato, pero no crea un proyecto ni se conecta. Si faltan las claves, la app sigue en local.

El detalle de lo que aún depende de Base44 está en `docs/ADAPTADOR_DATOS.md`.

## Avatar

El vestidor usa capas **Neo Pixel Cozy** (ficha aprobada). Los PNG curados están en `public/assets/neo_pixel_cozy/v1/` y el mapa en `src/avatar/neoPixelManifest.json`. Para regenerarlos hace falta el pack original y Pillow:

```bash
python3 scripts/normalize_neo_pixel_assets.py
```

Huecos conocidos: `docs/AVATARES_NEO_PIXEL_COZY.md`.

Para volver al avatar dibujado en código, guarda `avatar_config.engine = "legacy"`.
