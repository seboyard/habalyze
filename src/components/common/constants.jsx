// Page constants
export const PAGES = {
  LANDING: 'Landing',
  DASHBOARD: 'Dashboard',
  PROFILE: 'Profile',
  SOCIAL: 'Social',
  SHOP: 'Shop',
  OBJECTIVES: 'Objectives',
  PROJECTS: 'Projects',
  BATTLE_PASS: 'BattlePass',
  GUILDS: 'Guilds',
  DUELS: 'Duels',
  PERKS: 'Perks',
  CRAFTING: 'Crafting',
  GIFTS: 'Gifts',
  HABIT_LIBRARY: 'HabitLibrary',
  SETTINGS: 'Settings',
  STATISTICS: 'Statistics',
  ACHIEVEMENTS: 'Achievements',
  CHALLENGES: 'Challenges',
  COACH: 'Coach',
  ONBOARDING: 'Onboarding',
  NOTIFICATIONS: 'Notifications',
  INVENTORY: 'Inventory',
  AVATAR: 'Avatar',
  BUY_COINS: 'BuyCoins',
  BUY_GEMS: 'BuyGems',
  MISSIONS: 'Missions',
  PREMIUM: 'Premium',
  INVITATION_STATS: 'InvitationStats',
  ADMIN_PANEL: 'AdminPanel'
};

// Rewards constants
export const REWARDS = {
  HABIT_XP_BASE: 10,
  HABIT_XP_STREAK_BONUS: 5,
  STREAK_7_DAYS: { coins: 50, message: '¡7 días de racha! +50 monedas 🔥' },
  STREAK_14_DAYS: { coins: 100, message: '¡14 días de racha! +100 monedas ⚡' },
  STREAK_30_DAYS: { coins: 250, message: '¡30 días de racha! +250 monedas 🏆' },
  STREAK_MULTIPLE_30: { coins: 250, message: (days) => `¡${days} días de racha! +250 monedas 🏆` },
  PROJECT_TASK_COINS: 10,
  PROJECT_TASK_XP: 20,
  PROJECT_MILESTONE_COINS: 50,
  PROJECT_MILESTONE_XP: 100,
  BP_XP_MULTIPLIER: 0.5,
  BP_XP_PER_TIER: 500,
  XP_PER_LEVEL: 100,
  WELCOME_COINS: 100,
  WELCOME_XP: 50,
  REFERRAL_COINS: 100,
  REFERRAL_XP: 50
};

export const calculateLevel = (xp) => Math.floor(xp / REWARDS.XP_PER_LEVEL) + 1;

export const calculateBPTier = (bpXP) => Math.floor(bpXP / REWARDS.BP_XP_PER_TIER);

export const getStreakBonus = (streak) => {
  if (streak === 7) return REWARDS.STREAK_7_DAYS;
  if (streak === 14) return REWARDS.STREAK_14_DAYS;
  if (streak === 30) return REWARDS.STREAK_30_DAYS;
  if (streak % 30 === 0 && streak > 30) {
    return { coins: REWARDS.STREAK_MULTIPLE_30.coins, message: REWARDS.STREAK_MULTIPLE_30.message(streak) };
  }
  return null;
};