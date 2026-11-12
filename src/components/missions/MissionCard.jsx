import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, Gift, Star, Zap } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

const missionTypeStyles = {
  daily: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  weekly: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700 border-purple-300'
  }
};

export default function MissionCard({ mission, userMission, onClaim }) {
  const styles = missionTypeStyles[mission.type];
  const progress = (userMission?.progress || 0);
  const progressPercent = Math.min((progress / mission.objective_value) * 100, 100);
  const isCompleted = userMission?.is_completed || progressPercent >= 100;
  const hasClaimed = userMission?.has_claimed_reward;
  const isExpired = isPast(new Date(mission.expires_date));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className={`${styles.bg} border-2 ${styles.border} shadow-lg overflow-hidden`}>
        <CardHeader className={`bg-gradient-to-r ${styles.gradient} text-white pb-4`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{mission.icon}</div>
              <div>
                <CardTitle className="text-xl">{mission.title}</CardTitle>
                <Badge className={`${styles.badge} border mt-1`}>
                  {mission.type === 'daily' ? 'Diaria' : 'Semanal'}
                </Badge>
              </div>
            </div>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 className="w-8 h-8 text-green-300" />
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <p className="text-gray-700 mb-4">{mission.description}</p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-semibold ${styles.text}`}>
                  Progreso: {progress}/{mission.objective_value}
                </span>
                <span className={`text-sm font-bold ${styles.text}`}>
                  {progressPercent.toFixed(0)}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Expira: {format(new Date(mission.expires_date), "d 'de' MMM", { locale: es })}</span>
              </div>
              {isExpired && (
                <Badge variant="destructive">Expirada</Badge>
              )}
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${styles.bg} border ${styles.border}`}>
              <Gift className={`w-5 h-5 ${styles.text}`} />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Recompensa:</p>
                <div className="flex items-center gap-3">
                  {mission.reward_coins > 0 && (
                    <span className="font-bold text-amber-600">💰 {mission.reward_coins}</span>
                  )}
                  {mission.reward_xp > 0 && (
                    <span className="font-bold text-purple-600">⚡ {mission.reward_xp} XP</span>
                  )}
                </div>
              </div>
            </div>

            {isCompleted && !hasClaimed && !isExpired && (
              <Button
                onClick={onClaim}
                className={`w-full bg-gradient-to-r ${styles.gradient} hover:opacity-90 text-white font-bold shadow-lg`}
              >
                <Gift className="w-5 h-5 mr-2" />
                Reclamar Recompensa
              </Button>
            )}

            {hasClaimed && (
              <div className="text-center py-2 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  ¡Recompensa Reclamada!
                </p>
              </div>
            )}

            {isExpired && !isCompleted && (
              <div className="text-center py-2 bg-gray-100 border-2 border-gray-300 rounded-lg">
                <p className="text-gray-600 font-semibold">Misión Expirada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}