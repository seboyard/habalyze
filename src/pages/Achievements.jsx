import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Trophy, Lock, Sparkles, Award, Target, Flame, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import AchievementCard from '../components/achievements/AchievementCard';

export default function AchievementsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => db.entities.Achievement.list(),
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', currentUser?.email],
    queryFn: () => db.entities.UserAchievement.filter({ user_email: currentUser?.email }),
    enabled: !!currentUser,
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['user-habits-achievements'],
    queryFn: () => db.entities.Habit.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser,
  });

  const { data: challengeParticipants = [] } = useQuery({
    queryKey: ['user-challenge-participations'],
    queryFn: () => db.entities.ChallengeParticipant.filter({ user_email: currentUser?.email }),
    enabled: !!currentUser,
  });

  const unlockedIds = userAchievements.map(ua => ua.achievement_id);
  const unlockedAchievements = achievements.filter(a => unlockedIds.includes(a.achievement_id));
  const lockedAchievements = achievements.filter(a => !unlockedIds.includes(a.achievement_id) && !a.is_secret);

  const filteredUnlocked = category === 'all' 
    ? unlockedAchievements 
    : unlockedAchievements.filter(a => a.category === category);

  const filteredLocked = category === 'all'
    ? lockedAchievements
    : lockedAchievements.filter(a => a.category === category);

  const calculateProgress = (achievement) => {
    const userProgress = userAchievements.find(ua => ua.achievement_id === achievement.achievement_id)?.progress || 0;
    
    if (achievement.requirement_type === 'total_completions') {
      const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
      return Math.min(totalCompletions, achievement.requirement_value);
    } else if (achievement.requirement_type === 'habit_count') {
      return Math.min(habits.length, achievement.requirement_value);
    } else if (achievement.requirement_type === 'challenge_count') {
      return Math.min(challengeParticipants.length, achievement.requirement_value);
    } else if (achievement.requirement_type === 'streak_days') {
      const maxStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
      return Math.min(maxStreak, achievement.requirement_value);
    } else if (achievement.requirement_type === 'level_reached') {
      return Math.min(currentUser?.level || 1, achievement.requirement_value);
    }
    
    return userProgress;
  };

  const categoryIcons = {
    habits: Target,
    challenges: Trophy,
    social: Users,
    streak: Flame,
    special: Star
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Logros e Insignias
              </h1>
              <p className="text-gray-600">Colecciona insignias y celebra tus logros</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-3 sm:p-4 border-2 border-amber-200 shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-center sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2 sm:mb-0">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-gray-500">Desbloqueados</p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-600">{unlockedAchievements.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-3 sm:p-4 border-2 border-gray-200 shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-center sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-2 sm:mb-0">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-gray-500">Bloqueados</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-600">{lockedAchievements.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-3 sm:p-4 border-2 border-purple-200 shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-center sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-2 sm:mb-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-gray-500">Progreso</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {Math.round((unlockedAchievements.length / achievements.filter(a => !a.is_secret).length) * 100)}%
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-3 sm:p-4 border-2 border-pink-200 shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-center sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-2 sm:mb-0">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-gray-500">Legendarios</p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-600">
                    {unlockedAchievements.filter(a => a.rarity === 'legendary').length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="mb-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full bg-white p-1 shadow-md border-2 border-gray-200">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-xs sm:text-sm">
              <span className="hidden sm:inline">✨ Todos</span>
              <span className="sm:hidden">✨</span>
            </TabsTrigger>
            <TabsTrigger value="habits" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs sm:text-sm">
              <span className="hidden sm:inline">🎯 Hábitos</span>
              <span className="sm:hidden">🎯</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs sm:text-sm">
              <span className="hidden sm:inline">🏆 Desafíos</span>
              <span className="sm:hidden">🏆</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white text-xs sm:text-sm">
              <span className="hidden sm:inline">👥 Social</span>
              <span className="sm:hidden">👥</span>
            </TabsTrigger>
            <TabsTrigger value="streak" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-400 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs sm:text-sm">
              <span className="hidden sm:inline">🔥 Rachas</span>
              <span className="sm:hidden">🔥</span>
            </TabsTrigger>
            <TabsTrigger value="special" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs sm:text-sm">
              <span className="hidden sm:inline">⭐ Especial</span>
              <span className="sm:hidden">⭐</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {filteredUnlocked.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  Desbloqueados ({filteredUnlocked.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredUnlocked.map((achievement) => (
                    <AchievementCard
                      key={achievement.achievement_id}
                      achievement={achievement}
                      unlocked={true}
                      progress={calculateProgress(achievement)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredLocked.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-gray-500" />
                  Por Desbloquear ({filteredLocked.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredLocked.map((achievement) => (
                    <AchievementCard
                      key={achievement.achievement_id}
                      achievement={achievement}
                      unlocked={false}
                      progress={calculateProgress(achievement)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}