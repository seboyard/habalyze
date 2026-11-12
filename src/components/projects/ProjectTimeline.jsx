import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, Circle, Lock, Star, Settings, ArrowDown, Coins
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProjectTimeline({ tasks, onCompleteTask }) {
  const phases = [...new Set(tasks.map(t => t.phase || 'General'))];

  return (
    <div className="relative">
      {phases.map((phase, phaseIndex) => {
        const phaseTasks = tasks.filter(t => (t.phase || 'General') === phase);
        const phaseCompleted = phaseTasks.filter(t => t.status === 'completed').length;
        const phaseProgress = phaseTasks.length > 0 
          ? Math.round((phaseCompleted / phaseTasks.length) * 100) 
          : 0;

        return (
          <div key={phase} className="mb-8">
            {/* Phase Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                phaseProgress === 100 ? "bg-green-500" :
                phaseProgress > 0 ? "bg-purple-500" : "bg-gray-400"
              )}>
                {phaseProgress === 100 ? '✓' : phaseIndex + 1}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{phase}</h3>
                <p className="text-xs text-gray-500">
                  {phaseCompleted}/{phaseTasks.length} tareas completadas
                </p>
              </div>
              <div className="ml-auto">
                <Badge className={cn(
                  phaseProgress === 100 ? "bg-green-100 text-green-700" :
                  phaseProgress > 0 ? "bg-purple-100 text-purple-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  {phaseProgress}%
                </Badge>
              </div>
            </div>

            {/* Tasks */}
            <div className="ml-5 pl-5 border-l-2 border-gray-200 space-y-4">
              {phaseTasks.map((task, index) => (
                <TimelineTask
                  key={task.id}
                  task={task}
                  index={index}
                  isLast={index === phaseTasks.length - 1}
                  onComplete={() => onCompleteTask(task)}
                  allTasks={tasks}
                />
              ))}
            </div>

            {/* Phase connector */}
            {phaseIndex < phases.length - 1 && (
              <div className="flex justify-center py-4">
                <ArrowDown className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TimelineTask({ task, index, isLast, onComplete, allTasks }) {
  const isLocked = task.status === 'locked';
  const isCompleted = task.status === 'completed';
  
  const dependentTasks = (task.depends_on || [])
    .map(order => allTasks.find(t => t.order === order))
    .filter(Boolean);
  
  const unmetDependencies = dependentTasks.filter(t => t.status !== 'completed');

  const getIcon = () => {
    if (isCompleted) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (isLocked) return <Lock className="w-5 h-5 text-gray-400" />;
    if (task.is_milestone) return <Star className="w-5 h-5 text-amber-500" />;
    if (task.is_setup) return <Settings className="w-5 h-5 text-blue-500" />;
    return <Circle className="w-5 h-5 text-purple-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      {/* Connector dot */}
      <div className={cn(
        "absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white",
        isCompleted ? "bg-green-500" :
        isLocked ? "bg-gray-400" :
        task.is_milestone ? "bg-amber-500" :
        task.is_setup ? "bg-blue-500" :
        "bg-purple-500"
      )} />

      <Card className={cn(
        "p-4 transition-all",
        isCompleted ? "bg-green-50 border-green-200" :
        isLocked ? "bg-gray-50 border-gray-200 opacity-60" :
        task.is_milestone ? "bg-amber-50 border-amber-200" :
        task.is_setup ? "bg-blue-50 border-blue-200" :
        "bg-white hover:border-purple-300 hover:shadow-md"
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={cn(
                "font-medium",
                isCompleted && "line-through text-gray-500"
              )}>
                {task.title}
              </h4>
              {task.is_milestone && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">Hito</Badge>
              )}
              {task.is_setup && (
                <Badge className="bg-blue-100 text-blue-700 text-xs">Setup</Badge>
              )}
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}

            {isLocked && unmetDependencies.length > 0 && (
              <p className="text-xs text-orange-600 mt-2">
                ⏳ Primero: {unmetDependencies.map(t => t.title).join(', ')}
              </p>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-500" />
                  +{task.reward_coins || 10}
                </span>
                <span>+{task.reward_xp || 20} XP</span>
              </div>
              
              {!isCompleted && !isLocked && (
                <Button 
                  size="sm" 
                  onClick={onComplete}
                  className="h-7 text-xs bg-purple-500 hover:bg-purple-600"
                >
                  Completar
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}