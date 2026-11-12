import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, ChevronRight, Sparkles, Users } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const colorClasses = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  red: 'from-red-500 to-red-600',
  teal: 'from-teal-500 to-teal-600',
  yellow: 'from-yellow-500 to-yellow-600',
};

const categoryIcons = {
  health: '❤️',
  fitness: '💪',
  learning: '📚',
  career: '💼',
  creativity: '🎨',
  finance: '💰',
  relationships: '👥',
  personal: '⭐',
};

const statusConfig = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-700' },
  archived: { label: 'Archivado', color: 'bg-gray-100 text-gray-700' },
};

export default function ProjectCard({ project, tasksCompleted, totalTasks, onClick, collaboratorCount = 0, isCollaborator = false }) {
  const daysLeft = project.target_date 
    ? differenceInDays(new Date(project.target_date), new Date()) 
    : null;
  
  const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
  const status = statusConfig[project.status] || statusConfig.active;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition-all hover:shadow-lg">
        <div className={cn("h-2 bg-gradient-to-r", colorClasses[project.color] || colorClasses.purple)} />
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{project.icon || categoryIcons[project.category] || '🎯'}</span>
              <div>
                <h3 className="font-bold text-gray-800">{project.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={status.color}>{status.label}</Badge>
            {project.ai_generated && (
              <Badge className="bg-purple-100 text-purple-700">
                <Sparkles className="w-3 h-3 mr-1" /> IA
              </Badge>
            )}
            {collaboratorCount > 0 && (
              <Badge className="bg-blue-100 text-blue-700">
                <Users className="w-3 h-3 mr-1" /> {collaboratorCount + 1}
              </Badge>
            )}
            {isCollaborator && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                Colaborador
              </Badge>
            )}
            {daysLeft !== null && daysLeft >= 0 && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {daysLeft === 0 ? 'Hoy' : `${daysLeft} días`}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progreso</span>
              <span className="font-bold text-gray-800">{tasksCompleted}/{totalTasks} tareas</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}