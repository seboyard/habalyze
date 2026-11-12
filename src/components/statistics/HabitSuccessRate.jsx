import React from 'react';
import { Card } from '@/components/ui/card';
import { Award, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function HabitSuccessRate({ habits, logs }) {
  // Calculate success rate per habit
  const habitStats = habits.map(habit => {
    const habitLogs = logs.filter(log => log.habit_id === habit.id);
    const daysSinceCreated = Math.floor((new Date() - new Date(habit.created_date)) / (1000 * 60 * 60 * 24)) + 1;
    const expectedCompletions = daysSinceCreated;
    const actualCompletions = habitLogs.length;
    const successRate = expectedCompletions > 0 ? (actualCompletions / expectedCompletions) * 100 : 0;

    return {
      name: habit.name,
      successRate: Math.min(successRate, 100),
      completions: actualCompletions
    };
  }).sort((a, b) => b.successRate - a.successRate);

  const avgSuccessRate = habitStats.length > 0
    ? habitStats.reduce((sum, h) => sum + h.successRate, 0) / habitStats.length
    : 0;

  const performanceData = [
    { name: 'Excelente (>80%)', value: habitStats.filter(h => h.successRate > 80).length, color: '#10b981' },
    { name: 'Bueno (60-80%)', value: habitStats.filter(h => h.successRate >= 60 && h.successRate <= 80).length, color: '#3b82f6' },
    { name: 'Regular (40-60%)', value: habitStats.filter(h => h.successRate >= 40 && h.successRate < 60).length, color: '#f59e0b' },
    { name: 'Bajo (<40%)', value: habitStats.filter(h => h.successRate < 40).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Tasa de Éxito</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">{avgSuccessRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">Promedio</p>
        </div>
      </div>

      {performanceData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={performanceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {performanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Completa más hábitos para ver estadísticas</p>
        </div>
      )}
    </Card>
  );
}