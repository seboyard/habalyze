-- NO APLICAR TODAVÍA.
-- El cliente (purchaseItem, recompensas de hábitos y la prueba premium) sigue
-- escribiendo coins, gems, level e is_premium dentro de profiles.data.
-- Si se cierra esa escritura antes de cambiar el cliente, la tienda y el premium dejan de funcionar.
--
-- Este archivo aborta a propósito. El SQL de después del error es el diseño del
-- siguiente paso, para copiarlo a una migración nueva cuando el cliente ya llame al RPC.

do $$
begin
  raise exception 'NO APLICAR: el cliente todavía escribe monedas en profiles.data';
end
$$;

-- 1. Wrapper público, security invoker. La función privilegiada se queda en private.
-- create or replace function public.spend_coins(p_amount integer, p_reason text)
-- returns integer
-- language sql
-- security invoker
-- set search_path = ''
-- as $$ select private.spend_coins(p_amount, p_reason); $$;
-- revoke all on function public.spend_coins(integer, text) from public, anon;
-- grant execute on function public.spend_coins(integer, text) to authenticated;

-- 2. La compra de tienda tiene que hacerse en private, en una sola transacción:
--    leer shop_items.price, comprobar dueño, llamar a spend_coins y añadir el item
--    a data.owned_shop_items. El navegador no calcula el precio.
-- 3. Las recompensas de hábitos tienen que llamar a private.grant_coins desde una
--    Edge Function con service role, no desde el navegador.
-- 4. Solo entonces se puede rechazar un update de profiles cuyo data->coins,
--    data->gems, data->level, data->experience o data->is_premium cambie
--    respecto a la fila anterior, salvo private.is_admin().
