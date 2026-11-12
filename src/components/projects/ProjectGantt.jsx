import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Lock, Star, Settings, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProjectGantt({ tasks, project, onCompleteTask }) {
  // Group tasks by phase
  const phases = [...new Set(tasks.map(t => t.phase || 'General'))];
  
  // Calculate project timeline
  const startDate = new Date(project.created_date);
  const endDate = project.target_date ? new Date(project.target_date) : addDays(startDate, 30);
  const totalDays = Math.max(differenceInDays(endDate, startDate), 7);
  
  // Distribute tasks across timeline
  const tasksWithPosition = tasks.map((task, index) => {
    const taskStart = Math.floor((index / tasks.length) * totalDays);
    const taskDuration = Math.max(Math.floor(totalDays / tasks.length), 2);
    return {
      ...task,
      startDay: taskStart,
      duration: taskDuration,
      startPercent: (taskStart / totalDays) * 100,
      widthPercent: (taskDuration / totalDays) * 100
    };
  });

  const today = new Date();
  const todayPosition = Math.min(
    Math.max((differenceInDays(today, startDate) / totalDays) * 100, 0),
    100
  );

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex">
          {[...Array(Math.min(totalDays, 30))].map((_, i) => {
            const date = addDays(startDate, Math.floor(i * totalDays / 30));
            const isWeekStart = date.getDay() === 1;
            return (
              <div 
                key={i}
                className={cn(
                  "flex-1 border-r border-gray-200 flex items-end justify-center pb-1",
                  isWeekStart && "bg-gray-200/50"
                )}
              >
                {i % 5 === 0 && (
                  <span className="text-[10px] text-gray-500">
                    {format(date, 'd MMM', { locale: es })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Today marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${todayPosition}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded">
            Hoy
          </div>
        </div>
      </div>

      {/* Tasks by Phase */}
      <div className="space-y-6">
        {phases.map(phase => {
          const phaseTasks = tasksWithPosition.filter(t => (t.phase || 'General') === phase);
          
          return (
            <div key={phase}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-medium">
                  {phase}
                </Badge>
                <span className="text-xs text-gray-500">
                  {phaseTasks.filter(t => t.status === 'completed').length}/{phaseTasks.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {phaseTasks.map((task, index) => (
                  <GanttRow 
                    key={task.id}
                    task={task}
                    index={index}
                    onComplete={() => onCompleteTask(task)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" /> Completada
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded" /> Pendiente
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded" /> Hito
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded" /> Setup
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-400 rounded" /> Bloqueada
        </div>
      </div>
    </div>
  );
}

function GanttRow({ task, index, onComplete }) {
  const isLocked = task.status === 'locked';
  const isCompleted = task.status === 'completed';
  
  const barColor = isCompleted ? 'bg-green-500' :
    isLocked ? 'bg-gray-400' :
    task.is_milestone ? 'bg-amber-500' :
    task.is_setup ? 'bg-blue-500' :
    'bg-purple-500';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-3 group"
          >
            {/* Task name */}
            <div className="w-48 flex-shrink-0 flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : isLocked ? (
                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : task.is_milestone ? (
                <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ) : task.is_setup ? (
                <Settings className="w-4 h-4 text-blue-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-purple-500 flex-shrink-0" />
              )}
              <span className={cn(
                "text-sm truncate",
                isCompleted && "line-through text-gray-500"
              )}>
                {task.title}
              </span>
            </div>
            
            {/* Timeline bar */}
            <div className="flex-1 relative h-8 bg-gray-100 rounded overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${task.widthPercent}%` }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className={cn(
                  "absolute h-full rounded cursor-pointer transition-all",
                  barColor,
                  !isLocked && !isCompleted && "hover:opacity-80"
                )}
                style={{ left: `${task.startPercent}%` }}
                onClick={() => !isLocked && !isCompleted && onComplete()}
              >
                {task.is_milestone && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                    <div className="w-4 h-4 bg-amber-500 rotate-45 border-2 border-white" />
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-bold">{task.title}</p>
            {task.description && <p className="text-xs">{task.description}</p>}
            {task.tips && (
              <p className="text-xs text-purple-600">💡 {task.tips}</p>
            )}
            <p className="text-xs text-gray-500">
              +{task.reward_coins || 10} monedas, +{task.reward_xp || 20} XP
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}