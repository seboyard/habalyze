import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Trophy, Award, Users, Flame, Target, MessageCircle, 
  Send, ArrowLeft, Share2, Settings, Star, Calendar,
  Zap, Crown, Gift, Clock, Shield
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import PixelAvatar from '../components/avatar/PixelAvatar';
import BadgeDisplay from '../components/profile/BadgeDisplay';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileComments from '../components/profile/ProfileComments';
import ProfileEditor from '../components/profile/ProfileEditor';
import BadgeSelector from '../components/profile/BadgeSelector';
import FriendActivityFeed from '../components/social/FriendActivity';
import ProfileActivityReactions from '../components/profile/ProfileActivityReactions';
import GiftPremiumDialog from '../components/profile/GiftPremiumDialog';

export default function ProfilePage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);
  const [showGiftPremiumModal, setShowGiftPremiumModal] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null); // null, 'none', 'pending', 'friends'

  // Get profile identifier from URL query params
  const urlParams = new URLSearchParams(location.search);
  const profileIdentifier = urlParams.get('user');

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await db.auth.me();
        setCurrentUser(user);
        
        if (profileIdentifier && profileIdentifier !== user.username && profileIdentifier !== user.email) {
          const response = await db.functions.invoke('getUserByIdentifier', { identifier: profileIdentifier });
          if (response.data.user) {
            setProfileUser(response.data.user);
            setIsOwnProfile(false);
          } else {
            setProfileUser(user);
            setIsOwnProfile(true);
          }
        } else {
          setProfileUser(user);
          setIsOwnProfile(true);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = createPageUrl('Landing');
      }
    };
    loadData();
  }, [profileIdentifier]);

  const { data: userBadges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['user-badges', profileUser?.email],
    queryFn: () => db.entities.UserBadge.filter({ user_email: profileUser?.email }),
    enabled: !!profileUser,
    staleTime: 60000,
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => db.entities.Badge.filter({ is_active: true }),
    staleTime: 300000,
  });

  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['profile-habits', profileUser?.email],
    queryFn: () => db.entities.Habit.filter({ created_by: profileUser?.email, is_active: true }),
    enabled: !!profileUser,
    staleTime: 60000,
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ['profile-friendships', profileUser?.email],
    queryFn: () => db.entities.Friendship.list(),
    enabled: !!profileUser,
    staleTime: 60000,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['profile-projects', profileUser?.email],
    queryFn: () => db.entities.Project.filter({ created_by: profileUser?.email }),
    enabled: !!profileUser,
    staleTime: 60000,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['profile-comments', profileUser?.email],
    queryFn: () => db.entities.ProfileComment.filter({ profile_user_email: profileUser?.email }, '-created_date'),
    enabled: !!profileUser,
    staleTime: 30000,
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['profile-friend-requests', currentUser?.email, profileUser?.email],
    queryFn: () => db.entities.FriendRequest.list(),
    enabled: !!currentUser && !!profileUser && !isOwnProfile,
    staleTime: 30000,
  });

  const { data: userActivities = [] } = useQuery({
    queryKey: ['user-activities', profileUser?.email],
    queryFn: () => db.entities.FriendActivity.filter({ user_email: profileUser?.email }, '-created_date', 20),
    enabled: !!profileUser,
    staleTime: 60000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users-profile'],
    queryFn: async () => {
      const response = await db.functions.invoke('listAllUsers');
      return response.data.users || [];
    },
    staleTime: 300000,
  });

  const friendCount = friendships.filter(f => 
    f.user1_email === profileUser?.email || f.user2_email === profileUser?.email
  ).length;

  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
  const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);

  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      await db.entities.ProfileComment.create({
        profile_user_email: profileUser.email,
        commenter_email: currentUser.email,
        commenter_name: currentUser.full_name,
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile-comments']);
      toast.success('Comentario añadido');
    }
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async () => {
      setFriendRequestStatus('pending');
      await db.entities.FriendRequest.create({
        from_user_email: currentUser.email,
        to_user_email: profileUser.email,
        from_user_name: currentUser.full_name,
        to_user_name: profileUser.full_name,
        from_username: currentUser.username,
        to_username: profileUser.username,
        status: 'pending'
      });

      await db.entities.Notification.create({
        user_email: profileUser.email,
        type: 'friend_activity',
        title: 'Nueva solicitud de amistad',
        message: `${currentUser.full_name} (@${currentUser.username || 'usuario'}) quiere ser tu amigo`,
        icon: '👋',
        link: createPageUrl('Social')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile-friend-requests']);
      toast.success('Solicitud enviada');
    }
  });

  // Map user badges to full badge data
  const userBadgesWithData = userBadges.map(ub => {
    const badge = allBadges.find(b => b.badge_id === ub.badge_id);
    return { ...ub, badge };
  }).filter(ub => ub.badge);

  const featuredBadges = userBadgesWithData.filter(ub => ub.is_featured).slice(0, 3);

  // Check if profile is private and user is not a friend
  const isFriend = friendships.some(f => 
    (f.user1_email === currentUser?.email && f.user2_email === profileUser?.email) ||
    (f.user2_email === currentUser?.email && f.user1_email === profileUser?.email)
  );
  // Profiles are now always visible - privacy only affects detailed stats
  const isProfileHidden = false;

  // Check friend request status
  useEffect(() => {
    if (!currentUser || !profileUser || isOwnProfile) return;

    if (isFriend) {
      setFriendRequestStatus('friends');
    } else {
      const hasPendingRequest = friendRequests.some(r => 
        (r.from_user_email === currentUser.email && r.to_user_email === profileUser.email && r.status === 'pending') ||
        (r.from_user_email === profileUser.email && r.to_user_email === currentUser.email && r.status === 'pending')
      );
      setFriendRequestStatus(hasPendingRequest ? 'pending' : 'none');
    }
  }, [currentUser, profileUser, isOwnProfile, isFriend, friendRequests]);

  const handleSaveProfile = async (data) => {
    await db.auth.updateMe(data);
    const updated = await db.auth.me();
    setCurrentUser(updated);
    setProfileUser(updated);
    window.location.reload();
  };

  const handleSaveFeaturedBadges = async (badgeIds) => {
    // Update all badges
    for (const ub of userBadges) {
      const shouldBeFeatured = badgeIds.includes(ub.badge_id);
      if (ub.is_featured !== shouldBeFeatured) {
        await db.entities.UserBadge.update(ub.id, { is_featured: shouldBeFeatured });
      }
    }
    queryClient.invalidateQueries(['user-badges']);
  };

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Back button */}
        <Link to={createPageUrl('Social')}>
          <Button variant="ghost" className="mb-4 hover:bg-purple-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="overflow-hidden mb-6">
          {profileUser?.banner_image ? (
          <div className="h-40 md:h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${profileUser.banner_image})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          </div>
          ) : (
          <div className="h-40 md:h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          </div>
          </div>
          )}
          <div className="px-4 md:px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4 -mt-20 md:-mt-16">
              <div className="relative flex-shrink-0">
                {profileUser?.profile_picture ? (
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                    <img src={profileUser.profile_picture} alt={profileUser.full_name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-2 border-4 border-white shadow-2xl">
                    <PixelAvatar user={profileUser} size="xlarge" showLevel={false} />
                  </div>
                )}
                {/* Level badge on avatar */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-4 border-white" style={{ width: 44, height: 44, fontSize: 16 }}>
                  {profileUser.level || 1}
                </div>
              </div>
              <div className="flex-1 min-w-0 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">{profileUser.display_name || profileUser.full_name}</h1>
                  {profileUser.role === 'admin' && (
                    <Badge className="bg-purple-100 text-purple-700 flex-shrink-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {profileUser.is_premium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white flex-shrink-0">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                {profileUser.username && (
                  <p className="text-purple-600 font-semibold text-sm">@{profileUser.username}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Miembro desde {format(new Date(profileUser.created_date), "MMMM yyyy", { locale: es })}
                </p>
                {profileUser.bio && (
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed">{profileUser.bio}</p>
                )}
                {profileUser.is_private && (
                  <Badge className="mt-2 bg-gray-100 text-gray-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Perfil Privado
                  </Badge>
                )}

                {/* Interests */}
                {profileUser.interests && profileUser.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {profileUser.interests.map((interest, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Featured Badges */}
                {featuredBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {featuredBadges.map(ub => (
                      <BadgeDisplay 
                        key={ub.badge_id} 
                        badge={ub.badge} 
                        userBadge={ub}
                        size="small"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" onClick={() => setShowProfileEditor(true)} className="flex-1 sm:flex-none">
                    <Settings className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" onClick={() => setShowBadgeSelector(true)} className="flex-1 sm:flex-none">
                    <Award className="w-4 h-4 mr-2" />
                    Placas
                  </Button>
                  <Link to={createPageUrl('Avatar')} className="flex-1 sm:flex-none">
                    <Button variant="outline" className="w-full bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-300 text-violet-700 hover:bg-violet-100">
                      <User className="w-4 h-4 mr-2" />
                      Avatar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const username = profileUser.username || profileUser.email;
                      const profileUrl = `${window.location.origin}${createPageUrl('Profile')}?user=${encodeURIComponent(username)}`;
                      navigator.clipboard.writeText(profileUrl);
                      toast.success('Link copiado al portapapeles');
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </>
              ) : (
                <>
                  {friendRequestStatus === 'none' && (
                    <Button
                      onClick={() => sendFriendRequestMutation.mutate()}
                      disabled={sendFriendRequestMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex-1 sm:flex-none"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Agregar Amigo
                    </Button>
                  )}
                  {friendRequestStatus === 'pending' && (
                    <Button variant="outline" disabled className="flex-1 sm:flex-none">
                      <Clock className="w-4 h-4 mr-2" />
                      Solicitud Enviada
                    </Button>
                  )}
                  {friendRequestStatus === 'friends' && (
                    <Button variant="outline" disabled className="flex-1 sm:flex-none">
                      <Users className="w-4 h-4 mr-2 text-green-500" />
                      Amigos
                    </Button>
                  )}
                  {!profileUser.is_premium && (
                    <Button 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600 shadow-lg flex-1 sm:flex-none"
                      onClick={() => setShowGiftPremiumModal(true)}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Regalar Premium</span>
                      <span className="sm:hidden">Premium</span>
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const username = profileUser.username || profileUser.email;
                      const profileUrl = `${window.location.origin}${createPageUrl('Profile')}?user=${encodeURIComponent(username)}`;
                      const message = `🌟 Mira el perfil de ${profileUser.full_name} en Habalyze: ${profileUrl}`;
                      
                      if (navigator.share) {
                        navigator.share({
                          title: `Perfil de ${profileUser.full_name}`,
                          text: message,
                          url: profileUrl
                        }).then(() => {
                          toast.success('Perfil compartido');
                        }).catch(() => {
                          navigator.clipboard.writeText(profileUrl);
                          toast.success('Link copiado');
                        });
                      } else {
                        navigator.clipboard.writeText(profileUrl);
                        toast.success('Link copiado');
                      }
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Stats - Only show if profile is not hidden */}
        {!isProfileHidden && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {habitsLoading ? '...' : habits.length}
                </p>
                <p className="text-xs text-gray-600">Hábitos</p>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {habitsLoading ? '...' : totalCompletions}
                </p>
                <p className="text-xs text-gray-600">Completados</p>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {habitsLoading ? '...' : bestStreak}
                </p>
                <p className="text-xs text-gray-600">Mejor Racha</p>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{friendCount}</p>
                <p className="text-xs text-gray-600">Amigos</p>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {projectsLoading ? '...' : completedProjects}
                </p>
                <p className="text-xs text-gray-600">Proyectos</p>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-pink-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{profileUser.level || 1}</p>
                <p className="text-xs text-gray-600">Nivel</p>
              </div>
            </Card>
          </div>
        </motion.div>
        )}

        {/* Tabs - Only show if profile is not hidden */}
        {!isProfileHidden && (
        <Tabs defaultValue="badges" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="badges" className="text-xs">
              <Award className="w-4 h-4 mr-1" />
              Placas
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Zap className="w-4 h-4 mr-1" />
              Actividad
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">
              <MessageCircle className="w-4 h-4 mr-1" />
              Comentarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-4">
            {badgesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {userBadgesWithData.map((ub, index) => (
                  <motion.div
                    key={ub.badge_id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <BadgeDisplay 
                      badge={ub.badge} 
                      userBadge={ub}
                      size="large"
                      showDetails={true}
                      isOwner={isOwnProfile}
                      onToggleFeatured={async () => {
                        await db.entities.UserBadge.update(ub.id, { is_featured: !ub.is_featured });
                        queryClient.invalidateQueries(['user-badges']);
                      }}
                    />
                  </motion.div>
                ))}
                {userBadgesWithData.length === 0 && (
                  <motion.div 
                    className="col-span-full text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Award className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 font-medium">
                      {isOwnProfile ? 'Aún no has desbloqueado placas' : 'Este usuario no tiene placas desbloqueadas'}
                    </p>
                    {isOwnProfile && (
                      <p className="text-sm text-gray-500 mt-2">¡Completa hábitos y desafíos para ganar placas!</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="space-y-4">
              {/* Summary stats */}
              <motion.div 
                className="grid grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-gray-800 truncate">
                        {habitsLoading ? '...' : habits.length}
                      </p>
                      <p className="text-xs text-gray-600">Hábitos</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Flame className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-gray-800 truncate">
                        {habitsLoading ? '...' : bestStreak}
                      </p>
                      <p className="text-xs text-gray-600">Mejor racha</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-gray-800 truncate">
                        {projectsLoading ? '...' : completedProjects}
                      </p>
                      <p className="text-xs text-gray-600">Proyectos</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Activity feed */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Actividad Reciente
                </h3>
                <div className="space-y-3">
                  {userActivities.length === 0 ? (
                    <motion.div 
                      className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Zap className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-600 font-medium">
                        {isOwnProfile ? 'Aún no tienes actividad' : 'Este usuario no tiene actividad reciente'}
                      </p>
                      {isOwnProfile && (
                        <p className="text-sm text-gray-500 mt-2">¡Completa hábitos para generar actividad!</p>
                      )}
                    </motion.div>
                  ) : (
                    userActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <Card className="p-4 border-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg hover:scale-[1.02] transition-all">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                              <span className="text-2xl">{activity.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: es })}
                                </span>
                              </div>
                              <p className="font-semibold text-gray-800 text-sm mb-1">{activity.title}</p>
                              <p className="text-xs text-gray-600 leading-relaxed">{activity.description}</p>
                              
                              {!isOwnProfile && currentUser && (
                                <div className="mt-2">
                                  <ProfileActivityReactions activityId={activity.id} currentUser={currentUser} />
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <ProfileComments 
              comments={comments}
              currentUser={currentUser}
              isOwnProfile={isOwnProfile}
              onAddComment={(content) => addCommentMutation.mutate(content)}
              isSubmitting={addCommentMutation.isPending}
              allUsers={allUsers}
            />
          </TabsContent>
        </Tabs>
        )}

      </div>

      {/* Dialogs */}
      {isOwnProfile && (
        <>
          <ProfileEditor
            user={profileUser}
            open={showProfileEditor}
            onOpenChange={setShowProfileEditor}
            onSave={handleSaveProfile}
          />
          <BadgeSelector
            open={showBadgeSelector}
            onOpenChange={setShowBadgeSelector}
            userBadges={userBadges}
            allBadges={allBadges}
            featuredBadgeIds={userBadges.filter(ub => ub.is_featured).map(ub => ub.badge_id)}
            onSave={handleSaveFeaturedBadges}
          />
        </>
      )}

      <GiftPremiumDialog
        open={showGiftPremiumModal}
        onOpenChange={setShowGiftPremiumModal}
        recipientUser={profileUser}
        currentUser={currentUser}
      />
    </div>
  );
}