import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserMinus, MessageCircle, Flame, Trophy, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PixelAvatar from '../avatar/PixelAvatar';

export default function FriendsList({ friends, onRemoveFriend, onChatFriend }) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500">No tienes amigos todavía</p>
        <p className="text-sm text-gray-400 mt-1">Busca usuarios y envía solicitudes de amistad</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map((friend, index) => (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 hover:shadow-lg transition-all border-2 border-gray-100 hover:border-violet-200">
            <Link to={`${createPageUrl('Profile')}/@${friend.username || friend.email.split('@')[0]}`} className="flex items-center gap-3 mb-3">
              {friend.profile_picture ? (
                <img src={friend.profile_picture} alt={friend.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
              ) : (
                <PixelAvatar user={friend} size="small" showLevel={true} showCoins={false} />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{friend.full_name}</h3>
                {friend.username && (
                  <p className="text-xs text-purple-600">@{friend.username}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    Nivel {friend.level || 1}
                  </span>
                  {friend.current_streak > 0 && (
                    <span className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-3 h-3" />
                      {friend.current_streak}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">XP</p>
                <p className="font-bold text-purple-600 text-sm">{friend.experience || 0}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">Monedas</p>
                <p className="font-bold text-amber-600 text-sm">{friend.coins || 0}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">Racha</p>
                <p className="font-bold text-orange-600 text-sm">{friend.best_streak || 0}🔥</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 border-violet-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChatFriend && onChatFriend(friend);
                }}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveFriend(friend);
                }}
              >
                <UserMinus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}