import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { badge_id, progress_value } = await req.json();
    
    // Get badge definition
    const badges = await db.entities.Badge.filter({ badge_id });
    if (badges.length === 0) {
      return Response.json({ error: 'Badge no encontrado' }, { status: 404 });
    }
    
    const badge = badges[0];
    const levels = badge.levels || [];
    
    // Get user's current badge progress
    const userBadges = await db.entities.UserBadge.filter({
      user_email: user.email,
      badge_id: badge_id
    });
    
    // Calculate new level based on progress
    let newLevel = 1;
    for (let i = 0; i < levels.length; i++) {
      if (progress_value >= levels[i].requirement_value) {
        newLevel = levels[i].level;
      }
    }
    
    const oldLevel = userBadges.length > 0 ? (userBadges[0].current_level || 1) : 0;
    const leveledUp = newLevel > oldLevel;
    
    if (userBadges.length === 0) {
      // Create new badge
      await db.entities.UserBadge.create({
        user_email: user.email,
        badge_id: badge_id,
        current_level: newLevel,
        current_progress: progress_value,
        unlocked_date: new Date().toISOString()
      });
      
      return Response.json({
        success: true,
        badge_name: badge.name,
        badge_icon: badge.icon,
        level: newLevel,
        leveled_up: true,
        newly_unlocked: true
      });
    } else {
      // Update existing badge
      await db.asServiceRole.entities.UserBadge.update(userBadges[0].id, {
        current_progress: progress_value,
        current_level: newLevel
      });
      
      return Response.json({
        success: true,
        badge_name: badge.name,
        badge_icon: badge.icon,
        level: newLevel,
        leveled_up: leveledUp,
        newly_unlocked: false
      });
    }
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});