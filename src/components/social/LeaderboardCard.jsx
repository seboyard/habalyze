import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Flame, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import PixelAvatar from '../avatar/PixelAvatar';

const rankIcons = {
  1: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  2: { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-300' },
  3: { icon: Award, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-300' },
};

export default function LeaderboardCard({ user, rank, metric, isCurrentUser }) {
  const rankStyle = rankIcons[rank];
  const RankIcon = rankStyle?.icon;

  const getMetricValue = () => {
    switch (metric) {
      case 'xp':
        return user.experience || 0;
      case 'level':
        return user.level || 1;
      case 'streak':
        return user.current_streak || 0;
      case 'coins':
        return user.coins || 0;
      default:
        return 0;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'xp':
        return 'XP';
      case 'level':
        return 'Nivel';
      case 'streak':
        return 'Racha';
      case 'coins':
        return 'Monedas';
      default:
        return '';
    }
  };

  const getMetricIcon = () => {
    switch (metric) {
      case 'xp':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'level':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'coins':
        return <span className="text-amber-500">💰</span>;
      default:
        return null;
    }
  };

  return (
    <Link to={`${createPageUrl('Profile')}?user=${encodeURIComponent(user.username || user.email)}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.05 }}
      >
        <Card className={`p-3 hover:shadow-lg transition-all cursor-pointer ${
          isCurrentUser ? 'ring-2 ring-purple-500 bg-purple-50' : ''
        } ${rankStyle ? `border-2 ${rankStyle.border} ${rankStyle.bg}` : ''}`}>
          <div className="flex items-center gap-3">
            {/* Rank */}
            <div className="flex-shrink-0">
              {rankStyle ? (
                <div className={`w-10 h-10 rounded-full ${rankStyle.bg} border-2 ${rankStyle.border} flex items-center justify-center`}>
                  <RankIcon className={`w-5 h-5 ${rankStyle.color}`} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                  {rank}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
              ) : (
                <div className="bg-white rounded-full border-2 border-purple-200 p-0.5">
                  <PixelAvatar user={user} size="small" showLevel={false} showCoins={false} />
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800 truncate">{user.display_name || user.full_name}</p>
                {isCurrentUser && (
                  <Badge className="bg-purple-500 text-white text-xs">Tú</Badge>
                )}
              </div>
              {user.username && (
                <p className="text-xs text-purple-600">@{user.username}</p>
              )}
            </div>

            {/* Metric */}
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
              {getMetricIcon()}
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">{getMetricValue()}</p>
                <p className="text-[10px] text-gray-500">{getMetricLabel()}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}