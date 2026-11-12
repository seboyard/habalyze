import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dumbbell, Book, Droplet, Moon, Utensils, Heart, Brain, Smile, Coffee, Music, Calendar, CalendarDays, CalendarCheck, Clock, Plus, X, Repeat, Sparkles, Wand2, Link as LinkIcon, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const weekDays = [
  { value: 0, label: 'D', fullLabel: 'Domingo' },
  { value: 1, label: 'L', fullLabel: 'Lunes' },
  { value: 2, label: 'M', fullLabel: 'Martes' },
  { value: 3, label: 'X', fullLabel: 'Miércoles' },
  { value: 4, label: 'J', fullLabel: 'Jueves' },
  { value: 5, label: 'V', fullLabel: 'Viernes' },
  { value: 6, label: 'S', fullLabel: 'Sábado' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Diario', description: 'Todos los días', icon: CalendarDays },
  { value: 'weekly', label: 'Semanal', description: 'X veces por semana', icon: Calendar },
  { value: 'custom', label: 'Días específicos', description: 'Elige los días', icon: CalendarCheck },
];

const suggestedTimes = [
  { label: 'Mañana', time: '08:00' },
  { label: 'Mediodía', time: '12:00' },
  { label: 'Tarde', time: '16:00' },
  { label: 'Noche', time: '20:00' },
];

const icons = [
  { name: 'dumbbell', Icon: Dumbbell, label: 'Ejercicio' },
  { name: 'book', Icon: Book, label: 'Lectura' },
  { name: 'droplet', Icon: Droplet, label: 'Agua' },
  { name: 'moon', Icon: Moon, label: 'Dormir' },
  { name: 'utensils', Icon: Utensils, label: 'Comida' },
  { name: 'heart', Icon: Heart, label: 'Salud' },
  { name: 'brain', Icon: Brain, label: 'Mental' },
  { name: 'smile', Icon: Smile, label: 'Bienestar' },
  { name: 'coffee', Icon: Coffee, label: 'Energía' },
  { name: 'music', Icon: Music, label: 'Hobby' }
];

const colors = [
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'green', class: 'bg-green-500' },
  { name: 'orange', class: 'bg-orange-500' },
  { name: 'pink', class: 'bg-pink-500' },
  { name: 'red', class: 'bg-red-500' },
  { name: 'teal', class: 'bg-teal-500' },
  { name: 'yellow', class: 'bg-yellow-500' }
];

export default function CreateHabitDialog({ open, onOpenChange, onSubmit, parentHabit = null }) {
  const [mode, setMode] = useState('manual'); // 'manual' or 'ai'
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [existingHabits, setExistingHabits] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'dumbbell',
    color: 'purple',
    frequency: 'daily',
    weekly_days: [],
    times_per_week: 3,
    times_per_day: 1,
    scheduled_times: [],
    parent_habit_id: parentHabit?.id || null,
    linked_goal_ids: []
  });
  const [newTime, setNewTime] = useState('08:00');

  React.useEffect(() => {
    if (open) {
      loadExistingHabits();
      if (parentHabit) {
        setFormData(prev => ({
          ...prev,
          parent_habit_id: parentHabit.id,
          icon: parentHabit.icon,
          color: parentHabit.color,
          frequency: parentHabit.frequency,
          description: parentHabit.description
        }));
      }
    }
  }, [open, parentHabit]);

  const loadExistingHabits = async () => {
    try {
      const user = await db.auth.me();
      const [habits, goals] = await Promise.all([
        db.entities.Habit.filter({ created_by: user.email, is_active: true, parent_habit_id: null }),
        db.entities.Goal.filter({ created_by: user.email, status: 'active' })
      ]);
      setExistingHabits(habits);
      setActiveGoals(goals);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    // Generate group_key for grouping related habits
    if (submitData.parent_habit_id || submitData.scheduled_times?.length > 1) {
      const baseName = submitData.name
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/\s*-\s*(mañana|tarde|noche|mediodía)/gi, '')
        .trim()
        .toLowerCase();
      submitData.group_key = baseName;
    }
    
    if (formData.frequency === 'daily') {
      delete submitData.weekly_days;
      delete submitData.times_per_week;
    } else if (formData.frequency === 'weekly') {
      delete submitData.weekly_days;
    } else if (formData.frequency === 'custom') {
      delete submitData.times_per_week;
    }
    // Clean up times if only 1 per day and no scheduled times
    if (submitData.times_per_day === 1 && submitData.scheduled_times?.length === 0) {
      delete submitData.scheduled_times;
    }
    if (!submitData.parent_habit_id) {
      delete submitData.parent_habit_id;
    }
    onSubmit(submitData);
    setFormData({ name: '', description: '', icon: 'dumbbell', color: 'purple', frequency: 'daily', weekly_days: [], times_per_week: 3, times_per_day: 1, scheduled_times: [], parent_habit_id: null, linked_goal_ids: [] });
  };

  const toggleWeekDay = (day) => {
    const current = formData.weekly_days || [];
    if (current.includes(day)) {
      setFormData({ ...formData, weekly_days: current.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, weekly_days: [...current, day].sort() });
    }
  };

  const addScheduledTime = (time) => {
    const current = formData.scheduled_times || [];
    if (!current.includes(time)) {
      const newTimes = [...current, time].sort();
      setFormData({ ...formData, scheduled_times: newTimes, times_per_day: newTimes.length });
    }
  };

  const removeScheduledTime = (time) => {
    const current = formData.scheduled_times || [];
    const newTimes = current.filter(t => t !== time);
    setFormData({ ...formData, scheduled_times: newTimes, times_per_day: Math.max(1, newTimes.length) });
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Describe qué hábito quieres crear');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `Eres un experto en formación de hábitos. El usuario quiere crear un hábito y dice: "${aiPrompt}"

Genera 3 sugerencias de hábitos específicos, medibles y alcanzables basados en lo que el usuario describió.

IMPORTANTE:
- Cada hábito debe tener un nombre claro y accionable
- La descripción debe motivar y explicar el beneficio
- El icono DEBE ser uno de: dumbbell, book, droplet, moon, utensils, heart, brain, smile, coffee, music
- El color DEBE ser uno de: purple, blue, green, orange, pink, red, teal, yellow
- La frecuencia puede ser: daily, weekly, custom
- Si es weekly, sugiere times_per_week entre 2 y 5
- Si es custom, sugiere weekly_days como array de números (0=domingo, 1=lunes, etc.)

Responde SOLO con el JSON, sin texto adicional.`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  icon: { 
                    type: 'string',
                    enum: ['dumbbell', 'book', 'droplet', 'moon', 'utensils', 'heart', 'brain', 'smile', 'coffee', 'music']
                  },
                  color: { 
                    type: 'string',
                    enum: ['purple', 'blue', 'green', 'orange', 'pink', 'red', 'teal', 'yellow']
                  },
                  frequency: {
                    type: 'string',
                    enum: ['daily', 'weekly', 'custom']
                  },
                  times_per_week: { type: 'number' },
                  weekly_days: {
                    type: 'array',
                    items: { type: 'number' }
                  }
                },
                required: ['name', 'description', 'icon', 'color', 'frequency']
              }
            }
          },
          required: ['suggestions']
        }
      });

      if (response.suggestions && response.suggestions.length > 0) {
        setAiSuggestions(response.suggestions);
        toast.success('¡Hábitos generados!');
      } else {
        toast.error('No se pudieron generar sugerencias');
      }
    } catch (error) {
      console.error('Error generating habits:', error);
      toast.error('Error al generar hábitos con IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAISuggestion = (suggestion) => {
    setFormData({
      name: suggestion.name,
      description: suggestion.description,
      icon: suggestion.icon,
      color: suggestion.color,
      frequency: suggestion.frequency,
      weekly_days: suggestion.weekly_days || [],
      times_per_week: suggestion.times_per_week || 3,
      times_per_day: 1,
      scheduled_times: []
    });
    setMode('manual');
    toast.success('Hábito aplicado, puedes ajustarlo si lo deseas');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Crear Nuevo Hábito</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Con IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-start gap-3 mb-4">
                <Brain className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-900">Asistente IA de Hábitos</h3>
                  <p className="text-sm text-purple-700">Describe lo que quieres lograr y la IA te sugerirá hábitos específicos</p>
                </div>
              </div>

              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ej: Quiero mejorar mi salud física y tener más energía durante el día..."
                className="h-24 mb-3"
                disabled={isGenerating}
              />

              <Button
                onClick={generateWithAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar Hábitos con IA
                  </>
                )}
              </Button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800">Sugerencias generadas:</h4>
                {aiSuggestions.map((suggestion, index) => {
                  const IconComponent = icons.find(i => i.name === suggestion.icon)?.Icon || Dumbbell;
                  return (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer"
                      onClick={() => applyAISuggestion(suggestion)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          `bg-${suggestion.color}-100`
                        )}>
                          <IconComponent className={cn("w-5 h-5", `text-${suggestion.color}-600`)} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{suggestion.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {suggestion.frequency === 'daily' ? '📅 Diario' : 
                               suggestion.frequency === 'weekly' ? `📊 ${suggestion.times_per_week}x/semana` :
                               '🗓️ Días específicos'}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => applyAISuggestion(suggestion)}>
                          Usar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Parent Habit Selector */}
          {!parentHabit && existingHabits.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <Label className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4 text-blue-600" />
                Agrupar con hábito existente (opcional)
              </Label>
              <p className="text-xs text-blue-600 mb-3">
                Crea un sub-hábito vinculado a uno existente (ej: "Cepillar dientes" puede tener mañana, mediodía, noche)
              </p>
              <Select 
                value={formData.parent_habit_id || 'none'} 
                onValueChange={(v) => {
                  if (v === 'none') {
                    setFormData({ ...formData, parent_habit_id: null });
                  } else {
                    const parent = existingHabits.find(h => h.id === v);
                    setFormData({ 
                      ...formData, 
                      parent_habit_id: v,
                      icon: parent?.icon || formData.icon,
                      color: parent?.color || formData.color
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ninguno (hábito independiente)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno (hábito independiente)</SelectItem>
                  {existingHabits.map(habit => (
                    <SelectItem key={habit.id} value={habit.id}>
                      {habit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {parentHabit && (
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <p className="text-sm text-green-700">
                <strong>Sub-hábito de:</strong> {parentHabit.name}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Este hábito estará agrupado con "{parentHabit.name}"
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Hábito *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={parentHabit ? `Ej: ${parentHabit.name} (Mañana)` : "Ej: Hacer ejercicio"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="¿Por qué es importante este hábito?"
              className="h-20"
              onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
            />
          </div>

          {/* Goal link selector */}
          {activeGoals.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-600" />
                ¿Para qué meta es este hábito? (opcional)
              </Label>
              <Select
                value={formData.linked_goal_ids?.[0] || 'none'}
                onValueChange={(v) => setFormData({ ...formData, linked_goal_ids: v === 'none' ? [] : [v] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin meta vinculada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin meta vinculada</SelectItem>
                  {activeGoals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.icon || '🎯'} {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Ícono</Label>
            <div className="grid grid-cols-5 gap-2">
              {icons.map(({ name, Icon, label }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: name })}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all hover:scale-105",
                    formData.icon === name ? "border-purple-500 bg-purple-50" : "border-gray-200"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
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
                    "w-10 h-10 rounded-full border-4 transition-all hover:scale-110",
                    colorClass,
                    formData.color === name ? "border-gray-800 scale-110" : "border-white"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Frecuencia</Label>
            <div className="grid grid-cols-3 gap-2">
              {frequencyOptions.map(({ value, label, description, icon: FreqIcon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, frequency: value })}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all hover:scale-105",
                    formData.frequency === value ? "border-purple-500 bg-purple-50" : "border-gray-200"
                  )}
                >
                  <FreqIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-[10px] text-gray-500">{description}</span>
                </button>
              ))}
            </div>

            {formData.frequency === 'weekly' && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <Label className="text-blue-700">¿Cuántas veces por semana?</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={formData.times_per_week}
                    onChange={(e) => setFormData({ ...formData, times_per_week: parseInt(e.target.value) })}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-2xl font-bold text-blue-600 w-8 text-center">{formData.times_per_week}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Completa {formData.times_per_week} veces a la semana</p>
              </div>
            )}

            {formData.frequency === 'custom' && (
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                <Label className="text-violet-700">Selecciona los días</Label>
                <div className="flex gap-2 mt-2 justify-center">
                  {weekDays.map(({ value, label, fullLabel }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleWeekDay(value)}
                      title={fullLabel}
                      className={cn(
                        "w-10 h-10 rounded-full font-bold text-sm transition-all",
                        (formData.weekly_days || []).includes(value) 
                          ? "bg-violet-500 text-white shadow-lg scale-110" 
                          : "bg-white border-2 border-gray-200 text-gray-600 hover:border-violet-300"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {(formData.weekly_days || []).length > 0 && (
                  <p className="text-xs text-violet-600 mt-2 text-center">
                    {(formData.weekly_days || []).map(d => weekDays.find(wd => wd.value === d)?.fullLabel).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Repeticiones por día y horarios */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Horarios (opcional)
            </Label>
            <p className="text-xs text-gray-500">Configura horarios específicos para repetir este hábito varias veces al día</p>
            
            {/* Quick add suggested times */}
            <div className="flex flex-wrap gap-2">
              {suggestedTimes.map(({ label, time }) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => addScheduledTime(time)}
                  disabled={(formData.scheduled_times || []).includes(time)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    (formData.scheduled_times || []).includes(time)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  )}
                >
                  {label} ({time})
                </button>
              ))}
            </div>

            {/* Custom time input */}
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addScheduledTime(newTime)}
                disabled={(formData.scheduled_times || []).includes(newTime)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Scheduled times list */}
            {(formData.scheduled_times || []).length > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Repeat className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    {formData.scheduled_times.length} vez{formData.scheduled_times.length > 1 ? 'es' : ''} al día
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.scheduled_times.map((time) => (
                    <div
                      key={time}
                      className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-amber-200"
                    >
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span className="text-sm font-medium">{time}</span>
                      <button
                        type="button"
                        onClick={() => removeScheduledTime(time)}
                        className="ml-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Crear Hábito
            </Button>
          </div>
        </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}