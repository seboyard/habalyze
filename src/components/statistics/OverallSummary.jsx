import React from 'react';
import { Card } from '@/components/ui/card';
import { Flame, Target, FolderKanban, Trophy, TrendingUp, Calendar } from 'lucide-react';

export default function OverallSummary({ habits, projects, goals }) {
  const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
  const activeHabits = habits.filter(h => h.is_active).length;
  const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  const stats = [
    { label: 'Hábitos Activos', value: activeHabits, icon: Target, color: 'from-purple-500 to-purple-600', bgColor: 'from-purple-50 to-purple-100' },
    { label: 'Total Completaciones', value: totalCompletions, icon: TrendingUp, color: 'from-blue-500 to-blue-600', bgColor: 'from-blue-50 to-blue-100' },
    { label: 'Mejor Racha', value: bestStreak, icon: Flame, color: 'from-orange-500 to-orange-600', bgColor: 'from-orange-50 to-orange-100' },
    { label: 'Proyectos Activos', value: activeProjects, icon: FolderKanban, color: 'from-cyan-500 to-cyan-600', bgColor: 'from-cyan-50 to-cyan-100' },
    { label: 'Proyectos Completados', value: completedProjects, icon: Trophy, color: 'from-green-500 to-green-600', bgColor: 'from-green-50 to-green-100' },
    { label: 'Objetivos', value: `${activeGoals}/${completedGoals}`, icon: Calendar, color: 'from-pink-500 to-pink-600', bgColor: 'from-pink-50 to-pink-100' },
  ];

  return (
    <Card className="p-4 md:p-6 h-full bg-white border-2 border-gray-200 shadow-lg">
      <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        Resumen General
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.bgColor} p-4 rounded-xl border-2 border-gray-200`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Missing import
import { BarChart3 } from 'lucide-react';