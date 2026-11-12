import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Check, X, Minus, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isAfter, isBefore, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const weekDaysShort = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function HabitComplianceCalendar({ habits, logs }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id || '');

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  const calendarData = useMemo(() => {
    if (!selectedHabit) return [];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const habitCreatedDate = selectedHabit.created_date ? parseISO(selectedHabit.created_date.split('T')[0]) : null;
    const today = new Date();

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayOfWeek = getDay(day); // 0 = Sunday
      const isCompleted = logs.some(log => log.habit_id === selectedHabitId && log.completed_date === dateStr);
      
      // Check if this day applies based on habit frequency
      let applies = true;
      
      if (selectedHabit.frequency === 'custom') {
        applies = (selectedHabit.weekly_days || []).includes(dayOfWeek);
      } else if (selectedHabit.frequency === 'weekly') {
        // For weekly habits, all days apply but we check weekly completion
        applies = true;
      }
      
      // Don't show status for future days or before habit creation
      const isFuture = isAfter(day, today);
      const isBeforeCreation = habitCreatedDate && isBefore(day, habitCreatedDate);
      
      let status = 'neutral'; // Default: doesn't apply or future
      
      if (isFuture || isBeforeCreation) {
        status = 'neutral';
      } else if (!applies) {
        status = 'not-applicable';
      } else if (isCompleted) {
        status = 'completed';
      } else {
        status = 'missed';
      }

      return {
        date: day,
        dateStr,
        dayOfWeek,
        status,
        isToday: isSameDay(day, today)
      };
    });
  }, [selectedHabit, selectedHabitId, currentMonth, logs]);

  // Calculate month statistics
  const monthStats = useMemo(() => {
    const completed = calendarData.filter(d => d.status === 'completed').length;
    const missed = calendarData.filter(d => d.status === 'missed').length;
    const total = completed + missed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, missed, total, rate };
  }, [calendarData]);

  // First day of month padding
  const firstDayPadding = getDay(startOfMonth(currentMonth));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'missed':
        return <X className="w-4 h-4 text-red-500" />;
      case 'not-applicable':
        return <Minus className="w-3 h-3 text-gray-300" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status, isToday) => {
    const base = isToday ? 'ring-2 ring-purple-500 ring-offset-1' : '';
    switch (status) {
      case 'completed':
        return cn(base, 'bg-green-100 border-green-300');
      case 'missed':
        return cn(base, 'bg-red-50 border-red-200');
      case 'not-applicable':
        return cn(base, 'bg-gray-50 border-gray-200');
      default:
        return cn(base, 'bg-white border-gray-100');
    }
  };

  if (habits.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay hábitos para mostrar</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Calendario de Cumplimiento
        </h3>
      </div>

      {/* Habit Selector */}
      <div className="mb-4">
        <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un hábito" />
          </SelectTrigger>
          <SelectContent>
            {habits.map(habit => (
              <SelectItem key={habit.id} value={habit.id}>
                {habit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold text-gray-700 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
        <div className="bg-green-50 rounded-lg p-2">
          <div className="font-bold text-green-700">{monthStats.completed}</div>
          <div className="text-green-600">Completados</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2">
          <div className="font-bold text-red-700">{monthStats.missed}</div>
          <div className="text-red-600">Fallados</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="font-bold text-gray-700">{monthStats.total}</div>
          <div className="text-gray-600">Total</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <div className="font-bold text-purple-700">{monthStats.rate}%</div>
          <div className="text-purple-600">Tasa</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week days header */}
        {weekDaysShort.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for first week padding */}
        {[...Array(firstDayPadding)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {calendarData.map((day, i) => (
          <motion.div
            key={day.dateStr}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.01 }}
            className={cn(
              "aspect-square rounded-lg border flex flex-col items-center justify-center text-xs transition-all",
              getStatusClass(day.status, day.isToday)
            )}
            title={`${format(day.date, 'd MMMM', { locale: es })}: ${
              day.status === 'completed' ? 'Completado ✓' : 
              day.status === 'missed' ? 'No completado ✗' : 
              day.status === 'not-applicable' ? 'No aplica' : 'Pendiente'
            }`}
          >
            <span className={cn(
              "font-medium",
              day.isToday && "text-purple-700"
            )}>
              {format(day.date, 'd')}
            </span>
            {getStatusIcon(day.status)}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-gray-600">Completado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded flex items-center justify-center">
            <X className="w-3 h-3 text-red-500" />
          </div>
          <span className="text-gray-600">No completado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
            <Minus className="w-2 h-2 text-gray-300" />
          </div>
          <span className="text-gray-600">No aplica</span>
        </div>
      </div>
    </Card>
  );
}