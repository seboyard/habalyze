import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function ProjectStats({ projects }) {
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const avgProgress = activeProjects.length > 0 
    ? activeProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / activeProjects.length 
    : 0;

  return (
    <Card className="p-6 h-full bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <FolderKanban className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-bold text-lg text-gray-800">Proyectos</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{activeProjects.length}</p>
          <p className="text-xs text-gray-600">Activos</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{completedProjects.length}</p>
          <p className="text-xs text-gray-600">Completados</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{Math.round(avgProgress)}%</p>
          <p className="text-xs text-gray-600">Promedio</p>
        </div>
      </div>

      {activeProjects.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <p className="text-sm font-semibold text-gray-700 mb-2">Proyectos Activos:</p>
          {activeProjects.slice(0, 5).map(project => {
            const daysLeft = project.target_date ? differenceInDays(parseISO(project.target_date), new Date()) : null;
            return (
              <div key={project.id} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{project.name}</p>
                    {daysLeft !== null && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {daysLeft > 0 ? `${daysLeft} días` : 'Vencido'}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-blue-600">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-2" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}