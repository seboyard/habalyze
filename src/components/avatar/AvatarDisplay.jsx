import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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

export default function AvatarDisplay({ user, size = 'large', showLevel = true }) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-48 h-48'
  };

  const avatarUrl = `https://api.dicebear.com/7.x/${user?.avatar_style || 'adventurer'}/svg?seed=${user?.avatar_seed || 'default'}&backgroundColor=${user?.avatar_color || 'purple'}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colorMap[user?.avatar_color || 'purple']} p-1 shadow-xl`}>
          <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden">
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {showLevel && (
          <motion.div 
            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            {user?.level || 1}
          </motion.div>
        )}
      </motion.div>
      {showLevel && (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Nivel {user?.level || 1}
        </div>
      )}
    </div>
  );
}