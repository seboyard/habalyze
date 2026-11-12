import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, Clock, Lock, Play, Star, Settings, 
  Coins, Lightbulb, GripVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const columns = [
  { id: 'locked', title: '🔒 Bloqueadas', color: 'bg-gray-100', border: 'border-gray-300' },
  { id: 'pending', title: '📋 Pendientes', color: 'bg-blue-50', border: 'border-blue-300' },
  { id: 'in_progress', title: '🔄 En Progreso', color: 'bg-amber-50', border: 'border-amber-300' },
  { id: 'completed', title: '✅ Completadas', color: 'bg-green-50', border: 'border-green-300' },
];

export default function ProjectKanban({ tasks, onCompleteTask, onStartTask }) {
  const getTasksByStatus = (status) => {
    if (status === 'pending') {
      return tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
    }
    return tasks.filter(t => t.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4">
      {columns.filter(col => col.id !== 'in_progress').map(column => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div key={column.id} className={cn("rounded-xl p-3 min-h-[300px]", column.color)}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 text-sm">{column.title}</h3>
              <Badge variant="outline" className="text-xs">
                {columnTasks.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {columnTasks.map((task, index) => (
                <KanbanCard 
                  key={task.id}
                  task={task}
                  index={index}
                  onComplete={() => onCompleteTask(task)}
                  onStart={() => onStartTask?.(task)}
                  allTasks={tasks}
                />
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Sin tareas
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ task, index, onComplete, onStart, allTasks }) {
  const isLocked = task.status === 'locked';
  const isCompleted = task.status === 'completed';
  
  const dependentTasks = (task.depends_on || [])
    .map(order => allTasks.find(t => t.order === order))
    .filter(Boolean);
  
  const unmetDependencies = dependentTasks.filter(t => t.status !== 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn(
        "p-3 cursor-pointer hover:shadow-md transition-all border-l-4",
        isCompleted ? "border-l-green-500 bg-green-50/50" :
        isLocked ? "border-l-gray-400 opacity-60" :
        task.is_milestone ? "border-l-amber-500" :
        task.is_setup ? "border-l-blue-500" :
        "border-l-purple-500"
      )}>
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : isLocked ? (
              <Lock className="w-4 h-4 text-gray-400" />
            ) : task.is_milestone ? (
              <Star className="w-4 h-4 text-amber-500" />
            ) : task.is_setup ? (
              <Settings className="w-4 h-4 text-blue-500" />
            ) : (
              <Clock className="w-4 h-4 text-purple-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium text-sm",
              isCompleted && "line-through text-gray-500"
            )}>
              {task.title}
            </p>
            
            {task.phase && (
              <Badge variant="outline" className="text-[10px] mt-1">
                {task.phase}
              </Badge>
            )}
            
            {isLocked && unmetDependencies.length > 0 && (
              <p className="text-[10px] text-orange-600 mt-1">
                ⏳ Espera: {unmetDependencies[0]?.title}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                <Coins className="w-3 h-3 text-amber-500" />
                {task.reward_coins || 10}
              </span>
              
              {!isCompleted && !isLocked && (
                <Button 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); onComplete(); }}
                  className="h-6 text-[10px] ml-auto bg-purple-500 hover:bg-purple-600"
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