import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, Circle, Star, Lock, Settings, Repeat, CalendarDays,
  Lightbulb, Coins, ChevronRight, Trash2, Zap, Filter, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const typeConfig = {
  setup: { icon: Settings, color: 'blue', label: '⚙️ Setup', desc: 'Solo una vez' },
  milestone: { icon: Star, color: 'amber', label: '🏆 Hito', desc: 'Logro importante' },
  daily: { icon: Repeat, color: 'green', label: '🔄 Diario', desc: 'Repetir cada día' },
  weekly: { icon: CalendarDays, color: 'purple', label: '📅 Semanal', desc: 'Cada semana' },
  'one-time': { icon: Circle, color: 'gray', label: '✓ Una vez', desc: 'Se elimina al completar' },
};

export default function ProjectTaskList({ 
  tasks, 
  onCompleteTask, 
  onSkipTask,
  onAssignTask,
  onDeleteTask,
  showCompleted = false,
  compact = false,
  advancedMode = false,
  collaborators = [],
  currentUser
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  
  // Group tasks by phase
  const phases = [...new Set(tasks.map(t => t.phase || 'General'))];
  
  // Get next available task for quick action
  const nextTask = tasks.find(t => t.status === 'pending' || t.status === 'in_progress');
  
  if (compact && nextTask) {
    const config = typeConfig[nextTask.type] || typeConfig['one-time'];
    const TypeIcon = config.icon;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-4 border-2 border-purple-100 hover:border-purple-300 transition-all"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onCompleteTask(nextTask)}
            className="flex-shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                nextTask.is_milestone ? "bg-amber-100" : 
                nextTask.is_setup ? "bg-blue-100" : "bg-purple-100"
              )}
            >
              <TypeIcon className={cn(
                "w-5 h-5",
                nextTask.is_milestone ? "text-amber-600" :
                nextTask.is_setup ? "text-blue-600" : "text-purple-600"
              )} />
            </motion.div>
          </button>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">{nextTask.title}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="outline" className="text-[10px]">{nextTask.phase || 'General'}</Badge>
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-500" />
                +{nextTask.reward_coins || 10}
              </span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={() => onCompleteTask(nextTask)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Zap className="w-4 h-4 mr-1" />
            Completar
          </Button>
        </div>
      </motion.div>
    );
  }

  // Filter tasks
  let visibleTasks = showCompleted 
    ? tasks 
    : tasks.filter(t => t.status !== 'completed');

  // Apply advanced filters
  if (advancedMode) {
    if (statusFilter !== 'all') {
      visibleTasks = visibleTasks.filter(t => t.status === statusFilter);
    }
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        visibleTasks = visibleTasks.filter(t => !t.assigned_to);
      } else {
        visibleTasks = visibleTasks.filter(t => t.assigned_to === assigneeFilter);
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Advanced Filters */}
      {advancedMode && (
        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-xl border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filtros:</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="locked">Bloqueada</SelectItem>
            </SelectContent>
          </Select>
          
          {collaborators.length > 0 && (
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Asignado a" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
                {collaborators.map(c => (
                  <SelectItem key={c.user_email} value={c.user_email}>
                    {c.user_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {phases.map(phase => {
        const phaseTasks = visibleTasks.filter(t => (t.phase || 'General') === phase);
        if (phaseTasks.length === 0) return null;
        
        const phaseAllTasks = tasks.filter(t => (t.phase || 'General') === phase);
        const phaseCompleted = phaseAllTasks.filter(t => t.status === 'completed').length;
        const phaseProgress = phaseAllTasks.length > 0 
          ? Math.round((phaseCompleted / phaseAllTasks.length) * 100) 
          : 0;
        
        return (
          <div key={phase}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  {phase}
                </Badge>
                <span className="text-xs text-gray-500">
                  {phaseCompleted}/{phaseAllTasks.length}
                </span>
              </div>
              <div className="w-24">
                <Progress value={phaseProgress} className="h-1.5" />
              </div>
            </div>
            
            <div className="space-y-2 pl-3 border-l-2 border-gray-200">
              <AnimatePresence mode="popLayout">
                {phaseTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    allTasks={tasks}
                    onComplete={() => onCompleteTask(task)}
                    onSkip={() => onSkipTask?.(task)}
                    onAssign={onAssignTask}
                    onDelete={onDeleteTask}
                    advancedMode={advancedMode}
                    collaborators={collaborators}
                    currentUser={currentUser}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskItem({ task, index, allTasks, onComplete, onSkip, onAssign, onDelete, advancedMode, collaborators, currentUser }) {
  const config = typeConfig[task.type] || typeConfig['one-time'];
  const TypeIcon = config.icon;
  const isLocked = task.status === 'locked';
  const isCompleted = task.status === 'completed';
  
  // Get dependency names
  const dependentTasks = (task.depends_on || [])
    .map(order => allTasks.find(t => t.order === order))
    .filter(Boolean);
  
  const unmetDependencies = dependentTasks.filter(t => t.status !== 'completed');
  
  // Determine if this is a "deletable" task (one-time, not milestone)
  const willBeDeleted = task.type === 'one-time' && !task.is_milestone && !task.is_setup;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "p-4 rounded-xl border-2 transition-all",
        isCompleted 
          ? "bg-green-50 border-green-200" 
          : isLocked
            ? "bg-gray-50 border-gray-200 opacity-60"
            : task.is_milestone 
              ? "bg-amber-50 border-amber-200"
              : task.is_setup
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onComplete}
          disabled={isLocked}
          className={cn("mt-0.5 flex-shrink-0", isLocked && "cursor-not-allowed")}
        >
          <motion.div whileHover={!isLocked ? { scale: 1.1 } : {}} whileTap={!isLocked ? { scale: 0.9 } : {}}>
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : isLocked ? (
              <Lock className="w-6 h-6 text-gray-400" />
            ) : task.is_milestone ? (
              <Star className="w-6 h-6 text-amber-500" />
            ) : (
              <TypeIcon className={cn("w-6 h-6", `text-${config.color}-500`, "hover:text-purple-600")} />
            )}
          </motion.div>
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "font-medium",
              isCompleted && "line-through text-gray-500"
            )}>
              {task.title}
            </h4>
            {task.is_milestone && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">🏆 Hito</Badge>
            )}
            {task.is_setup && (
              <Badge className="bg-blue-100 text-blue-700 text-xs">⚙️ Setup</Badge>
            )}
            {task.type === 'daily' && !task.is_setup && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                <Repeat className="w-3 h-3 mr-1" /> Diario
              </Badge>
            )}
            {task.type === 'weekly' && (
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                <CalendarDays className="w-3 h-3 mr-1" /> Semanal
              </Badge>
            )}
            {willBeDeleted && !isCompleted && (
              <Badge variant="outline" className="text-[10px] text-gray-500">
                <Trash2 className="w-2 h-2 mr-1" /> Se elimina al completar
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}

          {/* Assigned user */}
          {task.assigned_to && (
            <div className="flex items-center gap-1 mt-2">
              <User className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-purple-600">{task.assigned_to_name || task.assigned_to}</span>
            </div>
          )}

          {isLocked && unmetDependencies.length > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>Primero: {unmetDependencies.map(t => t.title).join(', ')}</span>
            </div>
          )}
          
          {task.tips && !isLocked && !isCompleted && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-purple-50 rounded-lg">
              <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-700">{task.tips}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-500" />
                +{task.reward_coins || 10}
              </span>
              <span>+{task.reward_xp || 20} XP</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Assign task (advanced mode) */}
              {advancedMode && !isCompleted && collaborators.length > 0 && onAssign && (
                <Select 
                  value={task.assigned_to || ''} 
                  onValueChange={(value) => onAssign(task, value)}
                >
                  <SelectTrigger className="h-6 w-28 text-[10px]">
                    <SelectValue placeholder="Asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Sin asignar</SelectItem>
                    {collaborators.map(c => (
                      <SelectItem key={c.user_email} value={c.user_email}>
                        {c.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {!isCompleted && !isLocked && onSkip && task.type !== 'milestone' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onSkip}
                  className="text-xs text-gray-400 hover:text-gray-600 h-6 px-2"
                >
                  Saltar
                </Button>
              )}
              
              {/* Delete task button (advanced mode only) */}
              {advancedMode && onDelete && !isCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('¿Eliminar esta tarea permanentemente?')) {
                      onDelete(task.id);
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-600 h-6 px-2"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}