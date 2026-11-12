import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, Dumbbell, Briefcase, Palette, DollarSign, Heart, 
  User, Search, Star, Sparkles, TrendingUp, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const categoryIcons = {
  health: Heart,
  fitness: Dumbbell,
  learning: BookOpen,
  career: Briefcase,
  creativity: Palette,
  finance: DollarSign,
  relationships: Heart,
  personal: User,
  productivity: TrendingUp
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
};

export default function TemplateLibrary({ open, onOpenChange, onTemplateApplied }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => db.entities.Template.filter({ is_public: true }),
    enabled: open
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (template) => {
      const user = await db.auth.me();
      
      // Create habits
      if (template.habits_config) {
        for (const habitConfig of template.habits_config) {
          await db.entities.Habit.create({
            ...habitConfig,
            is_active: true,
            current_streak: 0,
            total_completions: 0
          });
        }
      }

      // Create goals
      const createdGoalIds = [];
      if (template.goals_config) {
        for (const goalConfig of template.goals_config) {
          const goal = await db.entities.Goal.create({
            ...goalConfig,
            start_date: format(new Date(), 'yyyy-MM-dd'),
            end_date: format(
              new Date(Date.now() + template.estimated_duration_days * 24 * 60 * 60 * 1000),
              'yyyy-MM-dd'
            ),
            status: 'active',
            current_progress: 0
          });
          createdGoalIds.push(goal.id);
        }
      }

      // Create projects
      if (template.projects_config) {
        for (const projectConfig of template.projects_config) {
          const project = await db.entities.Project.create({
            name: projectConfig.name,
            description: projectConfig.description,
            icon: projectConfig.icon,
            status: 'active',
            progress: 0,
            ai_generated: true,
            linked_goal_id: createdGoalIds[0] || null
          });

          // Create project tasks
          if (projectConfig.tasks) {
            for (let i = 0; i < projectConfig.tasks.length; i++) {
              await db.entities.ProjectTask.create({
                project_id: project.id,
                ...projectConfig.tasks[i],
                order: i + 1,
                status: i === 0 ? 'pending' : 'locked'
              });
            }
          }
        }
      }

      // Update usage count
      await db.entities.Template.update(template.id, {
        usage_count: (template.usage_count || 0) + 1
      });

      return template;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries(['habits']);
      queryClient.invalidateQueries(['goals']);
      queryClient.invalidateQueries(['own-projects']);
      toast.success(`¡Plantilla "${template.name}" aplicada!`, {
        description: 'Revisa tu dashboard para comenzar'
      });
      onTemplateApplied?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Error al aplicar plantilla');
    }
  });

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Biblioteca de Plantillas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => {
                const Icon = cat === 'all' ? null : categoryIcons[cat];
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap"
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1" />}
                    {cat === 'all' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Templates grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No se encontraron plantillas</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => {
                const Icon = categoryIcons[template.category];
                return (
                  <Card
                    key={template.id}
                    className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-5 h-5 text-purple-600" />}
                        <span className="text-lg">{template.icon}</span>
                      </div>
                      {template.is_official && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Oficial
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-800 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={difficultyColors[template.difficulty]}>
                        {template.difficulty === 'beginner' ? 'Principiante' :
                         template.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </Badge>
                      {template.estimated_duration_days && (
                        <Badge variant="outline" className="text-xs">
                          {template.estimated_duration_days} días
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{template.rating || 0}</span>
                      </div>
                      <span>{template.usage_count || 0} usos</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Template detail modal */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  {selectedTemplate.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-gray-600">{selectedTemplate.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Categoría</p>
                    <p className="font-semibold capitalize">{selectedTemplate.category}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Duración</p>
                    <p className="font-semibold">{selectedTemplate.estimated_duration_days} días</p>
                  </div>
                </div>

                {selectedTemplate.habits_config?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Incluye {selectedTemplate.habits_config.length} hábitos</h4>
                    <ul className="space-y-1">
                      {selectedTemplate.habits_config.slice(0, 3).map((h, i) => (
                        <li key={i} className="text-sm text-gray-600">• {h.name}</li>
                      ))}
                      {selectedTemplate.habits_config.length > 3 && (
                        <li className="text-sm text-gray-500">... y {selectedTemplate.habits_config.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}

                {selectedTemplate.goals_config?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Incluye {selectedTemplate.goals_config.length} objetivos</h4>
                    <ul className="space-y-1">
                      {selectedTemplate.goals_config.map((g, i) => (
                        <li key={i} className="text-sm text-gray-600">• {g.title}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedTemplate.projects_config?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Incluye {selectedTemplate.projects_config.length} proyectos</h4>
                    <ul className="space-y-1">
                      {selectedTemplate.projects_config.map((p, i) => (
                        <li key={i} className="text-sm text-gray-600">• {p.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => applyTemplateMutation.mutate(selectedTemplate)}
                  disabled={applyTemplateMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {applyTemplateMutation.isPending ? 'Aplicando...' : 'Aplicar Plantilla'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}