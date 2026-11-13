# Tareas para otros agentes

Cada tarea es un PR aparte, desde `main`. No mezclar dominios. No aplicar SQL de producción. No desplegar.

## Monedas en el servidor

El cliente todavía resta y suma `profiles.data.coins`. En la base ya puede existir `private.spend_coins` (solo resta) y `private.grant_coins` (nadie del navegador puede llamarla). El archivo `supabase/next/bloquear_monedas_cliente.sql` aborta a propósito.

Hacer en este orden:

1. Edge Function o RPC público `security invoker` que compre un `shop_items.item_id` al precio de la fila y llame a `private.spend_coins`.
2. Cambiar `purchaseItem` y `purchasePack` en `src/api/supabase/createSupabaseAdapter.js` para usar ese RPC.
3. Pasar las recompensas de hábitos a `private.grant_coins` desde una función de servidor.
4. Solo entonces aplicar una política que rechace cambios de `coins`, `gems`, `level`, `experience` e `is_premium` hechos por el usuario.

## PayPal

`createPayPalSubscription` responde que no hay cobro. Hace falta una Edge Function, el webhook, y no guardar secretos en el repo. El premium no puede bloquear el registro de hábitos.

## Correo de verdad

Los envíos (`sendWelcomeEmail`, resumen semanal, reactivación) están apagados a propósito. Conectar un proveedor desde una Edge Function.

## Telegram

`linkTelegramAccount` y el webhook no están desplegados. Mismo criterio: secreto fuera del repo, función en el servidor.

## Coach con un modelo real

`invokeLlm` usa texto local en `src/api/supabase/localIntelligence.js`. Sustituirlo por un proveedor sin meter la clave en el cliente.

## URLs de Auth

En el panel de Supabase, el redirect del proyecto tiene que incluir el origen de producción `https://habalyze.vercel.app` y el de la preview. El cliente ya manda `emailRedirectTo` hacia `/login`. No hace falta una clave nueva en git.

## Columnas en lectura

Tras aplicar `supabase/migrations/20261112062556_columnas_core.sql`, las columnas core se rellenan solas desde `data`. Un PR posterior puede leer `habits.name` o `habit_logs.completed_date` en vez de filtrar solo en memoria. No cambies el contrato del cliente hasta que esa migración esté aplicada en el proyecto `habalyze`.

## Avatar, más adelante

Fotogramas `idle`, `celebrate`, `tired`, `walk` y `blink`, cada uno en su carpeta y con el mismo rig. Primer plano de escenario, separado. Alas, tatuaje y piercing solo si se dibujan en 96×128 con las anclas; si no, se quedan en `gaps`.
