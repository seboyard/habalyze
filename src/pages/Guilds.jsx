import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, Crown, Shield, Star, Trophy, Search, Plus, Settings,
  TrendingUp, Target, Medal, UserPlus, LogOut, ChevronRight,
  MessageCircle, Heart, Send, Sparkles
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import PixelAvatar from '../components/avatar/PixelAvatar';

const bannerColors = [
  { id: 'purple', color: 'from-violet-500 to-purple-600' },
  { id: 'blue', color: 'from-blue-500 to-cyan-500' },
  { id: 'green', color: 'from-green-500 to-emerald-500' },
  { id: 'orange', color: 'from-orange-500 to-amber-500' },
  { id: 'pink', color: 'from-pink-500 to-rose-500' },
  { id: 'red', color: 'from-red-500 to-orange-500' },
];

const guildIcons = ['⚔️', '🛡️', '🏰', '🐉', '🦁', '🦅', '🌟', '💎', '🔥', '⚡', '📚', '💪', '🧘', '🎨', '🎯', '🌱'];

const themeConfig = {
  fitness: { label: 'Fitness & Salud', icon: '💪', color: 'from-orange-500 to-red-500' },
  learning: { label: 'Aprendizaje', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  creativity: { label: 'Creatividad', icon: '🎨', color: 'from-pink-500 to-purple-500' },
  mindfulness: { label: 'Mindfulness', icon: '🧘', color: 'from-green-500 to-teal-500' },
  productivity: { label: 'Productividad', icon: '🎯', color: 'from-indigo-500 to-purple-500' },
  health: { label: 'Salud', icon: '🌱', color: 'from-emerald-500 to-green-500' },
  social: { label: 'Social', icon: '💬', color: 'from-violet-500 to-fuchsia-500' },
  finance: { label: 'Finanzas', icon: '💰', color: 'from-yellow-500 to-amber-500' },
  general: { label: 'General', icon: '⚡', color: 'from-gray-500 to-slate-500' }
};

const postTypeIcons = {
  achievement: '🏆',
  question: '❓',
  tip: '💡',
  motivation: '🔥',
  celebration: '🎉'
};

export default function GuildsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGuild, setNewGuild] = useState({ name: '', description: '', icon: '⚔️', banner_color: 'purple', theme: 'general' });
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('motivation');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: guilds = [] } = useQuery({
    queryKey: ['guilds'],
    queryFn: () => db.entities.Guild.list('-total_xp', 50),
  });

  const { data: myMembership } = useQuery({
    queryKey: ['my-guild-membership', currentUser?.email],
    queryFn: () => db.entities.GuildMember.filter({ user_email: currentUser?.email }),
    enabled: !!currentUser,
  });

  const { data: guildMembers = [] } = useQuery({
    queryKey: ['guild-members', myMembership?.[0]?.guild_id],
    queryFn: () => db.entities.GuildMember.filter({ guild_id: myMembership?.[0]?.guild_id }, '-contribution_xp'),
    enabled: !!myMembership?.[0]?.guild_id,
  });

  const { data: guildPosts = [] } = useQuery({
    queryKey: ['guild-posts', myMembership?.[0]?.guild_id],
    queryFn: () => db.entities.GuildPost.filter({ guild_id: myMembership?.[0]?.guild_id }, '-created_date', 20),
    enabled: !!myMembership?.[0]?.guild_id,
  });

  const myGuild = guilds.find(g => g.guild_id === myMembership?.[0]?.guild_id);

  const createGuildMutation = useMutation({
    mutationFn: async (guildData) => {
      const guildId = `guild_${Date.now()}`;
      await db.entities.Guild.create({
        ...guildData,
        guild_id: guildId,
        leader_email: currentUser.email,
        member_count: 1,
        total_xp: 0,
        level: 1,
        weekly_progress: 0,
        is_public: true
      });
      await db.entities.GuildMember.create({
        guild_id: guildId,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        role: 'leader',
        contribution_xp: 0,
        weekly_contribution: 0,
        joined_date: new Date().toISOString().split('T')[0]
      });
      return guildId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['my-guild-membership']);
      setShowCreateDialog(false);
      setNewGuild({ name: '', description: '', icon: '⚔️', banner_color: 'purple', theme: 'general' });
      toast.success('¡Gremio creado exitosamente!');
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      await db.entities.GuildPost.create({
        guild_id: myGuild.guild_id,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        content: newPost,
        post_type: postType,
        likes: 0,
        comments_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guild-posts']);
      setNewPost('');
      toast.success('Publicación compartida');
    }
  });

  const joinGuildMutation = useMutation({
    mutationFn: async (guild) => {
      await db.entities.GuildMember.create({
        guild_id: guild.guild_id,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        role: 'member',
        contribution_xp: 0,
        weekly_contribution: 0,
        joined_date: new Date().toISOString().split('T')[0]
      });
      await db.entities.Guild.update(guild.id, {
        member_count: (guild.member_count || 1) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['my-guild-membership']);
      toast.success('¡Te has unido al gremio!');
    }
  });

  const leaveGuildMutation = useMutation({
    mutationFn: async () => {
      const membership = myMembership?.[0];
      if (!membership) return;
      
      await db.entities.GuildMember.delete(membership.id);
      const guild = guilds.find(g => g.guild_id === membership.guild_id);
      if (guild) {
        await db.entities.Guild.update(guild.id, {
          member_count: Math.max(0, (guild.member_count || 1) - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['my-guild-membership']);
      toast.success('Has salido del gremio');
    }
  });

  const filteredGuilds = guilds.filter(g => 
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleIcons = {
    leader: <Crown className="w-4 h-4 text-amber-500" />,
    officer: <Shield className="w-4 h-4 text-blue-500" />,
    member: <Star className="w-4 h-4 text-gray-400" />
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gremios</h1>
                <p className="text-purple-200 text-sm">Únete a una comunidad</p>
              </div>
            </div>
            {!myGuild && (
              <Button onClick={() => setShowCreateDialog(true)} className="bg-white text-purple-600 hover:bg-purple-50">
                <Plus className="w-4 h-4 mr-2" /> Crear Gremio
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs defaultValue={myGuild ? "my-guild" : "explore"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="my-guild" disabled={!myGuild}>Mi Gremio</TabsTrigger>
            <TabsTrigger value="explore">Explorar</TabsTrigger>
          </TabsList>

          {/* My Guild Tab */}
          <TabsContent value="my-guild">
            {myGuild && (
              <div className="space-y-6">
                {/* Guild Card */}
                <Card className="overflow-hidden">
                  <div className={`bg-gradient-to-r ${bannerColors.find(b => b.id === myGuild.banner_color)?.color || 'from-violet-500 to-purple-600'} p-6 text-white`}>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{myGuild.icon}</span>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{myGuild.name}</h2>
                        <p className="text-white/80">{myGuild.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-white/20 text-white">Nivel {myGuild.level}</Badge>
                        <p className="text-sm mt-1">{myGuild.member_count} miembros</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Weekly Goal */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-600" />
                          Meta Semanal
                        </span>
                        <span className="text-sm text-gray-600">
                          {myGuild.weekly_progress} / {myGuild.weekly_goal} XP
                        </span>
                      </div>
                      <Progress value={(myGuild.weekly_progress / myGuild.weekly_goal) * 100} className="h-3" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <p className="text-2xl font-bold text-purple-600">{myGuild.total_xp?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">XP Total</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-xl">
                        <p className="text-2xl font-bold text-amber-600">#{guilds.findIndex(g => g.guild_id === myGuild.guild_id) + 1}</p>
                        <p className="text-xs text-gray-500">Ranking</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">{myMembership?.[0]?.contribution_xp || 0}</p>
                        <p className="text-xs text-gray-500">Mi Aporte</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Guild Feed */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    Feed del Gremio
                  </h3>

                  {/* Create Post */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      {Object.entries(postTypeIcons).map(([type, icon]) => (
                        <button
                          key={type}
                          onClick={() => setPostType(type)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm transition-all",
                            postType === type 
                              ? "bg-purple-600 text-white" 
                              : "bg-white text-gray-600 hover:bg-purple-100"
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Comparte tu progreso, pregunta o motiva a tus compañeros..."
                      className="mb-2 min-h-[80px]"
                    />
                    <Button
                      onClick={() => createPostMutation.mutate()}
                      disabled={!newPost.trim() || createPostMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publicar
                    </Button>
                  </div>

                  {/* Posts Feed */}
                  <div className="space-y-4">
                    {guildPosts.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Aún no hay publicaciones</p>
                        <p className="text-gray-400 text-xs">¡Sé el primero en compartir!</p>
                      </div>
                    ) : (
                      guildPosts.map((post, i) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {post.author_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-800">{post.author_name}</span>
                                <span className="text-2xl">{postTypeIcons[post.post_type]}</span>
                                {post.author_email === currentUser?.email && (
                                  <Badge variant="outline" className="text-xs">Tú</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mb-2">
                                {format(new Date(post.created_date), "d 'de' MMM 'a las' HH:mm", { locale: es })}
                              </p>
                              <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                                  <Heart className="w-4 h-4" />
                                  <span className="text-xs">{post.likes || 0}</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-xs">{post.comments_count || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Members List */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Miembros ({guildMembers.length})
                  </h3>
                  <div className="space-y-3">
                    {guildMembers.map((member, i) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <span className="font-bold text-gray-400 w-6">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {roleIcons[member.role]}
                            <span className="font-medium">{member.user_name}</span>
                            {member.user_email === currentUser?.email && (
                              <Badge variant="outline" className="text-xs">Tú</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">+{member.weekly_contribution || 0} XP esta semana</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{member.contribution_xp || 0}</p>
                          <p className="text-xs text-gray-500">XP total</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {myMembership?.[0]?.role !== 'leader' && (
                    <Button
                      variant="outline"
                      className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => leaveGuildMutation.mutate()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Salir del Gremio
                    </Button>
                  )}
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Explore Tab */}
          <TabsContent value="explore">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar gremios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter by theme */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(themeConfig).slice(0, 6).map(([key, config]) => {
                const count = guilds.filter(g => g.theme === key).length;
                return count > 0 ? (
                  <Badge
                    key={key}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-50 transition-all"
                  >
                    {config.icon} {config.label} ({count})
                  </Badge>
                ) : null;
              })}
            </div>

            {/* Top Guilds */}
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Comunidades Destacadas
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredGuilds.map((guild, i) => {
                const isMember = guild.guild_id === myMembership?.[0]?.guild_id;
                const canJoin = !myGuild && guild.member_count < guild.max_members;
                const theme = themeConfig[guild.theme] || themeConfig.general;
                
                return (
                  <motion.div
                    key={guild.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={cn(
                      "overflow-hidden transition-all hover:shadow-lg",
                      isMember && "ring-2 ring-purple-500"
                    )}>
                      <div className={`bg-gradient-to-r ${bannerColors.find(b => b.id === guild.banner_color)?.color || 'from-violet-500 to-purple-600'} p-4 text-white`}>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{guild.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-bold">{guild.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-white/20 text-white text-xs">
                                {theme.icon} {theme.label}
                              </Badge>
                              <span className="text-xs text-white/80">{guild.member_count}/{guild.max_members}</span>
                            </div>
                          </div>
                          <Badge className="bg-white/20">#{i + 1}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{guild.description || 'Sin descripción'}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500" />
                              Nivel {guild.level}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              {guild.total_xp?.toLocaleString()} XP
                            </span>
                          </div>
                          {isMember ? (
                            <Badge className="bg-purple-100 text-purple-700">Miembro</Badge>
                          ) : canJoin ? (
                            <Button 
                              size="sm" 
                              onClick={() => joinGuildMutation.mutate(guild)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Unirse
                            </Button>
                          ) : (
                            <Badge variant="outline">Lleno</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Guild Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Gremio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre del Gremio</label>
              <Input
                value={newGuild.name}
                onChange={(e) => setNewGuild({ ...newGuild, name: e.target.value })}
                placeholder="Los Conquistadores"
                maxLength={30}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descripción</label>
              <Input
                value={newGuild.description}
                onChange={(e) => setNewGuild({ ...newGuild, description: e.target.value })}
                placeholder="Describe tu gremio..."
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Icono</label>
              <div className="flex flex-wrap gap-2">
                {guildIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewGuild({ ...newGuild, icon })}
                    className={cn(
                      "w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all",
                      newGuild.icon === icon ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tema</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(themeConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setNewGuild({ ...newGuild, theme: key })}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all text-left",
                      newGuild.theme === key 
                        ? "border-purple-500 bg-purple-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="text-lg mb-1">{config.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{config.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Color del Banner</label>
              <div className="flex flex-wrap gap-2">
                {bannerColors.map((bc) => (
                  <button
                    key={bc.id}
                    onClick={() => setNewGuild({ ...newGuild, banner_color: bc.id })}
                    className={cn(
                      `w-10 h-10 rounded-lg bg-gradient-to-r ${bc.color} border-2 transition-all`,
                      newGuild.banner_color === bc.id ? "border-gray-800 scale-110" : "border-transparent"
                    )}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={() => createGuildMutation.mutate(newGuild)}
              disabled={!newGuild.name || createGuildMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
            >
              {createGuildMutation.isPending ? 'Creando...' : 'Crear Gremio'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}