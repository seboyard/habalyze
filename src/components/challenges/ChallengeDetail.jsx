import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Trophy, Users, TrendingUp, Flame, Calendar, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import InviteToChallenge from './InviteToChallenge';
import PixelAvatar from '../avatar/PixelAvatar';

export default function ChallengeDetail({ challenge, stats, participants, allHabits, currentUser, onClose }) {
  const { progress, daysLeft, isCompleted } = stats;
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Calculate leaderboard
  const leaderboard = participants
    .map(p => {
      const userHabits = allHabits.filter(h => h.created_by === p.user_email);
      const totalStreak = userHabits.reduce((sum, h) => sum + (h.current_streak || 0), 0);
      return {
        ...p,
        totalStreak,
        displayProgress: p.personal_progress || totalStreak
      };
    })
    .sort((a, b) => b.displayProgress - a.displayProgress)
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-white shadow-2xl border-2 border-purple-300">
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="flex items-start gap-4 mb-4">
                <div className="text-6xl">{challenge.icon}</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{challenge.title}</h2>
                  <p className="text-white/90 text-lg">{challenge.description}</p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Badge className="bg-white/20 text-white border-white/40">
                  {format(new Date(challenge.start_date), "d MMM", { locale: es })} - {format(new Date(challenge.end_date), "d MMM", { locale: es })}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/40">
                  <Users className="w-3 h-3 mr-1" />
                  {challenge.participant_count || 0} participantes
                </Badge>
                {isCompleted && (
                  <Badge className="bg-green-500 text-white">
                    <Trophy className="w-3 h-3 mr-1" />
                    ¡Completado!
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Progreso Comunitario
                </h3>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700 font-medium">Meta del Desafío</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {challenge.current_progress} / {challenge.goal_value}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3 mb-2 bg-white" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{Math.round(progress)}% completado</span>
                    <span className={cn(
                      "font-bold",
                      daysLeft < 3 ? "text-red-600" : "text-gray-700"
                    )}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {daysLeft} días restantes
                    </span>
                  </div>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    Tabla de Clasificación
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowInviteDialog(true)}
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invitar Amigos
                  </Button>
                </div>
                <div className="space-y-2">
                  {leaderboard.length === 0 ? (
                    <Card className="p-6 text-center text-gray-500 border-2 border-dashed">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aún no hay participantes</p>
                    </Card>
                  ) : (
                    leaderboard.map((participant, index) => {
                      const isCurrentUser = participant.user_email === currentUser?.email;
                      const rankColor = index === 0 ? 'from-amber-400 to-yellow-500' :
                                       index === 1 ? 'from-gray-300 to-gray-400' :
                                       index === 2 ? 'from-orange-400 to-orange-500' :
                                       'from-gray-200 to-gray-300';

                      return (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className={cn(
                            "p-4 transition-all",
                            isCurrentUser && "bg-purple-50 border-2 border-purple-300 shadow-md"
                          )}>
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white shadow-md",
                                rankColor
                              )}>
                                {index < 3 ? (
                                  <Trophy className="w-5 h-5" />
                                ) : (
                                  `#${index + 1}`
                                )}
                              </div>

                              <div className="bg-white rounded-full border-2 border-purple-200 p-0.5">
                                <PixelAvatar user={{ email: participant.user_email }} size="tiny" showLevel={false} showCoins={false} />
                              </div>

                              <div className="flex-1">
                                <p className="font-bold text-gray-800">
                                  {participant.user_email.split('@')[0]}
                                  {isCurrentUser && (
                                    <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">
                                      Tú
                                    </Badge>
                                  )}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Flame className="w-4 h-4 text-orange-500" />
                                  <span>{participant.displayProgress} contribución</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-2xl font-bold text-purple-600">
                                  {participant.displayProgress}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  Recompensas al Completar
                </h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="font-bold text-amber-700 text-lg">{challenge.reward_coins} monedas</span>
                  </div>
                  {challenge.reward_xp > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚡</span>
                      <span className="font-bold text-purple-700 text-lg">+{challenge.reward_xp} XP</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  * Todos los participantes recibirán la recompensa cuando se complete el objetivo
                </p>
              </Card>
            </div>
          </div>
        </Card>
      </motion.div>

      <InviteToChallenge
        challenge={challenge}
        currentUser={currentUser}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </motion.div>
  );
}