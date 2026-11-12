import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, Trophy, Gift, CheckCircle2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

const difficultyConfig = {
  easy: {
    color: 'from-green-400 to-emerald-500',
    text: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-300',
    label: 'Fácil'
  },
  medium: {
    color: 'from-blue-400 to-cyan-500',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    label: 'Medio'
  },
  hard: {
    color: 'from-purple-400 to-pink-500',
    text: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    label: 'Difícil'
  },
  extreme: {
    color: 'from-red-400 to-orange-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-300',
    label: 'Extremo'
  }
};

export default function ChallengeCard({ challenge, stats, onJoin, onView, onClaimReward }) {
  const config = difficultyConfig[challenge.difficulty] || difficultyConfig.medium;
  const { isJoined, progress, daysLeft, isCompleted, canClaimReward } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn(
        "overflow-hidden border-2 transition-all shadow-lg hover:shadow-xl",
        config.border,
        isCompleted && "ring-2 ring-green-400"
      )}>
        <div className={cn("h-3 bg-gradient-to-r relative", config.color)}>
          {isCompleted && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer" />
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-4xl">{challenge.icon}</span>
              <div>
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{challenge.title}</h3>
                <Badge className={cn("text-xs mt-1", config.color, "text-white")}>
                  {config.label}
                </Badge>
              </div>
            </div>
            {isCompleted && (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>

          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progreso Comunitario</span>
                <span className="font-bold text-purple-600">
                  {challenge.current_progress} / {challenge.goal_value}
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 font-medium">{challenge.participant_count || 0} unidos</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className={cn(
                  "font-medium",
                  daysLeft < 3 ? "text-red-600" : "text-gray-700"
                )}>
                  {daysLeft} días
                </span>
              </div>
            </div>

            <div className={cn("rounded-lg p-3 border-2", config.border, config.bg)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Recompensa</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span className="font-bold text-amber-700">{challenge.reward_coins}</span>
                  {challenge.reward_xp > 0 && (
                    <>
                      <span className="text-purple-700 mx-1">•</span>
                      <span className="text-purple-700 font-bold">+{challenge.reward_xp} XP</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {canClaimReward ? (
              <Button
                onClick={onClaimReward}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
              >
                <Gift className="w-4 h-4 mr-2" />
                Reclamar Recompensa
              </Button>
            ) : isJoined ? (
              <>
                <Button
                  variant="outline"
                  onClick={onView}
                  className="flex-1 font-medium"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
                {isCompleted && (
                  <div className="flex-1 flex items-center justify-center gap-2 text-sm text-green-700 font-medium bg-green-50 rounded-lg border border-green-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Completado
                  </div>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={onJoin}
                  className={cn("flex-1 text-white font-bold bg-gradient-to-r", config.color)}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Unirse
                </Button>
                <Button
                  variant="outline"
                  onClick={onView}
                  className="px-3"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}