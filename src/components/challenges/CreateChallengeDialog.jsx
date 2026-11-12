import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const challengeIcons = ['🏆', '💪', '🔥', '⚡', '🎯', '💎', '🌟', '🚀', '⭐', '🎖️'];

const challengeTypes = [
  { value: 'individual', label: 'Individual', desc: 'Cada quien su progreso', icon: '👤' },
  { value: 'collaborative', label: 'Colaborativo', desc: 'Meta grupal compartida', icon: '🤝' },
  { value: 'competitive', label: 'Competitivo', desc: 'Quien llegue primero gana', icon: '⚔️' }
];

const goalTypes = [
  { value: 'total_completions', label: 'Completaciones totales', icon: '✅' },
  { value: 'total_days', label: 'Días de práctica', icon: '📅' },
  { value: 'streak_days', label: 'Racha consecutiva', icon: '🔥' }
];

const difficulties = [
  { value: 'easy', label: 'Fácil', color: 'text-green-600' },
  { value: 'medium', label: 'Medio', color: 'text-yellow-600' },
  { value: 'hard', label: 'Difícil', color: 'text-orange-600' },
  { value: 'extreme', label: 'Extremo', color: 'text-red-600' }
];

export default function CreateChallengeDialog({ open, onOpenChange, onSubmit, myGuild, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🏆',
    challenge_type: 'individual',
    goal_type: 'total_completions',
    goal_value: 100,
    difficulty: 'medium',
    reward_coins: 100,
    reward_xp: 50,
    start_date: new Date(),
    end_date: addDays(new Date(), 7),
    guild_id: myGuild?.guild_id || null,
    creator_email: currentUser?.email
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.goal_value) {
      return;
    }
    onSubmit({
      ...formData,
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: format(formData.end_date, 'yyyy-MM-dd')
    });
    setFormData({
      title: '',
      description: '',
      icon: '🏆',
      challenge_type: 'individual',
      goal_type: 'total_completions',
      goal_value: 100,
      difficulty: 'medium',
      reward_coins: 100,
      reward_xp: 50,
      start_date: new Date(),
      end_date: addDays(new Date(), 7),
      guild_id: myGuild?.guild_id || null,
      creator_email: currentUser?.email
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{formData.icon}</span>
            Crear Desafío
            {myGuild && (
              <span className="text-sm font-normal text-gray-500">para {myGuild.name}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Título del Desafío</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: 30 Días de Lectura"
              maxLength={50}
            />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el desafío y qué deben hacer los participantes..."
              className="h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Icono</Label>
              <div className="flex flex-wrap gap-1">
                {challengeIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setFormData({ ...formData, icon })}
                    className={cn(
                      "w-8 h-8 rounded-lg text-lg flex items-center justify-center border-2 transition-all",
                      formData.icon === icon 
                        ? "border-purple-500 bg-purple-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Dificultad</Label>
              <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      <span className={d.color}>{d.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tipo de Desafío</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {challengeTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, challenge_type: type.value })}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-center",
                    formData.challenge_type === type.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Meta</Label>
              <Select value={formData.goal_type} onValueChange={(v) => setFormData({ ...formData, goal_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.icon} {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor de la Meta</Label>
              <Input
                type="number"
                value={formData.goal_value}
                onChange={(e) => setFormData({ ...formData, goal_value: parseInt(e.target.value) || 0 })}
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.start_date, 'PPP', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({ ...formData, start_date: date || new Date() })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Fecha de Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.end_date, 'PPP', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date || addDays(new Date(), 7) })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Recompensa (Monedas)</Label>
              <Input
                type="number"
                value={formData.reward_coins}
                onChange={(e) => setFormData({ ...formData, reward_coins: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>

            <div>
              <Label>Recompensa (XP)</Label>
              <Input
                type="number"
                value={formData.reward_xp}
                onChange={(e) => setFormData({ ...formData, reward_xp: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.goal_value}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Crear Desafío
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}