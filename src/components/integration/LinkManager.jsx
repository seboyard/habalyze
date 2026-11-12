import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Link2, Target, FolderKanban, Zap, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function LinkManager({ 
  open, 
  onOpenChange, 
  sourceType, // 'habit', 'goal', 'project'
  sourceItem,
  onLinksUpdated 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLinks, setSelectedLinks] = useState({
    habits: [],
    goals: [],
    projects: []
  });

  const { data: allHabits = [] } = useQuery({
    queryKey: ['all-habits-for-linking'],
    queryFn: () => db.entities.Habit.filter({ is_active: true }),
    enabled: open && sourceType !== 'habit'
  });

  const { data: allGoals = [] } = useQuery({
    queryKey: ['all-goals-for-linking'],
    queryFn: () => db.entities.Goal.filter({ status: 'active' }),
    enabled: open && sourceType !== 'goal'
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['all-projects-for-linking'],
    queryFn: () => db.entities.Project.filter({ status: 'active' }),
    enabled: open && sourceType !== 'project'
  });

  useEffect(() => {
    if (sourceItem && open) {
      setSelectedLinks({
        habits: sourceItem.linked_habit_ids || sourceItem.associated_habit_ids || [],
        goals: sourceItem.linked_goal_ids || [],
        projects: sourceItem.linked_project_ids || sourceItem.associated_project_ids || []
      });
    }
  }, [sourceItem, open]);

  const toggleLink = (type, id) => {
    setSelectedLinks(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(linkId => linkId !== id)
        : [...prev[type], id]
    }));
  };

  const handleSave = async () => {
    try {
      const updates = {};
      
      if (sourceType === 'habit') {
        updates.linked_goal_ids = selectedLinks.goals;
        updates.linked_project_ids = selectedLinks.projects;
        await db.entities.Habit.update(sourceItem.id, updates);
      } else if (sourceType === 'goal') {
        updates.associated_habit_ids = selectedLinks.habits;
        updates.associated_project_ids = selectedLinks.projects;
        await db.entities.Goal.update(sourceItem.id, updates);
      } else if (sourceType === 'project') {
        updates.linked_goal_id = selectedLinks.goals[0] || null;
        updates.linked_habit_ids = selectedLinks.habits;
        await db.entities.Project.update(sourceItem.id, updates);
      }

      toast.success('Vínculos actualizados');
      onLinksUpdated?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al actualizar vínculos');
    }
  };

  const filteredHabits = allHabits.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGoals = allGoals.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = allProjects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-600" />
            Gestionar Vínculos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {sourceType !== 'goal' && filteredGoals.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                Objetivos
                <Badge variant="outline">{selectedLinks.goals.length}</Badge>
              </h3>
              <div className="space-y-2">
                {filteredGoals.map(goal => (
                  <label
                    key={goal.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      selectedLinks.goals.includes(goal.id)
                        ? "border-orange-300 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200"
                    )}
                  >
                    <Checkbox
                      checked={selectedLinks.goals.includes(goal.id)}
                      onCheckedChange={() => toggleLink('goals', goal.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{goal.icon}</span>
                        <span className="font-medium">{goal.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{goal.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {sourceType !== 'project' && filteredProjects.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-purple-600" />
                Proyectos
                <Badge variant="outline">{selectedLinks.projects.length}</Badge>
              </h3>
              <div className="space-y-2">
                {filteredProjects.map(project => (
                  <label
                    key={project.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      selectedLinks.projects.includes(project.id)
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200 hover:border-purple-200"
                    )}
                  >
                    <Checkbox
                      checked={selectedLinks.projects.includes(project.id)}
                      onCheckedChange={() => toggleLink('projects', project.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{project.icon}</span>
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{project.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {sourceType !== 'habit' && filteredHabits.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                Hábitos
                <Badge variant="outline">{selectedLinks.habits.length}</Badge>
              </h3>
              <div className="space-y-2">
                {filteredHabits.map(habit => (
                  <label
                    key={habit.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      selectedLinks.habits.includes(habit.id)
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 hover:border-green-200"
                    )}
                  >
                    <Checkbox
                      checked={selectedLinks.habits.includes(habit.id)}
                      onCheckedChange={() => toggleLink('habits', habit.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm",
                          `from-${habit.color}-400 to-${habit.color}-600`
                        )}>
                          {habit.icon}
                        </div>
                        <span className="font-medium">{habit.name}</span>
                      </div>
                      {habit.description && (
                        <p className="text-xs text-gray-500 mt-1">{habit.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-pink-500">
              Guardar Vínculos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}