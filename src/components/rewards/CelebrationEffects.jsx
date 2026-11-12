import confetti from 'canvas-confetti';

// Different celebration types
export const celebrations = {
  // Basic habit completion
  habitComplete: () => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#8B5CF6', '#EC4899', '#F59E0B']
    });
  },

  // Streak milestone (7, 14, 30 days)
  streakMilestone: (days) => {
    const intensity = days >= 30 ? 200 : days >= 14 ? 150 : 100;
    
    confetti({
      particleCount: intensity,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EF4444', '#8B5CF6']
    });

    // Fire effect for streaks
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B6B', '#FFE66D']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF6B6B', '#FFE66D']
      });
    }, 150);
  },

  // Achievement unlocked
  achievementUnlock: (rarity = 'common') => {
    const configs = {
      common: { particleCount: 50, colors: ['#9CA3AF', '#6B7280'] },
      rare: { particleCount: 80, colors: ['#3B82F6', '#60A5FA'] },
      epic: { particleCount: 120, colors: ['#8B5CF6', '#A855F7', '#EC4899'] },
      legendary: { particleCount: 200, colors: ['#F59E0B', '#FBBF24', '#FCD34D'] }
    };

    const config = configs[rarity] || configs.common;

    // Main burst
    confetti({
      ...config,
      spread: 100,
      origin: { y: 0.6 }
    });

    // Side bursts for epic and legendary
    if (rarity === 'epic' || rarity === 'legendary') {
      setTimeout(() => {
        confetti({
          particleCount: config.particleCount / 2,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: config.colors
        });
        confetti({
          particleCount: config.particleCount / 2,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: config.colors
        });
      }, 200);
    }

    // Extra effect for legendary
    if (rarity === 'legendary') {
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: config.colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: config.colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  },

  // Level up
  levelUp: (newLevel) => {
    const intensity = Math.min(50 + newLevel * 10, 300);

    // Star burst
    confetti({
      particleCount: intensity,
      spread: 160,
      origin: { y: 0.5 },
      colors: ['#FBBF24', '#F59E0B', '#8B5CF6', '#EC4899'],
      shapes: ['star', 'circle']
    });

    // Cannon effect
    setTimeout(() => {
      confetti({
        particleCount: intensity / 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#FBBF24', '#F59E0B']
      });
      confetti({
        particleCount: intensity / 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#FBBF24', '#F59E0B']
      });
    }, 300);
  },

  // Purchase item
  itemPurchase: (rarity = 'common') => {
    const colors = {
      common: ['#9CA3AF', '#D1D5DB'],
      rare: ['#3B82F6', '#93C5FD'],
      epic: ['#8B5CF6', '#C4B5FD'],
      legendary: ['#F59E0B', '#FDE68A'],
      exclusive: ['#EC4899', '#F9A8D4']
    };

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: colors[rarity] || colors.common
    });
  },

  // Challenge complete
  challengeComplete: () => {
    const end = Date.now() + 2000;

    (function frame() {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22C55E', '#4ADE80', '#86EFAC']
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22C55E', '#4ADE80', '#86EFAC']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  },

  // Mission complete
  missionComplete: () => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#8B5CF6', '#A855F7', '#C084FC']
    });
  },

  // Loot box open
  lootBoxOpen: () => {
    // Mystery sparkle effect
    const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#3B82F6'];
    
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors,
      startVelocity: 45
    });

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors,
        shapes: ['star']
      });
    }, 200);
  },

  // Welcome/onboarding complete
  welcome: () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  },

  // Daily reward
  dailyReward: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FBBF24', '#F59E0B', '#FCD34D']
    });
  }
};

export default celebrations;