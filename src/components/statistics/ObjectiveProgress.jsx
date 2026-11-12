import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, TrendingUp, Flame, FolderKanban, Trophy } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function ObjectiveProgress({ goals, habits, projects, logs, calculateProgress }) {
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const typeIcons = {
    days: Calendar,
    completions: TrendingUp,
    streak: Flame,
    projects: FolderKanban
  };

  return (
    <Card className="p-6 h-full bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Target className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="font-bold text-lg text-gray-800">Objetivos</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{activeGoals.length}</p>
          <p className="text-xs text-gray-600">Activos</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
          <p className="text-xs text-gray-600">Completados</p>
        </div>
      </div>

      {activeGoals.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <p className="text-sm font-semibold text-gray-700 mb-2">Objetivos en Progreso:</p>
          {activeGoals.map(goal => {
            const progress = calculateProgress ? calculateProgress(goal) : 0;
            const daysLeft = differenceInDays(parseISO(goal.end_date), new Date());
            const Icon = typeIcons[goal.target_type] || Target;
            
            return (
              <div key={goal.id} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-xl">{goal.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Icon className="w-3 h-3 mr-1" />
                          {goal.target_value}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {daysLeft > 0 ? `${daysLeft}d` : 'Vencido'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
        </div>
      )}

      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay objetivos aún</p>
        </div>
      )}
    </Card>
  );
}