import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trophy, Settings, Calendar, Coins, Star, SkipForward } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProjectTaskHistory({ tasks }) {
  // Filter completed and skipped tasks
  const completedTasks = tasks
    .filter(t => t.status === 'completed' || t.status === 'skipped')
    .sort((a, b) => {
      // Sort by completed_date descending (most recent first)
      const dateA = a.completed_date ? new Date(a.completed_date) : new Date(0);
      const dateB = b.completed_date ? new Date(b.completed_date) : new Date(0);
      return dateB - dateA;
    });

  // Group by date
  const groupedByDate = completedTasks.reduce((acc, task) => {
    const date = task.completed_date || 'Sin fecha';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort((a, b) => {
    if (a === 'Sin fecha') return 1;
    if (b === 'Sin fecha') return -1;
    return new Date(b) - new Date(a);
  });

  if (completedTasks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="font-medium text-gray-600 mb-1">Sin tareas completadas</h3>
        <p className="text-sm text-gray-400">
          Las tareas que completes aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-green-600">Completadas</p>
              <p className="text-lg font-bold text-green-700">
                {completedTasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs text-amber-600">Hitos</p>
              <p className="text-lg font-bold text-amber-700">
                {completedTasks.filter(t => t.is_milestone && t.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2">
            <SkipForward className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Saltadas</p>
              <p className="text-lg font-bold text-gray-600">
                {completedTasks.filter(t => t.status === 'skipped').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {dates.map((date, dateIndex) => (
          <motion.div 
            key={date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dateIndex * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                {date !== 'Sin fecha' 
                  ? format(new Date(date), "EEEE, d 'de' MMMM", { locale: es })
                  : date
                }
              </span>
              <Badge variant="outline" className="ml-auto text-xs">
                {groupedByDate[date].length} tarea{groupedByDate[date].length > 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="space-y-2 ml-6 border-l-2 border-gray-200 pl-4">
              {groupedByDate[date].map((task, taskIndex) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dateIndex * 0.1 + taskIndex * 0.05 }}
                >
                  <Card className={cn(
                    "p-3 transition-all",
                    task.status === 'skipped' 
                      ? "bg-gray-50 border-gray-200 opacity-60" 
                      : task.is_milestone 
                        ? "bg-amber-50 border-amber-200" 
                        : "bg-white"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        task.status === 'skipped'
                          ? "bg-gray-200"
                          : task.is_milestone 
                            ? "bg-amber-100" 
                            : task.is_setup 
                              ? "bg-blue-100" 
                              : "bg-green-100"
                      )}>
                        {task.status === 'skipped' ? (
                          <SkipForward className="w-4 h-4 text-gray-500" />
                        ) : task.is_milestone ? (
                          <Trophy className="w-4 h-4 text-amber-600" />
                        ) : task.is_setup ? (
                          <Settings className="w-4 h-4 text-blue-600" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium text-sm",
                            task.status === 'skipped' && "line-through text-gray-400"
                          )}>
                            {task.title}
                          </span>
                          {task.is_milestone && task.status !== 'skipped' && (
                            <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                              Hito
                            </Badge>
                          )}
                          {task.is_setup && task.status !== 'skipped' && (
                            <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                              Setup
                            </Badge>
                          )}
                          {task.status === 'skipped' && (
                            <Badge variant="outline" className="text-[10px]">
                              Saltada
                            </Badge>
                          )}
                        </div>
                        {task.phase && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Fase: {task.phase}
                          </p>
                        )}
                      </div>
                      {task.status === 'completed' && (task.reward_coins || task.reward_xp) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {task.reward_coins > 0 && (
                            <span className="flex items-center gap-1">
                              <Coins className="w-3 h-3 text-amber-500" />
                              +{task.reward_coins}
                            </span>
                          )}
                          {task.reward_xp > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-purple-500" />
                              +{task.reward_xp}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total rewards earned */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recompensas totales ganadas</h4>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-amber-600">
              +{completedTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.reward_coins || 0), 0)}
            </span>
            <span className="text-sm text-gray-500">monedas</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-purple-600">
              +{completedTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.reward_xp || 0), 0)}
            </span>
            <span className="text-sm text-gray-500">XP</span>
          </div>
        </div>
      </Card>
    </div>
  );
}