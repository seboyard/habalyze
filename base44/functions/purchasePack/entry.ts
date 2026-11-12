import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pack_id, use_gems = false } = await req.json();
    
    // Get pack
    const packs = await db.entities.ShopPack.filter({ pack_id, is_available: true });
    if (packs.length === 0) {
      return Response.json({ error: 'Pack no encontrado' }, { status: 404 });
    }
    
    const pack = packs[0];
    
    // Check if all items are already owned
    const ownedItems = user.owned_items || [];
    const alreadyOwned = pack.item_ids.filter(id => ownedItems.includes(id));
    if (alreadyOwned.length === pack.item_ids.length) {
      return Response.json({ error: 'Ya posees todos los items de este pack' }, { status: 400 });
    }
    
    // Check currency
    const price = use_gems ? (pack.gem_price || pack.discount_price * 10) : pack.discount_price;
    const currencyField = use_gems ? 'gems' : 'coins';
    const currentAmount = user[currencyField] || 0;
    
    if (currentAmount < price) {
      return Response.json({ 
        error: 'Fondos insuficientes',
        needed: price - currentAmount,
        currency: currencyField
      }, { status: 400 });
    }
    
    // Process purchase
    const newAmount = currentAmount - price;
    const newOwnedItems = [...new Set([...ownedItems, ...pack.item_ids])];
    const savings = pack.original_price - pack.discount_price;
    
    await db.asServiceRole.auth.updateUser(user.id, {
      [currencyField]: newAmount,
      owned_items: newOwnedItems
    });
    
    // Update sales count for all items in pack
    for (const itemId of pack.item_ids) {
      const items = await db.entities.ShopItem.filter({ item_id: itemId });
      if (items.length > 0) {
        await db.asServiceRole.entities.ShopItem.update(items[0].id, {
          sales_count: (items[0].sales_count || 0) + 1
        });
      }
    }
    
    // Update Coleccionista badge via centralized function
    await db.functions.invoke('updateBadgeProgress', {
      badge_id: 'coleccionista',
      progress_value: newOwnedItems.length
    });
    
    return Response.json({
      success: true,
      pack_name: pack.name,
      items_count: pack.item_ids.length,
      savings: savings,
      remaining_coins: use_gems ? user.coins : newAmount,
      remaining_gems: use_gems ? newAmount : user.gems
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});