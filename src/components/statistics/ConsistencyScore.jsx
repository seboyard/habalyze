import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

export default function ConsistencyScore({ habits, logs }) {
  // Calculate various metrics
  const totalHabits = habits.length;
  const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
  const avgStreak = totalHabits > 0 
    ? Math.round(habits.reduce((sum, h) => sum + (h.current_streak || 0), 0) / totalHabits)
    : 0;
  const maxStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);

  // Calculate consistency score (0-100)
  const consistencyScore = Math.min(100, Math.round(
    (avgStreak * 10) + // Weight average streak
    (Math.min(maxStreak / 30, 1) * 30) + // Max streak bonus
    (Math.min(totalCompletions / 100, 1) * 30) + // Total completions bonus
    (Math.min(totalHabits / 5, 1) * 10) // Diversity bonus
  ));

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return { gradient: 'from-green-500 to-emerald-600', text: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { gradient: 'from-blue-500 to-cyan-600', text: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 40) return { gradient: 'from-yellow-500 to-orange-600', text: 'text-orange-600', bg: 'bg-orange-50' };
    return { gradient: 'from-red-500 to-pink-600', text: 'text-red-600', bg: 'bg-red-50' };
  };

  const scoreColor = getScoreColor(consistencyScore);

  // Get rating text
  const getRating = (score) => {
    if (score >= 80) return '¡Excepcional! 🏆';
    if (score >= 60) return 'Muy Bueno 💪';
    if (score >= 40) return 'En Progreso 📈';
    return 'Empezando 🌱';
  };

  const metrics = [
    { 
      icon: TrendingUp, 
      label: 'Racha Promedio', 
      value: avgStreak, 
      unit: 'días',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      icon: Target, 
      label: 'Mejor Racha', 
      value: maxStreak, 
      unit: 'días',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      icon: Zap, 
      label: 'Completaciones', 
      value: totalCompletions, 
      unit: 'total',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      icon: Award, 
      label: 'Hábitos Activos', 
      value: totalHabits, 
      unit: 'hábitos',
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="font-bold text-lg mb-6 text-gray-800">
        🎯 Puntuación de Consistencia
      </h3>

      <div className="flex flex-col items-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative"
        >
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="12"
            />
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - consistencyScore / 100)}`}
              transform="rotate(-90 90 90)"
              initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - consistencyScore / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={scoreColor.gradient.split(' ')[0].replace('from-', '')} />
                <stop offset="100%" className={scoreColor.gradient.split(' ')[1].replace('to-', '')} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className={`text-4xl font-bold ${scoreColor.text}`}>
                {consistencyScore}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {getRating(consistencyScore)}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${metric.bg} rounded-xl p-4 border border-gray-200`}
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className="text-xs text-gray-600 font-medium">{metric.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </span>
              <span className="text-xs text-gray-500">{metric.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}