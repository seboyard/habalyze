import React from 'react';
import { Card } from '@/components/ui/card';
import { Target, Flame, Users, Trophy, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileStats({ habits, completions, bestStreak, friends, projects, level }) {
  const stats = [
    { icon: Target, label: 'Hábitos', value: habits, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Zap, label: 'Completados', value: completions, color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Flame, label: 'Mejor Racha', value: bestStreak, color: 'text-orange-600', bg: 'bg-orange-100' },
    { icon: Users, label: 'Amigos', value: friends, color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: Trophy, label: 'Proyectos', value: projects, color: 'text-amber-600', bg: 'bg-amber-100' },
    { icon: Star, label: 'Nivel', value: level, color: 'text-pink-600', bg: 'bg-pink-100' },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-3 text-center">
            <div className={`w-8 h-8 mx-auto rounded-full ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}