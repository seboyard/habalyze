import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Flame, Trophy, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import PixelAvatar from '../avatar/PixelAvatar';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const colorMap = {
  purple: 'from-purple-400 to-purple-600',
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  orange: 'from-orange-400 to-orange-600',
  pink: 'from-pink-400 to-pink-600',
  red: 'from-red-400 to-red-600',
  teal: 'from-teal-400 to-teal-600',
  amber: 'from-amber-400 to-amber-600',
};

export default function UserRankCard({ user, rank, habits, isCurrentUser }) {
  // const avatarUrl = `https://api.dicebear.com/7.x/${user?.avatar_style || 'adventurer'}/svg?seed=${user?.avatar_seed || 'default'}&backgroundColor=${user?.avatar_color || 'purple'}`;
  
  const totalStreak = habits.reduce((sum, habit) => sum + (habit.current_streak || 0), 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.best_streak || 0)) : 0;
  const totalHabits = habits.length;

  const getRankColor = () => {
    if (rank === 1) return 'from-yellow-400 to-amber-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-gray-200 to-gray-300';
  };

  const getRankIcon = () => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-600" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-600" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-600" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <Link to={`${createPageUrl('Profile')}?user=${encodeURIComponent(user?.username || user?.email)}`}>
        <Card className={cn(
          "p-5 transition-all hover:shadow-lg cursor-pointer",
          isCurrentUser ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 border-2" : "bg-white",
          rank <= 3 && "shadow-md"
        )}>
          <div className="flex items-center gap-4">
            {/* Rank Badge */}
            <div className={cn(
              "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0",
              getRankColor(),
              rank <= 3 ? "text-white" : "text-gray-600"
            )}>
              {rank <= 3 ? getRankIcon() : `#${rank}`}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
              ) : (
                <PixelAvatar user={user} size="small" showLevel={true} showCoins={false} />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-800 truncate flex items-center gap-2">
                {user?.full_name || 'Usuario'}
                {isCurrentUser && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Tú
                  </span>
                )}
              </h3>
              {user?.username && (
                <p className="text-xs text-purple-600">@{user.username}</p>
              )}
            <div className="flex items-center gap-4 mt-1 text-sm">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-orange-600">{totalStreak}</span>
                <span className="text-gray-500">días</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-blue-600">{bestStreak}</span>
                <span className="text-gray-500">récord</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-purple-600">{totalHabits}</span>
                <span className="text-gray-500">hábitos</span>
              </div>
            </div>
          </div>

          {/* XP Display */}
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-purple-600">{user?.experience || 0}</p>
            <p className="text-xs text-gray-500">XP Total</p>
          </div>
        </div>
      </Card>
      </Link>
    </motion.div>
  );
}