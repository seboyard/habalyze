import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Flame, Target } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['purple', 'blue', 'green', 'orange', 'pink', 'red', 'teal', 'yellow'];

export default function CreateGoalDialog({ open, onOpenChange, habits, projects = [], onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎯',
    color: 'purple',
    target_type: 'days',
    target_value: 365,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    associated_habit_ids: [],
    associated_project_ids: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    if (formData.target_type !== 'projects' && formData.associated_habit_ids.length === 0) {
      toast.error('Selecciona al menos un hábito');
      return;
    }
    if (formData.target_type === 'projects' && formData.associated_project_ids.length === 0) {
      toast.error('Selecciona al menos un proyecto');
      return;
    }
    onCreate(formData);
    setFormData({
      title: '',
      description: '',
      icon: '🎯',
      color: 'purple',
      target_type: 'days',
      target_value: 365,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      associated_habit_ids: [],
      associated_project_ids: []
    });
  };

  const targetTypeLabels = {
    days: 'Días activos',
    completions: 'Completaciones totales',
    streak: 'Racha consecutiva',
    projects: 'Caminos completados'
  };

  const targetTypeIcons = {
    days: Calendar,
    completions: TrendingUp,
    streak: Flame,
    projects: Target
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Objetivo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título del Objetivo</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Entrenar por un año completo"
            />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu objetivo y por qué es importante..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Emoji</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎯"
                maxLength={2}
              />
            </div>

            <div className="col-span-2">
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{
                      background: color === 'purple' ? '#9333ea' :
                                 color === 'blue' ? '#3b82f6' :
                                 color === 'green' ? '#22c55e' :
                                 color === 'orange' ? '#f97316' :
                                 color === 'pink' ? '#ec4899' :
                                 color === 'red' ? '#ef4444' :
                                 color === 'teal' ? '#14b8a6' : '#eab308'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Tipo de Meta</Label>
            <Select value={formData.target_type} onValueChange={(v) => setFormData({ ...formData, target_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(targetTypeLabels).map(([key, label]) => {
                  const Icon = targetTypeIcons[key];
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Valor Objetivo
              {formData.target_type === 'days' && ' (días con al menos 1 completación)'}
              {formData.target_type === 'completions' && ' (total de completaciones)'}
              {formData.target_type === 'streak' && ' (días consecutivos)'}
            </Label>
            <Input
              type="number"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
              min={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Inicio</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Fecha Límite</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {formData.target_type === 'projects' ? (
            <div>
              <Label className="mb-3 block">Caminos Asociados ({formData.associated_project_ids.length})</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                {projects.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No tienes caminos. Crea un camino primero.
                  </p>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <Checkbox
                        checked={formData.associated_project_ids.includes(project.id)}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            associated_project_ids: checked
                              ? [...formData.associated_project_ids, project.id]
                              : formData.associated_project_ids.filter(id => id !== project.id)
                          });
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {project.progress || 0}%
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <Label className="mb-3 block">Hábitos Asociados ({formData.associated_habit_ids.length})</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                {habits.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No tienes hábitos activos. Crea hábitos primero.
                  </p>
                ) : (
                  habits.map(habit => (
                    <div key={habit.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <Checkbox
                        checked={formData.associated_habit_ids.includes(habit.id)}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            associated_habit_ids: checked
                              ? [...formData.associated_habit_ids, habit.id]
                              : formData.associated_habit_ids.filter(id => id !== habit.id)
                          });
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{habit.name}</p>
                        {habit.description && (
                          <p className="text-xs text-gray-500">{habit.description}</p>
                        )}
                      </div>
                      {habit.current_streak > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Flame className="w-3 h-3 mr-1 text-orange-500" />
                          {habit.current_streak}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Target className="w-4 h-4 mr-2" />
              Crear Objetivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}