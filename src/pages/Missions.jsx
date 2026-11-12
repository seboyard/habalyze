import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Calendar, Trophy, Zap, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, isPast, startOfDay, addDays, addWeeks, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

import MissionCard from '../components/missions/MissionCard';

export default function MissionsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: () => db.entities.Mission.filter({ is_active: true }),
  });

  const { data: userMissions = [] } = useQuery({
    queryKey: ['user-missions', currentUser?.email],
    queryFn: () => db.entities.UserMission.filter({ user_email: currentUser?.email }),
    enabled: !!currentUser,
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['user-habits-missions'],
    queryFn: () => db.entities.Habit.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['habit-logs-today'],
    queryFn: () => db.entities.HabitLog.filter({ 
      completed_date: format(new Date(), 'yyyy-MM-dd'),
      created_by: currentUser?.email 
    }),
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (!currentUser || !missions.length) return;

    const updateMissionProgress = async () => {
      for (const mission of missions) {
        if (isPast(new Date(mission.expires_date))) continue;

        const userMission = userMissions.find(um => um.mission_id === mission.mission_id);
        let currentProgress = 0;

        if (mission.objective_type === 'complete_habits') {
          currentProgress = logs.length;
        } else if (mission.objective_type === 'reach_streak') {
          const maxStreak = Math.max(...habits.map(h => h.current_streak || 0), 0);
          currentProgress = maxStreak;
        } else if (mission.objective_type === 'level_up') {
          currentProgress = currentUser.level || 1;
        }

        const isCompleted = currentProgress >= mission.objective_value;

        if (!userMission) {
          await db.entities.UserMission.create({
            user_email: currentUser.email,
            mission_id: mission.mission_id,
            progress: currentProgress,
            is_completed: isCompleted,
            completed_date: isCompleted ? new Date().toISOString() : null
          });
        } else if (userMission.progress !== currentProgress || userMission.is_completed !== isCompleted) {
          await db.entities.UserMission.update(userMission.id, {
            progress: currentProgress,
            is_completed: isCompleted,
            completed_date: isCompleted && !userMission.is_completed ? new Date().toISOString() : userMission.completed_date
          });
        }
      }

      queryClient.invalidateQueries(['user-missions']);
    };

    updateMissionProgress();
  }, [currentUser, missions, userMissions, logs, habits, queryClient]);

  const claimRewardMutation = useMutation({
    mutationFn: async ({ mission, userMission }) => {
      const newCoins = (currentUser?.coins || 0) + mission.reward_coins;
      const newXP = (currentUser?.experience || 0) + mission.reward_xp;
      const newLevel = Math.floor(newXP / 100) + 1;
      
      // Add battle pass XP
      const newBPXP = (currentUser?.battle_pass_xp || 0) + Math.floor(mission.reward_xp / 2);
      const bpXPPerTier = 500;
      const newBPTier = Math.floor(newBPXP / bpXPPerTier);

      // Add materials from missions
      let updates = {
        coins: newCoins,
        experience: newXP,
        level: newLevel,
        battle_pass_xp: newBPXP,
        battle_pass_tier: Math.max(currentUser?.battle_pass_tier || 0, newBPTier)
      };

      // Grant materials based on mission type
      if (mission.reward_materials && mission.reward_materials.length > 0) {
        for (const mat of mission.reward_materials) {
          const existingMat = await db.entities.UserMaterial.filter({
            user_email: currentUser?.email,
            material_id: mat.material_id
          });
          
          if (existingMat.length > 0) {
            await db.entities.UserMaterial.update(existingMat[0].id, {
              quantity: (existingMat[0].quantity || 0) + mat.quantity
            });
          } else {
            await db.entities.UserMaterial.create({
              user_email: currentUser?.email,
              material_id: mat.material_id,
              quantity: mat.quantity
            });
          }
        }
      }

      await db.auth.updateMe(updates);

      await db.entities.UserMission.update(userMission.id, {
        has_claimed_reward: true
      });

      await db.entities.Notification.create({
        user_email: currentUser?.email,
        type: 'reward_claimed',
        title: '¡Misión Completada!',
        message: `Completaste: ${mission.title} - +${mission.reward_coins} monedas`,
        icon: mission.icon,
        link: createPageUrl('Missions')
      });
    },
    onSuccess: (_, { mission }) => {
      queryClient.invalidateQueries(['user-missions']);
      const loadUser = async () => {
        const user = await db.auth.me();
        setCurrentUser(user);
      };
      loadUser();
      toast.success('¡Recompensa reclamada! 🎁', {
        description: `+${mission.reward_coins} monedas y +${mission.reward_xp} XP`,
        duration: 5000
      });
    },
  });

  const dailyMissions = missions.filter(m => m.type === 'daily' && !isPast(new Date(m.expires_date)));
  const weeklyMissions = missions.filter(m => m.type === 'weekly' && !isPast(new Date(m.expires_date)));
  const completedMissions = userMissions.filter(um => um.is_completed);

  const activeMissions = activeTab === 'daily' ? dailyMissions : weeklyMissions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 pb-20 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Misiones
              </h1>
              <p className="text-gray-600">Completa objetivos y gana recompensas</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Diarias</p>
                  <p className="text-2xl font-bold text-blue-600">{dailyMissions.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Semanales</p>
                  <p className="text-2xl font-bold text-purple-600">{weeklyMissions.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{completedMissions.length}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full bg-white p-1 shadow-md border-2 border-gray-200">
              <TabsTrigger 
                value="daily" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Diarias
              </TabsTrigger>
              <TabsTrigger 
                value="weekly" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                <Clock className="w-4 h-4 mr-2" />
                Semanales
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {missionsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : activeMissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay misiones {activeTab === 'daily' ? 'diarias' : 'semanales'} disponibles</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {activeMissions.map((mission) => {
              const userMission = userMissions.find(um => um.mission_id === mission.mission_id);
              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  userMission={userMission}
                  onClaim={() => claimRewardMutation.mutate({ mission, userMission })}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}