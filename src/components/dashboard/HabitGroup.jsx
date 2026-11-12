import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HabitCard from '../habits/HabitCard';
import CreateHabitDialog from '../habits/CreateHabitDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

export default function HabitGroup({ groupName, habits, logs, onToggle, onEdit, disabled }) {
  const [expanded, setExpanded] = useState(true);
  const [showCreateSubHabit, setShowCreateSubHabit] = useState(false);
  const queryClient = useQueryClient();
  
  const completedCount = habits.filter(h => {
    const scheduledTime = h._scheduledTime;
    if (!scheduledTime) {
      return logs.some(log => log.habit_id === h.id && !log.scheduled_time);
    }
    return logs.some(log => log.habit_id === h.id && log.scheduled_time === scheduledTime);
  }).length;

  const totalCount = habits.length;
  const allCompleted = completedCount === totalCount;
  const firstHabit = habits[0];
  const parentHabit = firstHabit._parentHabit || firstHabit;

  const createSubHabitMutation = useMutation({
    mutationFn: (habitData) => db.entities.Habit.create(habitData),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      setShowCreateSubHabit(false);
      toast.success('Sub-hábito creado');
    },
  });

  return (
    <div className="space-y-2">
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${firstHabit.color}-400 to-${firstHabit.color}-600 flex items-center justify-center shadow-md`}>
              <span className="text-2xl">{firstHabit.icon === 'smile' ? '😊' : firstHabit.icon === 'droplet' ? '💧' : firstHabit.icon === 'dumbbell' ? '💪' : firstHabit.icon === 'book' ? '📚' : firstHabit.icon === 'moon' ? '🌙' : firstHabit.icon === 'utensils' ? '🍽️' : firstHabit.icon === 'heart' ? '❤️' : firstHabit.icon === 'brain' ? '🧠' : firstHabit.icon === 'coffee' ? '☕' : firstHabit.icon === 'music' ? '🎵' : '⭐'}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{groupName}</h3>
              <p className="text-sm text-gray-500">{firstHabit.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={allCompleted ? "default" : "outline"} className={allCompleted ? "bg-green-500" : ""}>
                  {completedCount}/{totalCount} completados
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowCreateSubHabit(true); 
              }}
              className="text-purple-600 hover:text-purple-700"
              title="Añadir sub-hábito"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </Card>

      <CreateHabitDialog
        open={showCreateSubHabit}
        onOpenChange={setShowCreateSubHabit}
        onSubmit={(data) => createSubHabitMutation.mutate(data)}
        parentHabit={parentHabit}
      />

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-4 space-y-3"
          >
            {habits.map((habit) => {
              const scheduledTime = habit._scheduledTime;
              const isCompleted = scheduledTime 
                ? logs.some(log => log.habit_id === habit.id && log.scheduled_time === scheduledTime)
                : logs.some(log => log.habit_id === habit.id && !log.scheduled_time);
              
              const completedTimes = logs.filter(log => log.habit_id === habit.id).map(log => log.scheduled_time).filter(Boolean);
              
              return (
                <HabitCard
                  key={habit._uniqueKey}
                  habit={habit}
                  isCompleted={isCompleted}
                  scheduledTime={scheduledTime}
                  completedTimes={completedTimes}
                  onToggle={() => onToggle({ habit, isCompleted, scheduledTime })}
                  onEdit={onEdit}
                  disabled={disabled}
                  compact={true}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}