import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Flame, CheckCircle2, Target, Clock } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function GoalDetailDialog({ open, onOpenChange, goal, habits, logs, onUpdate, calculateProgress }) {
  if (!goal) return null;

  const progress = calculateProgress(goal);
  const associatedHabits = habits.filter(h => goal.associated_habit_ids?.includes(h.id));
  const daysLeft = differenceInDays(parseISO(goal.end_date), new Date());
  
  const habitStats = associatedHabits.map(habit => {
    const habitLogs = logs.filter(log => log.habit_id === habit.id);
    return {
      ...habit,
      logsCount: habitLogs.length,
      lastLog: habitLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]
    };
  });

  const colorGradients = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  const handleMarkComplete = () => {
    onUpdate({
      status: 'completed',
      is_completed: true,
      completion_date: new Date().toISOString()
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorGradients[goal.color]} flex items-center justify-center shadow-lg`}>
              <span className="text-3xl">{goal.icon}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{goal.title}</DialogTitle>
              <p className="text-gray-500">{goal.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress Section */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Progreso General</h3>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-4 mb-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  Inicio: {format(parseISO(goal.start_date), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}
                </span>
              </div>
            </div>
          </Card>

          {/* Goal Info */}
          <div className="flex gap-3">
            {goal.target_type === 'days' && (
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                <Calendar className="w-4 h-4 mr-2" />
                Meta: {goal.target_value} días activos
              </Badge>
            )}
            {goal.target_type === 'completions' && (
              <Badge className="bg-green-100 text-green-700 px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Meta: {goal.target_value} completaciones
              </Badge>
            )}
            {goal.target_type === 'streak' && (
              <Badge className="bg-orange-100 text-orange-700 px-4 py-2">
                <Flame className="w-4 h-4 mr-2" />
                Meta: Racha de {goal.target_value} días
              </Badge>
            )}
          </div>

          {/* Associated Habits */}
          <div>
            <h3 className="font-bold text-lg mb-3">Hábitos Asociados ({associatedHabits.length})</h3>
            <div className="space-y-2">
              {habitStats.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{habit.name}</h4>
                        {habit.description && (
                          <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {habit.current_streak > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            <Flame className="w-3 h-3 mr-1" />
                            {habit.current_streak}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {habit.total_completions || 0}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {goal.status === 'active' && progress >= 100 && (
            <Button
              onClick={handleMarkComplete}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              size="lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Marcar como Completado
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}