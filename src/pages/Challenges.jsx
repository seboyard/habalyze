import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Users, Calendar, Zap, Target, TrendingUp, Gift, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeDetail from '../components/challenges/ChallengeDetail';
import CreateChallengeDialog from '../components/challenges/CreateChallengeDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ChallengesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => db.entities.Challenge.list('-created_date'),
  });

  const { data: allParticipants = [] } = useQuery({
    queryKey: ['challenge-participants'],
    queryFn: () => db.entities.ChallengeParticipant.list(),
    enabled: !!currentUser,
  });

  const { data: allHabits = [] } = useQuery({
    queryKey: ['all-user-habits'],
    queryFn: () => db.entities.Habit.filter({ is_active: true }),
    enabled: !!currentUser,
  });

  const { data: myMembership } = useQuery({
    queryKey: ['my-guild-membership', currentUser?.email],
    queryFn: () => db.entities.GuildMember.filter({ user_email: currentUser?.email }),
    enabled: !!currentUser,
  });

  const { data: guilds = [] } = useQuery({
    queryKey: ['guilds'],
    queryFn: () => db.entities.Guild.list(),
    enabled: !!currentUser,
  });

  const myGuild = guilds.find(g => g.guild_id === myMembership?.[0]?.guild_id);

  const joinChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      await db.entities.ChallengeParticipant.create({
        challenge_id: challenge.id,
        user_email: currentUser.email,
        personal_progress: 0,
        joined_date: format(new Date(), 'yyyy-MM-dd')
      });

      await db.entities.Challenge.update(challenge.id, {
        participant_count: (challenge.participant_count || 0) + 1
      });

      // Create notification
      await db.entities.Notification.create({
        user_email: currentUser.email,
        type: 'challenge_joined',
        title: '¡Te uniste a un desafío!',
        message: `Ahora eres parte de: ${challenge.title}`,
        icon: challenge.icon,
        link: createPageUrl('Challenges')
      });

      // Create friend activity with rich details
      await db.entities.FriendActivity.create({
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        activity_type: 'challenge_joined',
        title: `¡Se unió al desafío "${challenge.title}"!`,
        description: `${challenge.description || 'Desafío de ' + challenge.goal_value + ' ' + challenge.goal_type}`,
        icon: challenge.icon,
        metadata: {
          challenge_id: challenge.id,
          challenge_type: challenge.challenge_type,
          goal_value: challenge.goal_value,
          end_date: challenge.end_date
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      queryClient.invalidateQueries(['challenge-participants']);
      toast.success('¡Te has unido al desafío! 🎉');
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async ({ challenge, participant }) => {
      const newCoins = (currentUser?.coins || 0) + challenge.reward_coins;
      const newXP = (currentUser?.experience || 0) + (challenge.reward_xp || 0);
      const newLevel = Math.floor(newXP / 100) + 1;

      await db.auth.updateMe({
        coins: newCoins,
        experience: newXP,
        level: newLevel
      });

      await db.entities.ChallengeParticipant.update(participant.id, {
        has_claimed_reward: true
      });

      const updatedUser = await db.auth.me();
      setCurrentUser(updatedUser);

      // Create notification
      await db.entities.Notification.create({
        user_email: currentUser?.email,
        type: 'reward_claimed',
        title: '¡Recompensa Reclamada!',
        message: `Reclamaste +${challenge.reward_coins} monedas del desafío: ${challenge.title}`,
        icon: '🎁',
        link: createPageUrl('Challenges')
      });
    },
    onSuccess: (_, { challenge }) => {
      queryClient.invalidateQueries(['challenge-participants']);
      toast.success(`¡Recompensa reclamada! 🎁`, {
        description: `+${challenge.reward_coins} monedas y +${challenge.reward_xp || 0} XP`,
        duration: 5000
      });
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData) => {
      await db.entities.Challenge.create({
        ...challengeData,
        status: 'active',
        current_progress: 0,
        participant_count: 0,
        is_featured: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      setShowCreateDialog(false);
      toast.success('¡Desafío creado! 🎉');
    }
  });

  const userParticipations = allParticipants.filter(p => p.user_email === currentUser?.email);
  const activeChallenges = challenges.filter(c => c.status === 'active' && !isPast(new Date(c.end_date)));
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const guildChallenges = challenges.filter(c => c.guild_id === myGuild?.guild_id);
  const myChallenges = activeChallenges.filter(c => userParticipations.some(p => p.challenge_id === c.id));
  const collaborativeChallenges = activeChallenges.filter(c => c.challenge_type === 'collaborative');
  const competitiveChallenges = activeChallenges.filter(c => c.challenge_type === 'competitive');

  const getChallengeStats = (challenge) => {
    const participants = allParticipants.filter(p => p.challenge_id === challenge.id);
    const userParticipation = participants.find(p => p.user_email === currentUser?.email);
    const isJoined = !!userParticipation;
    const progress = (challenge.current_progress / challenge.goal_value) * 100;
    const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
    const isCompleted = challenge.current_progress >= challenge.goal_value;
    const canClaimReward = isCompleted && isJoined && !userParticipation?.has_claimed_reward;

    return { participants, userParticipation, isJoined, progress, daysLeft, isCompleted, canClaimReward };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20 relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Desafíos Comunitarios
                </h1>
                <p className="text-gray-600">Compite, colabora y alcanza metas increíbles</p>
              </div>
            </div>
            {myGuild && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Desafío
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Desafíos Activos</p>
                  <p className="text-2xl font-bold text-purple-600">{activeChallenges.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mis Desafíos</p>
                  <p className="text-2xl font-bold text-green-600">{userParticipations.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 border-2 border-amber-200 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completados</p>
                  <p className="text-2xl font-bold text-amber-600">{completedChallenges.length}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="mine">Mis Desafíos</TabsTrigger>
            <TabsTrigger value="collaborative">🤝 Colaborativos</TabsTrigger>
            <TabsTrigger value="competitive">⚔️ Competitivos</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeChallenges.map((challenge) => {
                  const stats = getChallengeStats(challenge);
                  return (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      stats={stats}
                      onJoin={() => joinChallengeMutation.mutate(challenge)}
                      onView={() => setSelectedChallenge(challenge)}
                      onClaimReward={() => claimRewardMutation.mutate({ 
                        challenge, 
                        participant: stats.userParticipation 
                      })}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine">
            {myChallenges.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No estás en ningún desafío activo</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChallenges.map((challenge) => {
                  const stats = getChallengeStats(challenge);
                  return (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      stats={stats}
                      onView={() => setSelectedChallenge(challenge)}
                      onClaimReward={() => claimRewardMutation.mutate({ 
                        challenge, 
                        participant: stats.userParticipation 
                      })}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collaborative">
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>🤝 Desafíos Colaborativos:</strong> Todos los participantes trabajan juntos para alcanzar una meta común. ¡El progreso se suma!
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborativeChallenges.map((challenge) => {
                const stats = getChallengeStats(challenge);
                return (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    stats={stats}
                    onJoin={() => joinChallengeMutation.mutate(challenge)}
                    onView={() => setSelectedChallenge(challenge)}
                    onClaimReward={() => claimRewardMutation.mutate({ 
                      challenge, 
                      participant: stats.userParticipation 
                    })}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="competitive">
            <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>⚔️ Desafíos Competitivos:</strong> Compite contra otros participantes. ¡El primero en completar la meta gana!
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitiveChallenges.map((challenge) => {
                const stats = getChallengeStats(challenge);
                return (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    stats={stats}
                    onJoin={() => joinChallengeMutation.mutate(challenge)}
                    onView={() => setSelectedChallenge(challenge)}
                    onClaimReward={() => claimRewardMutation.mutate({ 
                      challenge, 
                      participant: stats.userParticipation 
                    })}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {selectedChallenge && (
          <ChallengeDetail
            challenge={selectedChallenge}
            stats={getChallengeStats(selectedChallenge)}
            participants={allParticipants.filter(p => p.challenge_id === selectedChallenge.id)}
            allHabits={allHabits}
            currentUser={currentUser}
            onClose={() => setSelectedChallenge(null)}
          />
        )}
      </AnimatePresence>

      <CreateChallengeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => createChallengeMutation.mutate(data)}
        myGuild={myGuild}
        currentUser={currentUser}
      />
    </div>
  );
}