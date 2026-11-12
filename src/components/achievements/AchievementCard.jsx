import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const rarityConfig = {
  common: {
    gradient: 'from-gray-400 to-gray-500',
    border: 'border-gray-300',
    text: 'text-gray-700',
    bg: 'bg-gray-50',
    glow: ''
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    border: 'border-blue-400',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    glow: 'shadow-blue-200'
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    border: 'border-purple-400',
    text: 'text-purple-700',
    bg: 'bg-purple-50',
    glow: 'shadow-purple-200'
  },
  legendary: {
    gradient: 'from-amber-400 to-orange-600',
    border: 'border-amber-400',
    text: 'text-amber-700',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    glow: 'shadow-amber-300'
  }
};

export default function AchievementCard({ achievement, unlocked, progress }) {
  const config = rarityConfig[achievement.rarity] || rarityConfig.common;
  const progressPercent = (progress / achievement.requirement_value) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: unlocked ? -4 : 0, scale: unlocked ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all",
        unlocked ? cn(config.border, config.glow, "shadow-lg") : "border-gray-200 opacity-60",
        achievement.rarity === 'legendary' && unlocked && "shadow-xl"
      )}>
        <div className={cn(
          "h-3 bg-gradient-to-r relative",
          unlocked ? config.gradient : "from-gray-300 to-gray-400"
        )}>
          {achievement.rarity === 'legendary' && unlocked && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              <span className={cn(
                "text-5xl drop-shadow-md",
                !unlocked && "grayscale opacity-40"
              )}>
                {achievement.icon}
              </span>
              {achievement.rarity === 'legendary' && unlocked && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </motion.div>
              )}
              {unlocked && (
                <div className="absolute -bottom-1 -right-1">
                  <CheckCircle2 className="w-5 h-5 text-green-500 bg-white rounded-full" />
                </div>
              )}
            </div>

            <Badge className={cn(
              "text-xs capitalize",
              unlocked ? cn(config.gradient, "text-white") : "bg-gray-300 text-gray-600"
            )}>
              {achievement.rarity}
            </Badge>
          </div>

          <h3 className={cn(
            "font-bold text-sm mb-1",
            unlocked ? "text-gray-800" : "text-gray-500"
          )}>
            {achievement.title}
          </h3>

          <p className={cn(
            "text-xs mb-3 line-clamp-2 min-h-[32px]",
            unlocked ? "text-gray-600" : "text-gray-400"
          )}>
            {achievement.description}
          </p>

          {!unlocked && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Progreso</span>
                <span className="font-bold text-gray-600">
                  {progress} / {achievement.requirement_value}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-gray-200" />
            </div>
          )}

          {(achievement.reward_coins > 0 || achievement.reward_xp > 0) && (
            <div className={cn(
              "rounded-lg p-2 border flex items-center justify-between text-xs",
              unlocked ? cn(config.bg, config.border) : "bg-gray-50 border-gray-200"
            )}>
              <span className={cn("font-medium", unlocked ? config.text : "text-gray-500")}>
                Recompensa
              </span>
              <div className="flex items-center gap-2">
                {achievement.reward_coins > 0 && (
                  <div className="flex items-center gap-1">
                    <span>💰</span>
                    <span className={cn("font-bold", unlocked ? "text-amber-700" : "text-gray-500")}>
                      {achievement.reward_coins}
                    </span>
                  </div>
                )}
                {achievement.reward_xp > 0 && (
                  <div className="flex items-center gap-1">
                    <span>⚡</span>
                    <span className={cn("font-bold", unlocked ? "text-purple-700" : "text-gray-500")}>
                      +{achievement.reward_xp}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!unlocked && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg p-2">
              <Lock className="w-3 h-3" />
              <span>Bloqueado</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}