import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Award } from 'lucide-react';

export default function StreakHistory({ habits }) {
  const sortedByStreak = [...habits].sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0));
  const sortedByBest = [...habits].sort((a, b) => (b.best_streak || 0) - (a.best_streak || 0));

  const colorMap = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="shadow-lg border-2 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-600" />
            Rachas Actuales
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {sortedByStreak.slice(0, 5).map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white border-2 border-gray-100 hover:border-orange-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[habit.color]} flex items-center justify-center text-white font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{habit.name}</p>
                    <p className="text-xs text-gray-500">Racha actual</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-orange-600 font-bold text-xl">
                  <Flame className="w-5 h-5" />
                  {habit.current_streak || 0}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2 border-amber-200">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-amber-600" />
            Mejores Rachas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {sortedByBest.slice(0, 5).map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white border-2 border-gray-100 hover:border-amber-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[habit.color]} flex items-center justify-center text-white font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{habit.name}</p>
                    <p className="text-xs text-gray-500">Récord personal</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-600 font-bold text-xl">
                  <TrendingUp className="w-5 h-5" />
                  {habit.best_streak || 0}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}