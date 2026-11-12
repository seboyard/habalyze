import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, Users, BarChart3, Search, Ban, Award, Coins, 
  Crown, ArrowLeft, UserCheck, UserX, TrendingUp, Target,
  Zap, Calendar, FolderKanban, Trophy, Gift, Plus, Edit, Mail,
  Send, Clock, Sparkles, Palette, Bug, MessageCircle
} from 'lucide-react';
import BetaTestersTab from '@/components/admin/BetaTestersTab';
import EmailMarketingTab from '@/components/admin/EmailMarketingTab';
import BrandExportTab from '@/components/admin/BrandExportTab';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [giveItemDialog, setGiveItemDialog] = useState(false);
  const [sendEmailDialog, setSendEmailDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const [emailType, setEmailType] = useState('reactivation');

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
      
      if (user.role !== 'admin') {
        navigate(createPageUrl('Dashboard'));
        toast.error('No tienes permisos para acceder');
      }
    };
    loadUser();
  }, [navigate]);

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => db.entities.User.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: allHabits = [] } = useQuery({
    queryKey: ['admin-habits'],
    queryFn: () => db.entities.Habit.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => db.entities.Project.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => db.entities.Badge.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: allUserBadges = [] } = useQuery({
    queryKey: ['admin-user-badges'],
    queryFn: () => db.entities.UserBadge.list(),
    enabled: currentUser?.role === 'admin',
  });

  const filteredUsers = allUsers.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      await db.entities.User.update(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setEditUserDialog(false);
      toast.success('Usuario actualizado');
    }
  });

  const giveBadgeMutation = useMutation({
    mutationFn: async ({ userEmail, badgeId }) => {
      const existing = allUserBadges.find(ub => ub.user_email === userEmail && ub.badge_id === badgeId);
      if (existing) {
        toast.error('El usuario ya tiene esta placa');
        return;
      }
      await db.entities.UserBadge.create({
        user_email: userEmail,
        badge_id: badgeId,
        current_level: 1,
        current_progress: 1,
        unlocked_date: new Date().toISOString(),
        is_featured: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-user-badges']);
      setGiveItemDialog(false);
      toast.success('Placa otorgada');
    }
  });

  const giveCoinsXPMutation = useMutation({
    mutationFn: async ({ userId, coins, xp, gems }) => {
      const user = allUsers.find(u => u.id === userId);
      if (!user) return;
      
      const newCoins = (user.coins || 0) + (coins || 0);
      const newXP = (user.experience || 0) + (xp || 0);
      const newGems = (user.gems || 0) + (gems || 0);
      
      await db.entities.User.update(userId, {
        coins: newCoins,
        experience: newXP,
        gems: newGems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setGiveItemDialog(false);
      toast.success('Recompensas otorgadas');
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ userEmail, type, daysInactive, boostType }) => {
      if (type === 'reactivation') {
        return await db.functions.invoke('sendReactivationEmail', {
          user_email: userEmail,
          days_inactive: daysInactive || 3
        });
      } else if (type === 'weekly_digest') {
        return await db.functions.invoke('sendWeeklyDigest', {
          user_email: userEmail
        });
      } else if (type === 'motivational') {
        return await db.functions.invoke('sendMotivationalBoost', {
          user_email: userEmail,
          boost_type: boostType || 'general'
        });
      }
    },
    onSuccess: () => {
      setSendEmailDialog(false);
      toast.success('Email enviado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al enviar email: ' + error.message);
    }
  });

  // Get inactive users
  const inactiveUsers = allUsers.filter(u => {
    if (!u.last_login_date) return false;
    const daysSinceLogin = differenceInDays(new Date(), new Date(u.last_login_date));
    return daysSinceLogin >= 3;
  }).sort((a, b) => {
    const daysA = differenceInDays(new Date(), new Date(a.last_login_date));
    const daysB = differenceInDays(new Date(), new Date(b.last_login_date));
    return daysB - daysA;
  });

  // Statistics
  const totalUsers = allUsers.length;
  const premiumUsers = allUsers.filter(u => u.is_premium).length;
  const activeToday = allUsers.filter(u => {
    const lastActive = u.last_login_date ? new Date(u.last_login_date) : null;
    return lastActive && (new Date() - lastActive) < 24 * 60 * 60 * 1000;
  }).length;
  const totalHabits = allHabits.length;
  const totalProjects = allProjects.length;
  const totalCompletions = allHabits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
  const avgLevel = allUsers.length > 0 
    ? (allUsers.reduce((sum, u) => sum + (u.level || 1), 0) / allUsers.length).toFixed(1)
    : 0;
  const totalCoins = allUsers.reduce((sum, u) => sum + (u.coins || 0), 0);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pb-24">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Settings')}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                <p className="text-gray-400">Gestiona usuarios y estadísticas</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('BrandStudio')}>
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg">
                <Palette className="w-4 h-4 mr-2" />
                Brand Studio
              </Button>
            </Link>
            <Badge className="bg-red-500 text-white px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              ADMIN
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            { label: 'Usuarios', value: totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Premium', value: premiumUsers, icon: Crown, color: 'from-amber-500 to-orange-500' },
            { label: 'Activos Hoy', value: activeToday, icon: UserCheck, color: 'from-green-500 to-emerald-500' },
            { label: 'Hábitos', value: totalHabits, icon: Target, color: 'from-purple-500 to-pink-500' },
            { label: 'Proyectos', value: totalProjects, icon: FolderKanban, color: 'from-indigo-500 to-violet-500' },
            { label: 'Completaciones', value: totalCompletions, icon: Zap, color: 'from-yellow-500 to-amber-500' },
            { label: 'Nivel Prom.', value: avgLevel, icon: TrendingUp, color: 'from-teal-500 to-cyan-500' },
            { label: 'Monedas Tot.', value: totalCoins.toLocaleString(), icon: Coins, color: 'from-rose-500 to-pink-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-2`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-white/20 text-white">
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-white/20 text-white">
              <Clock className="w-4 h-4 mr-2" />
              Inactivos ({inactiveUsers.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-white/20 text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-white/20 text-white">
              <Award className="w-4 h-4 mr-2" />
              Placas
            </TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-white/20 text-white">
              <Mail className="w-4 h-4 mr-2" />
              Email Marketing
            </TabsTrigger>
            <TabsTrigger value="beta" className="data-[state=active]:bg-white/20 text-white">
              <Bug className="w-4 h-4 mr-2" />
              Beta Testers
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-white/20 text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Coach
            </TabsTrigger>
            <TabsTrigger value="brand" className="data-[state=active]:bg-white/20 text-white">
              <Palette className="w-4 h-4 mr-2" />
              Brand Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, email o @usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {usersLoading ? (
                  <div className="text-center py-8 text-gray-400">Cargando...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No se encontraron usuarios</div>
                ) : (
                  filteredUsers.map(user => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                            {user.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white">{user.full_name || 'Sin nombre'}</h3>
                              {user.role === 'admin' && (
                                <Badge className="bg-red-500 text-white text-xs">Admin</Badge>
                              )}
                              {user.is_premium && (
                                <Badge className="bg-amber-500 text-white text-xs">Premium</Badge>
                              )}
                              {user.is_banned && (
                                <Badge className="bg-gray-500 text-white text-xs">Baneado</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            {user.username && (
                              <p className="text-xs text-purple-400">@{user.username}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white font-bold">Nivel {user.level || 1}</p>
                            <p className="text-xs text-gray-400">
                              💰 {user.coins || 0} | 💎 {user.gems || 0}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10"
                              onClick={() => {
                                setSelectedUser(user);
                                setEditData({
                                  role: user.role || 'user',
                                  is_premium: user.is_premium || false,
                                  is_banned: user.is_banned || false
                                });
                                setEditUserDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => {
                                setSelectedUser(user);
                                setEditData({ coins: 0, xp: 0, gems: 0, badgeId: '' });
                                setGiveItemDialog(true);
                              }}
                            >
                              <Gift className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => {
                                setSelectedUser(user);
                                setSendEmailDialog(true);
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inactive">
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Usuarios Inactivos (3+ días sin login)</h3>
                <Badge className="bg-orange-500 text-white">{inactiveUsers.length} usuarios</Badge>
              </div>

              {inactiveUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">¡Todos los usuarios están activos!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {inactiveUsers.map(user => {
                    const daysInactive = differenceInDays(new Date(), new Date(user.last_login_date));
                    return (
                      <div key={user.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white">{user.full_name}</h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <Badge className={`mt-2 ${
                              daysInactive >= 14 ? 'bg-red-500' : daysInactive >= 7 ? 'bg-orange-500' : 'bg-yellow-500'
                            } text-white text-xs`}>
                              {daysInactive} días inactivo
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => {
                                setSelectedUser(user);
                                setEmailType('reactivation');
                                setEditData({ daysInactive });
                                setSendEmailDialog(true);
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Reactivar
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Distribución por Nivel</h3>
                <div className="space-y-2">
                  {[1, 5, 10, 20, 50].map(level => {
                    const count = allUsers.filter(u => (u.level || 1) >= level).length;
                    const pct = totalUsers > 0 ? (count / totalUsers * 100).toFixed(0) : 0;
                    return (
                      <div key={level} className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Nivel {level}+</span>
                        <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-white font-bold w-16 text-right">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Top Usuarios por XP</h3>
                <div className="space-y-3">
                  {allUsers
                    .sort((a, b) => (b.experience || 0) - (a.experience || 0))
                    .slice(0, 10)
                    .map((user, i) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-white/20'
                        } text-white`}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-white truncate">{user.full_name}</span>
                        <span className="text-purple-400 font-bold">{(user.experience || 0).toLocaleString()} XP</span>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Top por Rachas</h3>
                <div className="space-y-3">
                  {allUsers
                    .map(user => {
                      const userHabits = allHabits.filter(h => h.created_by === user.email);
                      const bestStreak = Math.max(...userHabits.map(h => h.best_streak || 0), 0);
                      return { ...user, bestStreak };
                    })
                    .sort((a, b) => b.bestStreak - a.bestStreak)
                    .slice(0, 10)
                    .map((user, i) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔥'}</span>
                        <span className="flex-1 text-white truncate">{user.full_name}</span>
                        <span className="text-orange-400 font-bold">{user.bestStreak} días</span>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Referidos Top</h3>
                <div className="space-y-3">
                  {allUsers
                    .filter(u => (u.referral_count || 0) > 0)
                    .sort((a, b) => (b.referral_count || 0) - (a.referral_count || 0))
                    .slice(0, 10)
                    .map((user, i) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <span className="text-2xl">📣</span>
                        <span className="flex-1 text-white truncate">{user.full_name}</span>
                        <span className="text-green-400 font-bold">{user.referral_count} referidos</span>
                      </div>
                    ))}
                  {allUsers.filter(u => (u.referral_count || 0) > 0).length === 0 && (
                    <p className="text-gray-400 text-center py-4">No hay referidos aún</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Placas del Sistema</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allBadges.map(badge => {
                  const usersWithBadge = allUserBadges.filter(ub => ub.badge_id === badge.badge_id).length;
                  return (
                    <div key={badge.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <h4 className="font-bold text-white">{badge.name}</h4>
                      <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                      <Badge className="bg-purple-500/20 text-purple-300">
                        {usersWithBadge} usuarios
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <EmailMarketingTab allUsers={allUsers} />
          </TabsContent>
          <TabsContent value="beta">
            <BetaTestersTab />
          </TabsContent>

          <TabsContent value="brand">
            <BrandExportTab />
          </TabsContent>

          <TabsContent value="whatsapp">
            <div className="space-y-6">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Coach IA en WhatsApp</h2>
                    <p className="text-gray-400">Conecta a los usuarios con el coach personal desde WhatsApp</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">¿Cómo conectar?</h3>
                    <ol className="space-y-3">
                      {[
                        { step: '1', text: 'El usuario va a Configuración → Integraciones', icon: '⚙️' },
                        { step: '2', text: 'Toca "Conectar WhatsApp"', icon: '📱' },
                        { step: '3', text: 'Se abre WhatsApp con un mensaje pre-escrito al Coach', icon: '💬' },
                        { step: '4', text: 'El coach queda disponible 24/7 para recordatorios y análisis', icon: '🤖' },
                      ].map(item => (
                        <li key={item.step} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                          <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{item.step}</span>
                          <span className="text-gray-300 text-sm">{item.icon} {item.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Capacidades del Coach en WhatsApp</h3>
                    <div className="space-y-2">
                      {[
                        { emoji: '✅', text: 'Marcar hábitos completados con lenguaje natural' },
                        { emoji: '📊', text: 'Análisis de rendimiento semanal/mensual' },
                        { emoji: '⏰', text: 'Recordatorios proactivos de hábitos pendientes' },
                        { emoji: '⏩', text: 'Posponer hábitos con confirmación' },
                        { emoji: '🧠', text: 'Recomendación contextual de Unveil (Animamind)' },
                        { emoji: '🎯', text: 'Crear y gestionar hábitos desde WhatsApp' },
                        { emoji: '💪', text: 'Celebración de rachas y logros' },
                        { emoji: '📈', text: 'Reportes de progreso semanales automáticos' },
                      ].map((cap, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span>{cap.emoji}</span>
                          <span>{cap.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">🔗 Link de conexión para usuarios</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Comparte este link con los usuarios para que conecten el Coach IA a su WhatsApp:
                </p>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-300 font-mono text-sm break-all">
                    {db.agents.getWhatsAppConnectURL('habit_coach')}
                  </p>
                </div>
                <Button
                  className="mt-3 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    navigator.clipboard.writeText(db.agents.getWhatsAppConnectURL('habit_coach'));
                    toast.success('Link copiado');
                  }}
                >
                  Copiar link de WhatsApp
                </Button>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">🌀 Integración con Unveil (Animamind)</h3>
                <p className="text-gray-300 text-sm mb-4">
                  El Coach detecta automáticamente cuando un usuario menciona ansiedad, estrés, relaciones o bienestar mental profundo, y después de 14+ días de uso activo recomienda proactivamente Unveil como herramienta complementaria.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: 'Trigger automático', value: '14+ días de uso', icon: '📅' },
                    { label: 'Trigger contextual', value: 'Menciona estrés/ansiedad', icon: '🧠' },
                    { label: 'No repite', value: 'Se registra en preferencias', icon: '✅' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl text-center">
                      <p className="text-2xl mb-1">{item.icon}</p>
                      <p className="text-white font-semibold text-sm">{item.label}</p>
                      <p className="text-gray-400 text-xs">{item.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Usuario: {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Rol</label>
              <Select value={editData.role} onValueChange={(v) => setEditData({ ...editData, role: v })}>
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span>Premium</span>
              <Button
                variant={editData.is_premium ? "default" : "outline"}
                size="sm"
                onClick={() => setEditData({ ...editData, is_premium: !editData.is_premium })}
                className={editData.is_premium ? "bg-amber-500" : ""}
              >
                {editData.is_premium ? 'Sí' : 'No'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-400">Baneado</span>
              <Button
                variant={editData.is_banned ? "destructive" : "outline"}
                size="sm"
                onClick={() => setEditData({ ...editData, is_banned: !editData.is_banned })}
              >
                {editData.is_banned ? 'Sí' : 'No'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => updateUserMutation.mutate({ userId: selectedUser?.id, data: editData })}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Give Items Dialog */}
      <Dialog open={giveItemDialog} onOpenChange={setGiveItemDialog}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Dar Recompensa a: {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Monedas</label>
                <Input
                  type="number"
                  value={editData.coins || 0}
                  onChange={(e) => setEditData({ ...editData, coins: parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">XP</label>
                <Input
                  type="number"
                  value={editData.xp || 0}
                  onChange={(e) => setEditData({ ...editData, xp: parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Gemas</label>
                <Input
                  type="number"
                  value={editData.gems || 0}
                  onChange={(e) => setEditData({ ...editData, gems: parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Dar Placa</label>
              <Select value={editData.badgeId} onValueChange={(v) => setEditData({ ...editData, badgeId: v })}>
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue placeholder="Seleccionar placa..." />
                </SelectTrigger>
                <SelectContent>
                  {allBadges.map(badge => (
                    <SelectItem key={badge.badge_id} value={badge.badge_id}>
                      {badge.icon} {badge.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiveItemDialog(false)}>Cancelar</Button>
            {(editData.coins > 0 || editData.xp > 0 || editData.gems > 0) && (
              <Button 
                onClick={() => giveCoinsXPMutation.mutate({ 
                  userId: selectedUser?.id, 
                  coins: editData.coins, 
                  xp: editData.xp,
                  gems: editData.gems 
                })}
                className="bg-green-500 hover:bg-green-600"
              >
                Dar Monedas/XP/Gemas
              </Button>
            )}
            {editData.badgeId && (
              <Button 
                onClick={() => giveBadgeMutation.mutate({ 
                  userEmail: selectedUser?.email, 
                  badgeId: editData.badgeId 
                })}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Dar Placa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={sendEmailDialog} onOpenChange={setSendEmailDialog}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar Email a: {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Tipo de Email</label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reactivation">🔄 Reactivación (usuarios inactivos)</SelectItem>
                  <SelectItem value="weekly_digest">📊 Resumen Semanal</SelectItem>
                  <SelectItem value="motivational">💪 Motivacional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {emailType === 'reactivation' && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Días de Inactividad</label>
                <Input
                  type="number"
                  value={editData.daysInactive || 3}
                  onChange={(e) => setEditData({ ...editData, daysInactive: parseInt(e.target.value) || 3 })}
                  className="bg-white/10 border-white/20"
                  placeholder="3, 5, 10..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  El mensaje se personaliza según días: 1-3 (early), 4-7 (medium), 8+ (long-term)
                </p>
              </div>
            )}

            {emailType === 'motivational' && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Tipo de Boost</label>
                <Select value={editData.boostType || 'general'} onValueChange={(v) => setEditData({ ...editData, boostType: v })}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">💬 General (motivación diaria)</SelectItem>
                    <SelectItem value="streak_broken">💔 Racha Rota (recuperación)</SelectItem>
                    <SelectItem value="milestone_approaching">🎯 Cerca de Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
              <p className="text-sm text-blue-300">
                ℹ️ Vista previa del email: diseño con gradientes de marca, stats personales del usuario, CTA claro y mensaje del Coach IA.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendEmailDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => sendEmailMutation.mutate({ 
                userEmail: selectedUser?.email, 
                type: emailType,
                daysInactive: editData.daysInactive,
                boostType: editData.boostType
              })}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={sendEmailMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {sendEmailMutation.isPending ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}