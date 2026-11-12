import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Zap, Target, Flame, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

import LeaderboardCard from '../components/social/LeaderboardCard';

export default function LeaderboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [metric, setMetric] = useState('xp');
  const [view, setView] = useState('global'); // 'global' or 'friends'

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['leaderboard-users'],
    queryFn: async () => {
      const response = await db.functions.invoke('listAllUsers');
      return response.data.users || [];
    },
    enabled: !!currentUser,
    staleTime: 60000,
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUser?.email],
    queryFn: () => db.entities.Friendship.list(),
    enabled: !!currentUser,
    staleTime: 60000,
  });

  const friendEmails = friendships
    .filter(f => f.user1_email === currentUser?.email || f.user2_email === currentUser?.email)
    .map(f => f.user1_email === currentUser?.email ? f.user2_email : f.user1_email);

  const displayUsers = view === 'friends' 
    ? allUsers.filter(u => friendEmails.includes(u.email) || u.email === currentUser?.email)
    : allUsers;

  const sortedUsers = [...displayUsers].sort((a, b) => {
    switch (metric) {
      case 'xp':
        return (b.experience || 0) - (a.experience || 0);
      case 'level':
        return (b.level || 1) - (a.level || 1);
      case 'streak':
        return (b.current_streak || 0) - (a.current_streak || 0);
      case 'coins':
        return (b.coins || 0) - (a.coins || 0);
      default:
        return 0;
    }
  });

  const currentUserRank = sortedUsers.findIndex(u => u.email === currentUser?.email) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Link to={createPageUrl('Social')}>
          <Button variant="ghost" className="mb-4 hover:bg-purple-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Ranking
              </h1>
              <p className="text-gray-600">Compite con la comunidad</p>
            </div>
          </div>

          {currentUserRank > 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Tu posición actual</p>
                  <p className="text-3xl font-bold">#{currentUserRank}</p>
                </div>
                <Trophy className="w-12 h-12 opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === 'global' ? 'default' : 'outline'}
            onClick={() => setView('global')}
            className={view === 'global' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Global
          </Button>
          <Button
            variant={view === 'friends' ? 'default' : 'outline'}
            onClick={() => setView('friends')}
            className={view === 'friends' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Amigos
          </Button>
        </div>

        {/* Metric tabs */}
        <Tabs value={metric} onValueChange={setMetric} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="xp" className="text-xs">
              <Zap className="w-4 h-4 mr-1" />
              XP
            </TabsTrigger>
            <TabsTrigger value="level" className="text-xs">
              <Target className="w-4 h-4 mr-1" />
              Nivel
            </TabsTrigger>
            <TabsTrigger value="streak" className="text-xs">
              <Flame className="w-4 h-4 mr-1" />
              Racha
            </TabsTrigger>
            <TabsTrigger value="coins" className="text-xs">
              💰 Monedas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando ranking...</p>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay usuarios en el ranking</p>
            <p className="text-sm text-gray-400 mt-2">Vista: {view} - Métrica: {metric}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedUsers.slice(0, 50).map((user, index) => (
              <LeaderboardCard
                key={user.id}
                user={user}
                rank={index + 1}
                metric={metric}
                isCurrentUser={user.email === currentUser?.email}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}