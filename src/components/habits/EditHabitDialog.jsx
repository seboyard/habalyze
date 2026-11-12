import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Trash2 } from 'lucide-react';

import { toast } from 'sonner';

const ICONS = ['dumbbell', 'book', 'droplet', 'moon', 'utensils', 'heart', 'brain', 'smile', 'coffee', 'music'];
const COLORS = ['purple', 'blue', 'green', 'orange', 'pink', 'red', 'teal', 'yellow'];
const WEEKDAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' }
];

export default function EditHabitDialog({ open, onOpenChange, habit, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    icon: habit?.icon || 'dumbbell',
    color: habit?.color || 'purple',
    frequency: habit?.frequency || 'daily',
    weekly_days: habit?.weekly_days || [],
    times_per_week: habit?.times_per_week || 1,
    scheduled_times: habit?.scheduled_times || []
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAITransform = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Escribe cómo quieres transformar el hábito');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `Eres un asistente que ayuda a transformar hábitos. El usuario tiene este hábito:
Nombre: ${habit.name}
Descripción: ${habit.description || 'Sin descripción'}
Frecuencia: ${habit.frequency}

El usuario quiere transformarlo así: "${aiPrompt}"

Responde SOLO con un JSON que tenga estos campos:
- name: nuevo nombre del hábito
- description: nueva descripción
- icon: uno de estos: ${ICONS.join(', ')}
- color: uno de estos: ${COLORS.join(', ')}
- frequency: 'daily' o 'weekly' o 'custom'
- weekly_days: array de números del 0-6 si frequency es 'custom' (vacío si no aplica)
- times_per_week: número si frequency es 'weekly'

Mantén la esencia del hábito pero aplica la transformación solicitada.`,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            color: { type: 'string' },
            frequency: { type: 'string' },
            weekly_days: { type: 'array', items: { type: 'number' } },
            times_per_week: { type: 'number' }
          }
        }
      });

      setFormData({
        ...formData,
        ...response,
        scheduled_times: formData.scheduled_times
      });
      toast.success('¡Hábito transformado con IA!');
      setAiPrompt('');
    } catch (error) {
      toast.error('Error al transformar con IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    onUpdate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Hábito</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Transform Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
            <Label className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Transformar con IA
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: Hazlo más específico, cámbialo a por la noche, etc."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <Button
                type="button"
                onClick={handleAITransform}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Manual Edit Fields */}
          <div>
            <Label>Nombre del Hábito</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Ejercicio matutino"
            />
          </div>

          <div>
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Añade más detalles..."
              onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Icono</Label>
              <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Color</Label>
              <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Frecuencia</Label>
            <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="custom">Días específicos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.frequency === 'custom' && (
            <div>
              <Label>Días de la semana</Label>
              <div className="flex gap-2 mt-2">
                {WEEKDAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      const days = formData.weekly_days.includes(day.value)
                        ? formData.weekly_days.filter(d => d !== day.value)
                        : [...formData.weekly_days, day.value];
                      setFormData({ ...formData, weekly_days: days });
                    }}
                    className={`px-3 py-2 rounded-lg border-2 transition-all ${
                      formData.weekly_days.includes(day.value)
                        ? 'bg-purple-500 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => {
                if (confirm('¿Estás seguro de eliminar este hábito? Esta acción no se puede deshacer.')) {
                  onDelete?.();
                  onOpenChange(false);
                }
              }}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500">
                Guardar Cambios
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}