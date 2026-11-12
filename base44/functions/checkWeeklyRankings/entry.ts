import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { startOfWeek, format } from 'npm:date-fns';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users
    const usersResponse = await db.asServiceRole.functions.invoke('listAllUsers');
    const users = usersResponse.data.users || [];
    
    // Get current week start
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    // Get all friendships
    const friendships = await db.asServiceRole.entities.Friendship.list();
    
    // Calculate weekly XP for each user
    const weeklyStats = [];
    for (const user of users) {
      const logs = await db.asServiceRole.entities.HabitLog.filter({
        created_by: user.email
      });
      
      const thisWeekLogs = logs.filter(log => log.completed_date >= weekStart);
      const weeklyXP = thisWeekLogs.length * 10; // 10 XP per habit completion
      
      weeklyStats.push({
        user_email: user.email,
        user_name: user.full_name,
        weekly_xp: weeklyXP
      });
    }
    
    // Sort by weekly XP
    weeklyStats.sort((a, b) => b.weekly_xp - a.weekly_xp);
    
    // Get previous rankings
    const previousRankings = await db.asServiceRole.entities.WeeklyRanking.filter({
      week_start: weekStart
    });
    
    // Check for rank changes among friends
    for (let i = 0; i < weeklyStats.length; i++) {
      const currentStat = weeklyStats[i];
      const currentRank = i + 1;
      
      // Find previous rank
      const prevRanking = previousRankings.find(r => r.user_email === currentStat.user_email);
      const previousRank = prevRanking?.rank_position || 999;
      
      // Save/update current ranking
      if (prevRanking) {
        await db.asServiceRole.entities.WeeklyRanking.update(prevRanking.id, {
          xp_earned: currentStat.weekly_xp,
          rank_position: currentRank,
          previous_rank: previousRank
        });
      } else {
        await db.asServiceRole.entities.WeeklyRanking.create({
          user_email: currentStat.user_email,
          week_start: weekStart,
          xp_earned: currentStat.weekly_xp,
          rank_position: currentRank,
          previous_rank: previousRank
        });
      }
      
      // Check if this user surpassed any friends
      if (currentRank < previousRank) {
        const userFriendships = friendships.filter(f => 
          f.user1_email === currentStat.user_email || f.user2_email === currentStat.user_email
        );
        
        for (const friendship of userFriendships) {
          const friendEmail = friendship.user1_email === currentStat.user_email 
            ? friendship.user2_email 
            : friendship.user1_email;
          
          const friendStat = weeklyStats.find(s => s.user_email === friendEmail);
          if (friendStat) {
            const friendRank = weeklyStats.indexOf(friendStat) + 1;
            
            // If user surpassed this friend
            if (currentRank < friendRank && previousRank >= friendRank) {
              // Create activity notification for the friend
              await db.asServiceRole.entities.FriendActivity.create({
                user_email: currentStat.user_email,
                user_name: currentStat.user_name,
                activity_type: 'ranking_surpassed',
                title: `¡${currentStat.user_name} te superó en el ranking!`,
                description: `Ahora está en el puesto #${currentRank} con ${currentStat.weekly_xp} XP esta semana`,
                icon: '📈',
                metadata: {
                  current_rank: currentRank,
                  weekly_xp: currentStat.weekly_xp,
                  friend_email: friendEmail
                }
              });
              
              // Create notification for the friend
              await db.asServiceRole.entities.Notification.create({
                user_email: friendEmail,
                type: 'friend_activity',
                title: '¡Te superaron en el ranking!',
                message: `${currentStat.user_name} ahora está por encima de ti en el ranking semanal (#${currentRank})`,
                icon: '📈'
              });
            }
          }
        }
      }
    }
    
    return Response.json({ 
      success: true, 
      message: 'Rankings actualizados',
      rankings: weeklyStats.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Error checking rankings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});