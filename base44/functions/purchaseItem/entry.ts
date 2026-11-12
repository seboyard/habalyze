import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { item_id, custom_color, use_gems = false } = await req.json();
    
    // Get item
    const items = await db.entities.ShopItem.filter({ item_id });
    if (items.length === 0) {
      return Response.json({ error: 'Item no encontrado' }, { status: 404 });
    }
    
    const item = items[0];
    
    // Check if already owned
    const ownedItems = user.owned_items || [];
    if (ownedItems.includes(item_id)) {
      return Response.json({ error: 'Ya posees este item' }, { status: 400 });
    }
    
    // Check unlock requirements
    if (item.unlock_requirement && item.unlock_requirement.type !== 'none') {
      const { type, value } = item.unlock_requirement;
      let unlocked = false;
      
      switch (type) {
        case 'level':
          unlocked = (user.level || 1) >= parseInt(value);
          break;
        case 'streak':
          unlocked = (user.best_streak || 0) >= parseInt(value);
          break;
        case 'badge':
          const badges = await db.entities.UserBadge.filter({ 
            user_email: user.email, 
            badge_id: value 
          });
          unlocked = badges.length > 0;
          break;
        case 'achievement':
          const achievements = await db.entities.UserAchievement.filter({ 
            user_email: user.email, 
            achievement_id: value 
          });
          unlocked = achievements.length > 0;
          break;
        default:
          unlocked = true;
      }
      
      if (!unlocked) {
        return Response.json({ error: 'Item bloqueado', message: 'No cumples los requisitos' }, { status: 403 });
      }
    }
    
    // Check currency and deduct
    const price = use_gems ? (item.gem_price || item.price * 10) : item.price;
    const currencyField = use_gems ? 'gems' : 'coins';
    const currentAmount = user[currencyField] || 0;
    
    if (currentAmount < price) {
      return Response.json({ 
        error: 'Fondos insuficientes', 
        needed: price - currentAmount,
        currency: use_gems ? 'gems' : 'coins'
      }, { status: 400 });
    }
    
    // Process purchase
    const newAmount = currentAmount - price;
    const newOwnedItems = [...ownedItems, item_id];
    const purchasedColors = { 
      ...(user.purchased_colors || {}), 
      [item_id]: custom_color || item.color 
    };
    
    await db.asServiceRole.auth.updateUser(user.id, {
      [currencyField]: newAmount,
      owned_items: newOwnedItems,
      purchased_colors: purchasedColors
    });
    
    // Update sales count
    await db.asServiceRole.entities.ShopItem.update(item.id, {
      sales_count: (item.sales_count || 0) + 1
    });
    
    // Update Coleccionista badge
    const ownedCount = newOwnedItems.length;
    const collectorBadges = await db.entities.UserBadge.filter({ 
      user_email: user.email, 
      badge_id: 'coleccionista' 
    });
    const collectorThresholds = [5, 10, 20, 30, 40, 50, 60, 70, 80, 100];
    let collectorLevel = 0;
    for (let i = 0; i < collectorThresholds.length; i++) {
      if (ownedCount >= collectorThresholds[i]) collectorLevel = i + 1;
    }
    
    if (collectorLevel > 0) {
      if (collectorBadges.length === 0) {
        await db.entities.UserBadge.create({
          user_email: user.email,
          badge_id: 'coleccionista',
          current_level: collectorLevel,
          current_progress: ownedCount,
          unlocked_date: new Date().toISOString()
        });
      } else {
        await db.asServiceRole.entities.UserBadge.update(collectorBadges[0].id, {
          current_progress: ownedCount,
          current_level: collectorLevel
        });
      }
    }
    
    return Response.json({
      success: true,
      item_name: item.name,
      remaining_coins: use_gems ? user.coins : newAmount,
      remaining_gems: use_gems ? newAmount : user.gems
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});