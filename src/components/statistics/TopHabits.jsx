import React from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Flame, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopHabits({ habits }) {
  const sortedByCompletions = [...habits]
    .sort((a, b) => (b.total_completions || 0) - (a.total_completions || 0))
    .slice(0, 5);

  const iconMap = {
    dumbbell: '💪',
    book: '📚',
    droplet: '💧',
    moon: '🌙',
    utensils: '🍽️',
    heart: '❤️',
    brain: '🧠',
    smile: '😊',
    coffee: '☕',
    music: '🎵',
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Top 5 Hábitos</h3>
      </div>

      <div className="space-y-3">
        {sortedByCompletions.map((habit, index) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-sm">
              {index + 1}
            </div>
            <span className="text-2xl">{iconMap[habit.icon] || '⭐'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{habit.name}</p>
              <p className="text-xs text-gray-500">
                {habit.total_completions || 0} completados • {habit.current_streak || 0} días racha
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}