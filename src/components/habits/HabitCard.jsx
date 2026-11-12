import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Flame, TrendingUp, Dumbbell, Book, Droplet, Moon, Utensils, Heart, Brain, Smile, Coffee, Music, Calendar, CalendarDays, CalendarCheck, Clock, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

const weekDaysShort = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const formatTime = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const iconMap = {
  dumbbell: Dumbbell,
  book: Book,
  droplet: Droplet,
  moon: Moon,
  utensils: Utensils,
  heart: Heart,
  brain: Brain,
  smile: Smile,
  coffee: Coffee,
  music: Music
};

const colorMap = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  red: 'from-red-500 to-red-600',
  teal: 'from-teal-500 to-teal-600',
  yellow: 'from-yellow-500 to-yellow-600'
};

export default function HabitCard({ habit, isCompleted, onToggle, onEdit, disabled, scheduledTime, completedTimes = [], compact = false }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const Icon = iconMap[habit.icon] || Circle;

  const handleToggle = async () => {
    setIsAnimating(true);
    await onToggle();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: compact ? -2 : -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        isCompleted ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : "bg-white hover:shadow-lg",
        compact && "shadow-sm"
      )}>
        <div className={compact ? "p-3" : "p-5"}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn(
                "rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                compact ? "w-10 h-10" : "w-12 h-12",
                colorMap[habit.color]
              )}>
                <Icon className={compact ? "w-5 h-5 text-white" : "w-6 h-6 text-white"} />
              </div>
              
              <div className="flex-1">
                <h3 className={cn(
                  "font-semibold transition-all",
                  compact ? "text-base" : "text-lg",
                  isCompleted ? "text-green-700 line-through" : "text-gray-800"
                )}>
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                )}
                
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {/* Scheduled Time Badge */}
                  {scheduledTime && (
                    <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                      <Clock className="w-3 h-3 mr-1" /> {formatTime(scheduledTime)}
                    </Badge>
                  )}
                  
                  {/* Frequency Badge */}
                  {habit.frequency === 'daily' && !scheduledTime && (
                    <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                      <CalendarDays className="w-3 h-3 mr-1" /> Diario
                    </Badge>
                  )}
                  {habit.frequency === 'weekly' && (
                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                      <Calendar className="w-3 h-3 mr-1" /> {habit.times_per_week}x/semana
                    </Badge>
                  )}
                  {habit.frequency === 'custom' && habit.weekly_days?.length > 0 && (
                    <Badge variant="outline" className="text-xs bg-violet-50 border-violet-200 text-violet-700">
                      <CalendarCheck className="w-3 h-3 mr-1" /> 
                      {habit.weekly_days.map(d => weekDaysShort[d]).join('-')}
                    </Badge>
                  )}
                  
                  {/* Multiple times per day indicator */}
                  {habit.scheduled_times?.length > 1 && (
                    <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                      {completedTimes.length}/{habit.scheduled_times.length} hoy
                    </Badge>
                  )}
                  
                  {/* Consistency % — primary metric */}
                  {habit.total_completions > 0 && (() => {
                    const daysSinceCreation = habit.created_date
                      ? Math.max(1, Math.floor((Date.now() - new Date(habit.created_date).getTime()) / 86400000))
                      : habit.total_completions;
                    const consistency = Math.round((habit.total_completions / daysSinceCreation) * 100);
                    const clampedConsistency = Math.min(100, consistency);
                    return (
                      <div className="flex items-center gap-1.5 text-sm">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-blue-600">{clampedConsistency}%</span>
                        <span className="text-gray-400 text-xs">consistencia</span>
                      </div>
                    );
                  })()}
                  {/* Streak as secondary subtle info */}
                  {habit.current_streak > 1 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>{habit.current_streak}d</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && !compact && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(habit);
                  }}
                  className="hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </Button>
              )}
              
              <Button
                size={compact ? "default" : "lg"}
                variant={isCompleted ? "default" : "outline"}
                onClick={handleToggle}
                disabled={disabled}
                aria-label={isCompleted ? 'Desmarcar hábito de hoy' : 'Marcar hábito como hecho hoy'}
                className={cn(
                  "rounded-full transition-all duration-300",
                  compact ? "w-12 h-12 p-0" : "h-12 px-4",
                  isCompleted ? "bg-[#78CAA8] text-[#2B1741] hover:bg-[#78CAA8]" : "border-[#693CA1] text-[#693CA1] hover:bg-[#FFF4DD]"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className={compact ? "w-5 h-5" : "w-5 h-5"} />
                ) : (
                  <Circle className={compact ? "w-5 h-5" : "w-5 h-5"} />
                )}
                {!compact && <span className="font-bold">{isCompleted ? 'Hecho' : 'Marcar'}</span>}
              </Button>
            </div>
          </div>
        </div>

        {isAnimating && isCompleted && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl" />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}