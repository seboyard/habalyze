import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Activity, Target, Trophy, Zap, FolderKanban, Award, 
  Users, Search, Filter, Clock 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ActivityReactions from './ActivityReactions';
import PixelAvatar from '../avatar/PixelAvatar';

const activityConfig = {
  habit_completed: { icon: Target, color: 'text-green-500', bg: 'bg-green-100', label: 'Completó hábito' },
  streak_milestone: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Racha' },
  achievement_unlocked: { icon: Award, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Logro' },
  project_completed: { icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Proyecto' },
  milestone_completed: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Hito' },
  level_up: { icon: Zap, color: 'text-pink-500', bg: 'bg-pink-100', label: 'Subió nivel' },
  friend_added: { icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-100', label: 'Nuevo amigo' },
  challenge_joined: { icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Desafío' },
};

export default function ActivityFeed({ activities, currentUser, showFilters = true }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');

  // Get unique users from activities
  const uniqueUsers = [...new Set(activities.map(a => a.user_email))];

  const filteredActivities = activities.filter(activity => {
    const typeMatch = typeFilter === 'all' || activity.activity_type === typeFilter;
    const userMatch = !userFilter || 
      activity.user_name?.toLowerCase().includes(userFilter.toLowerCase()) ||
      activity.user_email?.toLowerCase().includes(userFilter.toLowerCase());
    return typeMatch && userMatch;
  });

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por usuario..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las actividades</SelectItem>
              <SelectItem value="habit_completed">Hábitos completados</SelectItem>
              <SelectItem value="streak_milestone">Rachas</SelectItem>
              <SelectItem value="achievement_unlocked">Logros</SelectItem>
              <SelectItem value="project_completed">Proyectos</SelectItem>
              <SelectItem value="milestone_completed">Hitos</SelectItem>
              <SelectItem value="level_up">Subidas de nivel</SelectItem>
              <SelectItem value="friend_added">Nuevos amigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <Card className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay actividad que mostrar</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity, index) => {
            const config = activityConfig[activity.activity_type] || activityConfig.habit_completed;
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="p-4 hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: config.color.replace('text-', '').replace('-500', '') }}>
                  <div className="flex items-start gap-3">
                    <Link to={`${createPageUrl('Profile')}?user=${activity.user_email}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform">
                        {activity.user_name?.charAt(0) || '?'}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link 
                          to={`${createPageUrl('Profile')}?user=${activity.user_email}`}
                          className="font-bold text-gray-800 hover:text-purple-600 transition-colors"
                        >
                          {activity.user_name}
                        </Link>
                        <Badge className={`${config.bg} ${config.color} text-xs`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mt-1">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: es })}
                        </div>
                        {currentUser && activity.user_email !== currentUser.email && (
                          <ActivityReactions 
                            activityId={activity.id} 
                            currentUser={currentUser}
                          />
                        )}
                      </div>
                    </div>
                    <span className="text-2xl">{activity.icon}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}