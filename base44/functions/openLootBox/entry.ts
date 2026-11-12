import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { box_id, use_gems = false } = await req.json();
    
    // Get box
    const boxes = await db.entities.LootBox.filter({ box_id, is_available: true });
    if (boxes.length === 0) {
      return Response.json({ error: 'Caja no encontrada' }, { status: 404 });
    }
    
    const box = boxes[0];
    
    // Check currency
    const price = use_gems ? (box.gem_price || box.price * 10) : box.price;
    const currencyField = use_gems ? 'gems' : 'coins';
    const currentAmount = user[currencyField] || 0;
    
    if (currentAmount < price) {
      return Response.json({ 
        error: 'Fondos insuficientes',
        needed: price - currentAmount,
        currency: currencyField
      }, { status: 400 });
    }
    
    // Get all available items
    const allItems = await db.entities.ShopItem.filter({ is_available: true });
    const ownedItems = user.owned_items || [];
    
    // Filter by rarity and not owned
    const eligibleItems = allItems.filter(item => 
      box.possible_rarities.includes(item.rarity) && !ownedItems.includes(item.item_id)
    );
    
    if (eligibleItems.length === 0) {
      return Response.json({ error: 'No hay items disponibles en esta caja' }, { status: 400 });
    }
    
    // Select random items
    const selectedItems = [];
    for (let i = 0; i < box.item_count; i++) {
      if (box.guaranteed_legendary && i === 0) {
        const legendaryItems = eligibleItems.filter(item => 
          ['legendary', 'exclusive'].includes(item.rarity)
        );
        if (legendaryItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * legendaryItems.length);
          selectedItems.push(legendaryItems[randomIndex]);
          eligibleItems.splice(eligibleItems.indexOf(legendaryItems[randomIndex]), 1);
        }
      } else if (eligibleItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligibleItems.length);
        selectedItems.push(eligibleItems[randomIndex]);
        eligibleItems.splice(randomIndex, 1);
      }
    }
    
    // Update user
    const newAmount = currentAmount - price;
    const newOwnedItems = [...new Set([...ownedItems, ...selectedItems.map(i => i.item_id)])];
    const newLootboxCount = (user.lootboxes_opened || 0) + 1;
    
    await db.asServiceRole.auth.updateUser(user.id, {
      [currencyField]: newAmount,
      owned_items: newOwnedItems,
      lootboxes_opened: newLootboxCount
    });
    
    // Update badges via centralized function
    await Promise.all([
      db.functions.invoke('updateBadgeProgress', {
        badge_id: 'caja_sorpresa',
        progress_value: newLootboxCount
      }),
      db.functions.invoke('updateBadgeProgress', {
        badge_id: 'coleccionista',
        progress_value: newOwnedItems.length
      })
    ]);
    
    return Response.json({
      success: true,
      items: selectedItems.map(item => ({
        item_id: item.item_id,
        name: item.name,
        icon: item.icon,
        rarity: item.rarity
      })),
      remaining_coins: use_gems ? user.coins : newAmount,
      remaining_gems: use_gems ? newAmount : user.gems
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});