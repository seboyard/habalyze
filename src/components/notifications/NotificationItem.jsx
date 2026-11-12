import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import PixelAvatar from '../avatar/PixelAvatar';

const typeConfig = {
  habit_reminder: {
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  challenge_new: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  challenge_joined: {
    bg: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  achievement_unlocked: {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  reward_claimed: {
    bg: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  friend_activity: {
    bg: 'from-pink-50 to-purple-50',
    border: 'border-pink-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  streak_milestone: {
    bg: 'from-orange-50 to-red-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  level_up: {
    bg: 'from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  }
};

export default function NotificationItem({ notification, index, onClick, onDelete, onMarkAsRead, relatedUser }) {
  const config = typeConfig[notification.type] || typeConfig.habit_reminder;
  const timeAgo = formatDistanceToNow(new Date(notification.created_date), { addSuffix: true, locale: es });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card
        className={cn(
          "p-4 transition-all cursor-pointer hover:shadow-md border-2",
          config.border,
          notification.is_read ? "bg-white opacity-70" : cn("bg-gradient-to-r", config.bg)
        )}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative",
            config.iconBg
          )}>
            {relatedUser && (notification.type === 'friend_activity' || notification.type === 'challenge_joined') ? (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-white">
                  <PixelAvatar user={relatedUser} size="tiny" showLevel={false} showCoins={false} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs">
                  {notification.icon}
                </div>
              </>
            ) : (
              <span className="text-2xl">{notification.icon}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                "font-bold text-sm",
                notification.is_read ? "text-gray-600" : "text-gray-800"
              )}>
                {notification.title}
              </h3>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
              )}
            </div>

            <p className={cn(
              "text-sm mb-2",
              notification.is_read ? "text-gray-500" : "text-gray-700"
            )}>
              {notification.message}
            </p>

            <p className="text-xs text-gray-400">{timeAgo}</p>
          </div>

          <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-green-600"
                onClick={() => onMarkAsRead()}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-600"
              onClick={() => onDelete()}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}