import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  pending: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Pendiente' },
  in_progress: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'En curso' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Completada' },
  missed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Perdida' }
};

export default function WeeklyProgressBar({ 
  project, 
  currentWeekStatus, 
  onPreviousWeek, 
  onNextWeek,
  selectedWeekNumber,
  canGoPrevious,
  canGoNext
}) {
  if (!project.weekly_tracking_enabled || !currentWeekStatus) {
    return null;
  }

  const config = statusConfig[currentWeekStatus.status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.bg)}>
            <Icon className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">
              Semana {selectedWeekNumber} de {project.total_weeks}
            </h3>
            <p className="text-xs text-gray-500">
              {format(new Date(currentWeekStatus.start_date), "d MMM", { locale: es })} - {format(new Date(currentWeekStatus.end_date), "d MMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={cn(config.bg, config.color)}>
            {config.label}
          </Badge>
          <Badge variant="outline">
            {currentWeekStatus.tasks_completed_count}/{currentWeekStatus.total_tasks_count} tareas
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progreso semanal</span>
          <span className="font-bold text-purple-600">{currentWeekStatus.progress_percentage}%</span>
        </div>
        <Progress value={currentWeekStatus.progress_percentage} className="h-2" />
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousWeek}
          disabled={!canGoPrevious}
          className="text-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Semana anterior
        </Button>

        {selectedWeekNumber === project.current_week_number && (
          <Badge className="bg-purple-600 text-white">
            Semana actual
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onNextWeek}
          disabled={!canGoNext}
          className="text-xs"
        >
          Semana siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}