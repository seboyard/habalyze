import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Award, UserPlus, Bell, Activity, Trophy, BarChart3 } from 'lucide-react';
import PixelAvatar from '../components/avatar/PixelAvatar';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

import FriendsList from '../components/social/FriendsList';
import FriendRequests from '../components/social/FriendRequests';
import UserSearch from '../components/social/UserSearch';
import FriendActivityFeed from '../components/social/FriendActivity';
import FriendChat from '../components/social/FriendChat';
import UserSuggestions from '../components/social/UserSuggestions';
import InviteFriend from '../components/social/InviteFriend';
import ActivityComments from '../components/social/ActivityComments';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Flame, Heart } from 'lucide-react';

export default function SocialPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('xp');
  const [activeTab, setActiveTab] = useState('feed');
  const [rankingView, setRankingView] = useState('global'); // 'global' or 'friends'
  const [chatFriend, setChatFriend] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Pull-to-refresh for mobile
  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && !isRefreshing) {
        currentY = e.touches[0].clientY;
        const distance = currentY - startY;
        if (distance > 0 && distance < 150) {
          setPullDistance(distance);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80 && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(0);
        
        await queryClient.invalidateQueries(['friend-activities']);
        await queryClient.invalidateQueries(['friendships']);
        await queryClient.invalidateQueries(['friend-requests']);
        await queryClient.invalidateQueries(['activity-reactions']);
        
        setTimeout(() => {
          setIsRefreshing(false);
          toast.success('Actualizado');
        }, 500);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, queryClient]);

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await db.functions.invoke('listAllUsers');
      return response.data.users || [];
    },
    staleTime: 120000,
    gcTime: 300000,
  });

  const { data: allHabits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['all-habits'],
    queryFn: () => db.entities.Habit.filter({ is_active: true }),
    staleTime: 120000,
    gcTime: 300000,
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUser?.email],
    queryFn: () => db.entities.Friendship.list(),
    enabled: !!currentUser,
    staleTime: 60000,
    gcTime: 300000,
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friend-requests', currentUser?.email],
    queryFn: () => db.entities.FriendRequest.filter({ to_user_email: currentUser?.email, status: 'pending' }),
    enabled: !!currentUser,
    staleTime: 30000,
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ['sent-requests', currentUser?.email],
    queryFn: () => db.entities.FriendRequest.filter({ from_user_email: currentUser?.email, status: 'pending' }),
    enabled: !!currentUser,
    staleTime: 30000,
  });

  const { data: allActivities = [] } = useQuery({
    queryKey: ['friend-activities', currentUser?.email],
    queryFn: () => db.entities.FriendActivity.list('-created_date', 30),
    enabled: !!currentUser,
    staleTime: 60000,
  });

  const { data: activityReactions = [] } = useQuery({
    queryKey: ['activity-reactions'],
    queryFn: () => db.entities.ActivityReaction.list(),
    enabled: !!currentUser,
  });

  const { data: myActivities = [] } = useQuery({
    queryKey: ['my-activities', currentUser?.email],
    queryFn: () => db.entities.FriendActivity.filter({ user_email: currentUser?.email }, '-created_date', 15),
    enabled: !!currentUser && activeTab === 'friends',
    staleTime: 60000,
  });

  const isLoading = usersLoading || habitsLoading;

  const myFriendships = friendships.filter(f => 
    f.user1_email === currentUser?.email || f.user2_email === currentUser?.email
  );

  const friendEmails = myFriendships.map(f => 
    f.user1_email === currentUser?.email ? f.user2_email : f.user1_email
  );

  const friends = allUsers.filter(u => friendEmails.includes(u.email));

  // Include both friend activities and current user's activities
  const friendActivities = allActivities.filter(a => 
    friendEmails.includes(a.user_email) || a.user_email === currentUser?.email
  );

  const filteredActivities = friendActivities;

  // Group activities by user
  const activitiesByUser = filteredActivities.reduce((acc, activity) => {
    if (!acc[activity.user_email]) {
      acc[activity.user_email] = [];
    }
    acc[activity.user_email].push(activity);
    return acc;
  }, {});

  const sendRequestMutation = useMutation({
    mutationFn: async (toUser) => {
      // Update UI optimistically
      queryClient.setQueryData(['sent-requests', currentUser?.email], (old = []) => [
        ...old,
        {
          from_user_email: currentUser.email,
          to_user_email: toUser.email,
          status: 'pending',
          created_date: new Date().toISOString()
        }
      ]);

      await db.entities.FriendRequest.create({
        from_user_email: currentUser.email,
        to_user_email: toUser.email,
        from_user_name: currentUser.full_name,
        to_user_name: toUser.full_name,
        from_username: currentUser.username,
        to_username: toUser.username,
        status: 'pending'
      });

      await db.entities.Notification.create({
        user_email: toUser.email,
        type: 'friend_activity',
        title: 'Nueva solicitud de amistad',
        message: `${currentUser.full_name} (@${currentUser.username || 'usuario'}) quiere ser tu amigo`,
        icon: '👋',
        link: createPageUrl('Social')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sent-requests']);
      toast.success('Solicitud enviada');
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (request) => {
      // Update UI optimistically
      queryClient.setQueryData(['friend-requests', currentUser?.email], (old = []) => 
        old.filter(r => r.id !== request.id)
      );
      queryClient.setQueryData(['friendships', currentUser?.email], (old = []) => [
        ...old,
        {
          user1_email: request.from_user_email,
          user2_email: request.to_user_email,
          user1_name: request.from_user_name,
          user2_name: request.to_user_name,
          started_date: format(new Date(), 'yyyy-MM-dd')
        }
      ]);

      await db.entities.FriendRequest.update(request.id, { status: 'accepted' });
      
      await db.entities.Friendship.create({
        user1_email: request.from_user_email,
        user2_email: request.to_user_email,
        user1_name: request.from_user_name,
        user2_name: request.to_user_name,
        started_date: format(new Date(), 'yyyy-MM-dd')
      });

      await db.entities.Notification.create({
        user_email: request.from_user_email,
        type: 'friend_activity',
        title: '¡Nueva amistad!',
        message: `${currentUser.full_name} aceptó tu solicitud de amistad`,
        icon: '🤝',
        link: createPageUrl('Social')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friend-requests']);
      queryClient.invalidateQueries(['friendships']);
      toast.success('¡Ahora son amigos! 🎉');
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (request) => {
      // Update UI optimistically
      queryClient.setQueryData(['friend-requests', currentUser?.email], (old = []) => 
        old.filter(r => r.id !== request.id)
      );

      await db.entities.FriendRequest.update(request.id, { status: 'rejected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friend-requests']);
      toast.success('Solicitud rechazada');
    },
  });

  const reactToActivityMutation = useMutation({
    mutationFn: async ({ activityId, reactionType }) => {
      const existing = activityReactions.find(r => 
        r.activity_id === activityId && r.user_email === currentUser?.email
      );

      if (existing) {
        if (existing.reaction_type === reactionType) {
          await db.entities.ActivityReaction.delete(existing.id);
        } else {
          await db.entities.ActivityReaction.update(existing.id, { reaction_type: reactionType });
        }
      } else {
        await db.entities.ActivityReaction.create({
          activity_id: activityId,
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          reaction_type: reactionType
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activity-reactions']);
    }
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friend) => {
      const friendship = myFriendships.find(f => 
        f.user1_email === friend.email || f.user2_email === friend.email
      );
      
      // Update UI optimistically
      if (friendship) {
        queryClient.setQueryData(['friendships', currentUser?.email], (old = []) => 
          old.filter(f => f.id !== friendship.id)
        );
        await db.entities.Friendship.delete(friendship.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friendships']);
      toast.success('Amigo eliminado');
    },
  });

  const reactionTypes = [
    { type: 'like', icon: '👍', label: 'Me gusta' },
    { type: 'love', icon: '❤️', label: 'Me encanta' },
    { type: 'fire', icon: '🔥', label: 'Increíble' },
    { type: 'clap', icon: '👏', label: 'Aplauso' },
    { type: 'celebrate', icon: '🎉', label: 'Celebrar' },
    { type: 'support', icon: '💪', label: 'Apoyo' }
  ];

  const getReactionsForActivity = (activityId) => {
    return activityReactions.filter(r => r.activity_id === activityId);
  };

  const hasUserReacted = (activityId, reactionType) => {
    return activityReactions.some(r => 
      r.activity_id === activityId && 
      r.user_email === currentUser?.email && 
      r.reaction_type === reactionType
    );
  };

  const activityTypeConfig = {
    habit_completed: { icon: '✅', color: 'from-blue-50 to-cyan-50', border: 'border-blue-200' },
    streak_milestone: { icon: '🔥', color: 'from-orange-50 to-red-50', border: 'border-orange-200' },
    achievement_unlocked: { icon: '🏆', color: 'from-amber-50 to-yellow-50', border: 'border-amber-200' },
    level_up: { icon: '⭐', color: 'from-indigo-50 to-purple-50', border: 'border-indigo-200' },
    challenge_joined: { icon: '⚡', color: 'from-pink-50 to-rose-50', border: 'border-pink-200' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
          >
            <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              {isRefreshing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Actualizando...</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: pullDistance > 80 ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ↓
                  </motion.div>
                  <span className="text-sm font-medium text-gray-700">
                    {pullDistance > 80 ? 'Suelta para actualizar' : 'Arrastra para actualizar'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Comunidad
                </h1>
                <p className="text-gray-600">Compite y conecta con otros</p>
              </div>
            </div>

            <div className="flex gap-2">
              {friendRequests.length > 0 && (
                <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl border-2 border-red-300">
                  <Bell className="w-5 h-5" />
                  <span className="font-bold">{friendRequests.length}</span>
                  <span className="text-sm">solicitud{friendRequests.length > 1 ? 'es' : ''}</span>
                </div>
              )}
              <Link to={createPageUrl('Leaderboard')}>
                <button className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl border-2 border-amber-300 hover:bg-amber-200 transition-colors">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold">Ranking</span>
                </button>
              </Link>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full bg-white p-1 shadow-md border-2 border-gray-200">
              <TabsTrigger value="feed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-xs">
                <Activity className="w-4 h-4 mr-1" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="friends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs">
                <Users className="w-4 h-4 mr-1" />
                Amigos
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white text-xs">
                <UserPlus className="w-4 h-4 mr-1" />
                Buscar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-700">{friendEmails.length}</p>
                <p className="text-xs text-gray-600">Amigos</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                <Flame className="w-6 h-6 text-orange-600 mb-2" />
                <p className="text-2xl font-bold text-orange-700">{friendActivities.length}</p>
                <p className="text-xs text-gray-600">Actividades</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <Heart className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-purple-700">
                  {activityReactions.filter(r => r.user_email === currentUser?.email).length}
                </p>
                <p className="text-xs text-gray-600">Reacciones</p>
              </Card>
            </div>

            {friendActivities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay actividad de tus amigos aún</p>
                <p className="text-sm text-gray-400 mt-1">¡Invita amigos para ver sus logros aquí!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {friendActivities.map((activity) => {
                  const config = activityTypeConfig[activity.activity_type] || activityTypeConfig.habit_completed;
                  const reactions = getReactionsForActivity(activity.id);
                  const reactionCounts = reactions.reduce((acc, r) => {
                    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
                    return acc;
                  }, {});
                  const activityUser = allUsers.find(u => u.email === activity.user_email) || { email: activity.user_email, full_name: activity.user_name };

                  return (
                    <Card key={activity.id} className={`p-5 border-2 bg-gradient-to-r ${config.color} ${config.border}`}>
                      <div className="flex items-start gap-3">
                        <Link to={`${createPageUrl('Profile')}?user=${encodeURIComponent(activity.user_email)}`}>
                          <div className="relative flex-shrink-0">
                            <div className="bg-white rounded-full p-0.5 border-2 border-purple-200 hover:scale-105 transition-transform shadow-md">
                              <PixelAvatar user={activityUser} size="small" showLevel={false} showCoins={false} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                              <span className="text-sm">{activity.icon}</span>
                            </div>
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Link to={`${createPageUrl('Profile')}?user=${encodeURIComponent(activity.user_email)}`}>
                              <span className="font-bold text-gray-800 hover:text-purple-600 transition-colors">
                                {activity.user_name}
                              </span>
                            </Link>
                            <span className="text-2xl">{activity.icon}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: es })}
                            </span>
                          </div>

                          <p className="font-semibold text-gray-700 mb-1">{activity.title}</p>
                          <p className="text-sm text-gray-600 mb-3">{activity.description}</p>

                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {reactionTypes.map((r) => {
                              const count = reactionCounts[r.type] || 0;
                              const userReacted = hasUserReacted(activity.id, r.type);

                              return (
                                <button
                                  key={r.type}
                                  onClick={() => reactToActivityMutation.mutate({ 
                                    activityId: activity.id, 
                                    reactionType: r.type 
                                  })}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all ${
                                    userReacted 
                                      ? 'bg-purple-100 border-2 border-purple-400 shadow-sm' 
                                      : 'bg-white border border-gray-200 hover:border-purple-300 hover:shadow'
                                  }`}
                                >
                                  <span className="text-base">{r.icon}</span>
                                  {count > 0 && <span className="font-bold text-gray-700">{count}</span>}
                                </button>
                              );
                            })}
                          </div>

                          {/* Comments section */}
                          <ActivityComments activityId={activity.id} currentUser={currentUser} />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <>
            {friendRequests.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-red-500" />
                  Solicitudes Pendientes ({friendRequests.length})
                </h2>
                <FriendRequests
                  requests={friendRequests}
                  onAccept={(req) => acceptRequestMutation.mutate(req)}
                  onReject={(req) => rejectRequestMutation.mutate(req)}
                />
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-500" />
                  Mis Amigos ({friends.length})
                </h2>
                <InviteFriend currentUser={currentUser} />
              </div>

              {/* Quick add section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border-2 border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                  Agregar Amigos
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Comparte tu perfil:</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          const username = currentUser?.username || currentUser?.email;
                          const profileUrl = `${window.location.origin}${createPageUrl('Profile')}?user=${encodeURIComponent(username)}`;
                          navigator.clipboard.writeText(profileUrl);
                          toast.success('Link de perfil copiado');
                        }}
                        className="flex-1 bg-white border-2 border-purple-300 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors text-sm"
                      >
                        📋 Copiar mi link
                      </button>
                      <button
                        onClick={() => {
                          const username = currentUser?.username || currentUser?.email;
                          const profileUrl = `${window.location.origin}${createPageUrl('Profile')}?user=${encodeURIComponent(username)}`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('¡Agrega mi perfil en Habalyze! ' + profileUrl)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                      >
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">O búscalos directamente:</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
                    >
                      🔍 Buscar usuarios
                    </button>
                  </div>
                </div>
              </div>

              <FriendsList
                friends={friends}
                onRemoveFriend={(friend) => removeFriendMutation.mutate(friend)}
                onChatFriend={(friend) => setChatFriend(friend)}
              />
            </div>

            {/* My Activity */}
            {myActivities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-purple-500" />
                  Mi Actividad
                </h2>
                <FriendActivityFeed activities={myActivities} isOwnActivity={true} />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-500" />
                Actividad de Amigos
              </h2>
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay actividad reciente de tus amigos</p>
                  <p className="text-sm text-gray-400 mt-1">¡Invita amigos y anímense mutuamente!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(activitiesByUser).map(([userEmail, activities]) => {
                    const friend = friends.find(f => f.email === userEmail);
                    if (!friend) return null;
                    
                    return (
                      <div key={userEmail}>
                        <Link to={`${createPageUrl('Profile')}?user=${encodeURIComponent(friend.username || friend.email)}`}>
                          <div className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity">
                            {friend.profile_picture ? (
                              <img src={friend.profile_picture} alt={friend.full_name} className="w-10 h-10 rounded-full object-cover border-2 border-purple-200" />
                            ) : (
                              <PixelAvatar user={friend} size="small" showLevel={false} showCoins={false} />
                            )}
                            <div>
                              <h3 className="font-bold text-gray-800">{friend.full_name}</h3>
                              {friend.username && (
                                <p className="text-xs text-purple-600">@{friend.username}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                        <FriendActivityFeed activities={activities} currentUser={currentUser} showComments={true} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </>
            )}

        {/* Chat Window */}
        {chatFriend && currentUser && (
          <FriendChat
            friend={chatFriend}
            currentUser={currentUser}
            onClose={() => setChatFriend(null)}
          />
        )}

        {activeTab === 'add' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-green-500" />
                Buscar Usuarios
              </h2>
              <UserSearch
                allUsers={allUsers}
                currentUser={currentUser}
                friendEmails={friendEmails}
                pendingRequests={sentRequests}
                onSendRequest={(user) => sendRequestMutation.mutate(user)}
              />
            </div>

            <UserSuggestions
              allUsers={allUsers}
              currentUser={currentUser}
              friendEmails={friendEmails}
              pendingRequests={sentRequests}
              allHabits={allHabits}
              friendships={friendships}
              onSendRequest={(user) => sendRequestMutation.mutate(user)}
            />
          </div>
        )}
      </div>
    </div>
  );
}