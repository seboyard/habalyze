import React from 'react';
import { Card } from '@/components/ui/card';
import { Target, Award, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function GoalProgress({ habits, logs }) {
  const totalHabits = habits.length;
  const activeToday = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(log => log.completed_date === activeToday);
  const completedToday = todayLogs.length;
  const progressPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  const totalCompletions = logs.length;
  const weeklyGoal = totalHabits * 7;
  const weeklyProgress = weeklyGoal > 0 ? Math.min((totalCompletions / weeklyGoal) * 100, 100) : 0;

  const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
  const streakGoal = 30;
  const streakProgress = (bestStreak / streakGoal) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Progreso de Metas</h3>
      </div>

      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Meta Diaria</span>
            </div>
            <span className="text-sm font-bold text-purple-600">{completedToday}/{totalHabits}</span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-purple-100" />
          <p className="text-xs text-gray-500 mt-1">{progressPercent.toFixed(0)}% completado hoy</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Racha Objetivo (30 días)</span>
            </div>
            <span className="text-sm font-bold text-blue-600">{bestStreak}/30</span>
          </div>
          <Progress value={streakProgress} className="h-3 bg-blue-100" />
          <p className="text-xs text-gray-500 mt-1">{streakProgress.toFixed(0)}% hacia la meta</p>
        </motion.div>
      </div>
    </Card>
  );
}