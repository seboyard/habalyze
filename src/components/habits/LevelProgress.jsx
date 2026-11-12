import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function LevelProgress({ user }) {
  const level = user?.level || 1;
  const experience = user?.experience || 0;
  const xpForNextLevel = level * 100;
  const progress = (experience / xpForNextLevel) * 100;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Nivel {level}</h3>
            <p className="text-sm text-gray-500">¡Sigue así!</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">{experience} XP</p>
          <p className="text-xs text-gray-500">de {xpForNextLevel} XP</p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-3 bg-purple-100" />
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Progreso: {Math.round(progress)}%
          </span>
          <span className="font-medium">{xpForNextLevel - experience} XP para nivel {level + 1}</span>
        </div>
      </div>
    </div>
  );
}