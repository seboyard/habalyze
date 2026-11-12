import { db } from '@/api/base44Client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Target, FolderKanban, Zap, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LinkedItemsDisplay({ sourceType, sourceItem, compact = false }) {
  const { data: linkedHabits = [] } = useQuery({
    queryKey: ['linked-habits', sourceItem?.id],
    queryFn: async () => {
      const habitIds = sourceItem?.linked_habit_ids || sourceItem?.associated_habit_ids || [];
      if (habitIds.length === 0) return [];
      const habits = await Promise.all(
        habitIds.map(id => db.entities.Habit.filter({ id }))
      );
      return habits.flat().filter(h => h.is_active);
    },
    enabled: !!sourceItem && sourceType !== 'habit'
  });

  const { data: linkedGoals = [] } = useQuery({
    queryKey: ['linked-goals', sourceItem?.id],
    queryFn: async () => {
      const goalIds = sourceItem?.linked_goal_ids || [];
      if (goalIds.length === 0) return [];
      const goals = await Promise.all(
        goalIds.map(id => db.entities.Goal.filter({ id }))
      );
      return goals.flat().filter(g => g.status === 'active');
    },
    enabled: !!sourceItem && sourceType !== 'goal'
  });

  const { data: linkedProjects = [] } = useQuery({
    queryKey: ['linked-projects', sourceItem?.id],
    queryFn: async () => {
      const projectIds = sourceItem?.linked_project_ids || sourceItem?.associated_project_ids || [];
      if (projectIds.length === 0) return [];
      const projects = await Promise.all(
        projectIds.map(id => db.entities.Project.filter({ id }))
      );
      return projects.flat().filter(p => p.status === 'active');
    },
    enabled: !!sourceItem && sourceType !== 'project'
  });

  const hasLinks = linkedHabits.length > 0 || linkedGoals.length > 0 || linkedProjects.length > 0;

  if (!hasLinks) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Link2 className="w-3 h-3 text-gray-400" />
        {linkedGoals.length > 0 && (
          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
            <Target className="w-3 h-3 mr-1" />
            {linkedGoals.length} objetivo{linkedGoals.length > 1 ? 's' : ''}
          </Badge>
        )}
        {linkedProjects.length > 0 && (
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
            <FolderKanban className="w-3 h-3 mr-1" />
            {linkedProjects.length} proyecto{linkedProjects.length > 1 ? 's' : ''}
          </Badge>
        )}
        {linkedHabits.length > 0 && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            <Zap className="w-3 h-3 mr-1" />
            {linkedHabits.length} hábito{linkedHabits.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Link2 className="w-4 h-4" />
        Elementos Vinculados
      </h4>

      {linkedGoals.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Objetivos ({linkedGoals.length})
          </p>
          <div className="space-y-1">
            {linkedGoals.map(goal => (
              <Link key={goal.id} to={createPageUrl('Objectives')}>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-orange-200 hover:border-orange-300 transition-colors">
                  <span className="text-sm">{goal.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{goal.title}</span>
                  <div className="ml-auto text-xs text-orange-600">{goal.current_progress}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {linkedProjects.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            Proyectos ({linkedProjects.length})
          </p>
          <div className="space-y-1">
            {linkedProjects.map(project => (
              <Link key={project.id} to={createPageUrl('Projects')}>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                  <span className="text-sm">{project.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{project.name}</span>
                  <div className="ml-auto text-xs text-purple-600">{project.progress}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {linkedHabits.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Hábitos ({linkedHabits.length})
          </p>
          <div className="space-y-1">
            {linkedHabits.map(habit => (
              <Link key={habit.id} to={createPageUrl('Dashboard')}>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                  <div className={cn(
                    "w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs",
                    `from-${habit.color}-400 to-${habit.color}-600`
                  )}>
                    {habit.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{habit.name}</span>
                  <div className="ml-auto text-xs text-green-600">🔥 {habit.current_streak}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}