import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, CalendarIcon, Loader2 } from 'lucide-react';
import { format, addWeeks, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import { toast } from 'sonner';

const categories = [
  { value: 'health', label: 'Salud', icon: '❤️' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'learning', label: 'Aprendizaje', icon: '📚' },
  { value: 'career', label: 'Carrera', icon: '💼' },
  { value: 'creativity', label: 'Creatividad', icon: '🎨' },
  { value: 'finance', label: 'Finanzas', icon: '💰' },
  { value: 'relationships', label: 'Relaciones', icon: '👥' },
  { value: 'personal', label: 'Personal', icon: '⭐' },
];

const colors = [
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'green', class: 'bg-green-500' },
  { name: 'orange', class: 'bg-orange-500' },
  { name: 'pink', class: 'bg-pink-500' },
  { name: 'red', class: 'bg-red-500' },
  { name: 'teal', class: 'bg-teal-500' },
  { name: 'yellow', class: 'bg-yellow-500' },
];

const difficulties = [
  { value: 'easy', label: 'Fácil', description: '2-4 semanas' },
  { value: 'medium', label: 'Medio', description: '1-2 meses' },
  { value: 'hard', label: 'Difícil', description: '3+ meses' },
];

export default function CreateProjectDialog({ open, onOpenChange, onProjectCreated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🎯',
    color: 'purple',
    category: 'personal',
    difficulty: 'medium',
    target_date: addMonths(new Date(), 1),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Get current user
      const user = await db.auth.me();
      
      // Create the project
      const project = await db.entities.Project.create({
        ...formData,
        target_date: format(formData.target_date, 'yyyy-MM-dd'),
        ai_generated: true,
        progress: 0,
        status: 'active',
        created_by_name: user.full_name
      });

      // Generate tasks with AI
      const prompt = `Eres un coach de productividad experto. El usuario quiere lograr:

Proyecto: ${formData.name}
Descripción: ${formData.description}
Categoría: ${formData.category}
Dificultad: ${formData.difficulty}
Fecha objetivo: ${format(formData.target_date, 'dd/MM/yyyy')}

GENERA UN PLAN LÓGICO Y SECUENCIAL. MUY IMPORTANTE:

1. **Tareas tipo "setup"**: Son requisitos previos que solo se hacen UNA VEZ (ej: "Crear cuenta de Instagram", "Comprar equipo", "Instalar software"). Si ya tienes cuenta, no necesitas crearla de nuevo.

2. **Dependencias lógicas**: Indica qué tareas dependen de otras. Por ejemplo:
   - "Publicar primera foto" depende de "Crear cuenta de Instagram" (depends_on: [1] si crear cuenta es orden 1)
   - "Grabar video avanzado" depende de "Aprender edición básica"

3. **Fases del proyecto**: Agrupa en fases como "Preparación", "Aprendizaje", "Ejecución", "Consolidación"

4. **Tipos de tareas**:
   - "setup": Se hace una sola vez en la vida (crear cuenta, comprar algo)
   - "one-time": Se hace una vez para este proyecto
   - "daily": Se repite diariamente (ej: practicar 30 min)
   - "weekly": Se repite semanalmente
   - "milestone": Hito importante del proyecto

5. Genera entre 8-15 tareas ordenadas lógicamente.

Responde SOLO con JSON.`;

      const response = await db.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string", enum: ["setup", "milestone", "daily", "weekly", "one-time"] },
                  is_milestone: { type: "boolean" },
                  is_setup: { type: "boolean" },
                  depends_on: { type: "array", items: { type: "number" } },
                  phase: { type: "string" },
                  tips: { type: "string" },
                  reward_coins: { type: "number" },
                  reward_xp: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Create tasks
      if (response.tasks && response.tasks.length > 0) {
        for (let i = 0; i < response.tasks.length; i++) {
          const task = response.tasks[i];
          // Determine initial status based on dependencies
          const hasDependencies = task.depends_on && task.depends_on.length > 0;
          
          await db.entities.ProjectTask.create({
            project_id: project.id,
            title: task.title,
            description: task.description,
            type: task.type || 'one-time',
            order: i + 1,
            status: hasDependencies ? 'locked' : 'pending',
            is_milestone: task.is_milestone || false,
            is_setup: task.is_setup || task.type === 'setup',
            depends_on: task.depends_on || [],
            phase: task.phase || 'General',
            tips: task.tips,
            reward_coins: task.reward_coins || (task.is_milestone ? 50 : task.is_setup ? 20 : 10),
            reward_xp: task.reward_xp || (task.is_milestone ? 100 : task.is_setup ? 30 : 20)
          });
        }
      }

      // Create social activity for friends
      await db.entities.FriendActivity.create({
        user_email: user.email,
        user_name: user.full_name,
        activity_type: 'project_started',
        title: 'Comenzó un nuevo proyecto',
        description: formData.name,
        icon: formData.icon || '🎯'
      });

      toast.success('¡Proyecto creado con éxito! 🎯', {
        description: `Se generaron ${response.tasks?.length || 0} tareas secuenciales`
      });

      onProjectCreated?.(project);
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        icon: '🎯',
        color: 'purple',
        category: 'personal',
        difficulty: 'medium',
        target_date: addMonths(new Date(), 1),
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al crear el proyecto');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Nuevo Proyecto con IA
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proyecto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Aprender a programar en Python"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Describe tu objetivo *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe en detalle qué quieres lograr y por qué es importante para ti. Cuanto más detallado, mejores serán las tareas generadas."
              className="h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dificultad</Label>
              <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label} ({diff.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fecha Objetivo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.target_date, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.target_date}
                  onSelect={(date) => date && setFormData({ ...formData, target_date: date })}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(({ name, class: colorClass }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: name })}
                  className={cn(
                    "w-8 h-8 rounded-full border-4 transition-all hover:scale-110",
                    colorClass,
                    formData.color === name ? "border-gray-800 scale-110" : "border-white"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-purple-800">La IA generará:</p>
                <ul className="text-sm text-purple-600 mt-1 space-y-1">
                  <li>• Tareas secuenciales con dependencias lógicas</li>
                  <li>• Tareas de setup (solo una vez) vs recurrentes</li>
                  <li>• Hitos importantes y fases del proyecto</li>
                  <li>• Consejos y recompensas personalizadas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || !formData.name || !formData.description}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Crear con IA
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}