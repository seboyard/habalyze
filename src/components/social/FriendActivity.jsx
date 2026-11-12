import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ActivityComments from './ActivityComments';

const activityConfig = {
  habit_completed: {
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100'
  },
  challenge_joined: {
    bg: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100'
  },
  achievement_unlocked: {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100'
  },
  streak_milestone: {
    bg: 'from-orange-50 to-red-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100'
  },
  level_up: {
    bg: 'from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100'
  },
  project_started: {
    bg: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100'
  },
  project_completed: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100'
  },
  milestone_completed: {
    bg: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-100'
  },
  ranking_surpassed: {
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    iconBg: 'bg-pink-100'
  },
  challenge_invite: {
    bg: 'from-cyan-50 to-blue-50',
    border: 'border-cyan-200',
    iconBg: 'bg-cyan-100'
  }
};

export default function FriendActivityFeed({ activities, isOwnActivity = false, currentUser, showComments = false }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500">
          {isOwnActivity ? 'Aún no tienes actividad registrada' : 'No hay actividad reciente de tus amigos'}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {isOwnActivity 
            ? 'Tu actividad aparecerá cuando completes hábitos, proyectos o logros'
            : 'La actividad aparecerá cuando tus amigos completen hábitos o desafíos'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const config = activityConfig[activity.activity_type] || activityConfig.habit_completed;
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`p-4 border-2 bg-gradient-to-r ${config.bg} ${config.border} ${isOwnActivity ? 'ring-2 ring-purple-200' : ''}`}>
              <div className="flex items-start gap-3">
                {/* Avatar with activity icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {activity.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${config.iconBg} border-2 border-white flex items-center justify-center shadow-sm`}>
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-sm">
                      {isOwnActivity ? 'Tú' : activity.user_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: es })}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-700 text-sm mb-1">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.description}</p>

                  {/* Comments section */}
                  {showComments && currentUser && (
                    <ActivityComments activityId={activity.id} currentUser={currentUser} />
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}