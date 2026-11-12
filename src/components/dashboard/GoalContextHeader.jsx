import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, Plus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

/**
 * Displays the active primary goal as context header on the dashboard.
 * Props:
 *   goals        – array of Goal records
 *   habits       – array of Habit records (to find which goal has most habits today)
 *   userName     – string
 */
export default function GoalContextHeader({ goals, habits, userName }) {
  // Find goal with most linked habits (active today)
  const activeGoals = (goals || []).filter(g => g.status === 'active');

  const primaryGoal = activeGoals.reduce((best, goal) => {
    const count = (habits || []).filter((habit) => habit.linked_goal_ids?.includes(goal.id)).length;
    if (!best || count > best.count) return { ...goal, count };
    return best;
  }, null);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  if (!primaryGoal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6"
      >
        <p className="text-lg font-bold text-gray-800">{greeting}, {userName?.split(' ')[0] || 'Campeón'} 👋</p>
        <p className="text-sm text-gray-500 mt-1 mb-3">Todavía no tienes una meta activa.</p>
        <Link to={createPageUrl('Objectives')}>
          <Button size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 gap-2">
            <Plus className="w-4 h-4" /> Crear mi primera meta
          </Button>
        </Link>
      </motion.div>
    );
  }

  const progress = primaryGoal.current_progress || primaryGoal.current_value || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-5 border-2 border-violet-200 shadow-sm mb-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-800">
            {greeting}, {userName?.split(' ')[0] || 'Campeón'} 👋
          </p>
          <div className="flex items-center gap-1.5 mt-1 mb-3">
            <Target className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <p className="text-sm text-violet-700 font-medium truncate">
              Hoy avanzas en: <span className="font-bold">{primaryGoal.title}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-xs font-bold text-violet-700 whitespace-nowrap">{Math.round(progress)}%</span>
          </div>
        </div>
        <Link to={createPageUrl('Objectives')}>
          <Button size="sm" variant="ghost" className="text-violet-600 hover:bg-violet-100 flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}