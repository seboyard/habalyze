import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function CompletionSummary({ habits, allLogs }) {
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

  const totalHabits = habits.length;
  const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
  const activeHabits = habits.filter(h => (h.current_streak || 0) > 0).length;
  
  const completionRate = totalHabits > 0 ? ((totalCompletions / (totalHabits * 30)) * 100).toFixed(1) : 0;

  const categoryData = habits.reduce((acc, habit) => {
    const emoji = iconMap[habit.icon] || '⭐';
    if (!acc[habit.icon]) {
      acc[habit.icon] = { name: habit.name.split(' ')[0], count: 0, color: habit.color, emoji };
    }
    acc[habit.icon].count += habit.total_completions || 0;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([icon, data]) => ({
    name: `${data.emoji} ${data.name}`,
    value: data.count
  }));

  const COLORS = ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6'];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="shadow-lg border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Resumen General
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completadas Totales</p>
                  <p className="text-2xl font-bold text-green-700">{totalCompletions}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Hábitos Activos</p>
                  <p className="text-2xl font-bold text-blue-700">{activeHabits} / {totalHabits}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">%</div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de Cumplimiento</p>
                  <p className="text-2xl font-bold text-purple-700">{completionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-lg">Distribución por Hábito</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Sin datos disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}