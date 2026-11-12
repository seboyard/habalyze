import { db } from '@/api/base44Client';

import { REWARDS, getStreakBonus, calculateLevel } from '@/components/common/constants';

// Completa un hábito desde el Coach flotante.
// Replica la parte esencial del flujo del Dashboard: registro, racha, XP, monedas y nivel.
export async function completeHabit({ habit, user, date, scheduledTime = null }) {
  await db.entities.HabitLog.create({
    habit_id: habit.id,
    completed_date: date,
    scheduled_time: scheduledTime,
  });

  const oldStreak = habit.current_streak || 0;
  const newStreak = oldStreak + 1;
  const newBestStreak = Math.max(habit.best_streak || 0, newStreak);

  await db.entities.Habit.update(habit.id, {
    current_streak: newStreak,
    best_streak: newBestStreak,
    total_completions: (habit.total_completions || 0) + 1,
    last_completed: date,
  });

  const xpGain = REWARDS.HABIT_XP_BASE + Math.floor(newStreak / 7) * REWARDS.HABIT_XP_STREAK_BONUS;
  const newXP = (user?.experience || 0) + xpGain;
  const newLevel = calculateLevel(newXP);

  const streakBonus = getStreakBonus(newStreak);
  const coinBonus = streakBonus ? streakBonus.coins : 0;

  const bpXPGain = Math.floor(xpGain * REWARDS.BP_XP_MULTIPLIER);
  const newBPXP = (user?.battle_pass_xp || 0) + bpXPGain;
  const newBPTier = Math.floor(newBPXP / REWARDS.BP_XP_PER_TIER);

  await db.auth.updateMe({
    experience: newXP,
    level: newLevel,
    coins: (user?.coins || 0) + coinBonus,
    battle_pass_xp: newBPXP,
    battle_pass_tier: Math.max(user?.battle_pass_tier || 0, newBPTier),
  });

  return {
    newStreak,
    xpGain,
    coinBonus,
    bonusMessage: streakBonus ? streakBonus.message : null,
    leveledUp: newLevel > (user?.level || 1),
  };
}