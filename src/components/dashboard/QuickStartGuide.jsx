import React, { useState, useEffect } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Target, Users, Trophy, Brain, Store, 
  ChevronRight, X, TrendingUp, Calendar, Award,
  FolderKanban, Flame, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function QuickStartGuide({ user, habits, projects, friendCount, onDismiss }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Define quick start steps based on user progress
  const getQuickStartSteps = () => {
    const steps = [];

    // Step 1: Create first habit
    if (habits.length === 0) {
      steps.push({
        id: 'create_habit',
        title: 'Crea tu primer hábito',
        description: 'Comienza tu viaje definiendo un hábito que quieras desarrollar',
        icon: <Target className="w-5 h-5" />,
        action: 'Crear hábito',
        link: null,
        onClick: () => {
          // Dispatch custom event to open create dialog
          window.dispatchEvent(new CustomEvent('openCreateHabit'));
        },
        color: 'from-green-500 to-emerald-500',
        completed: habits.length > 0
      });
    }

    // Step 2: Complete first habit
    const hasCompletedHabit = habits.some(h => (h.total_completions || 0) > 0);
    if (habits.length > 0 && !hasCompletedHabit) {
      steps.push({
        id: 'complete_habit',
        title: 'Completa tu primer hábito',
        description: 'Marca un hábito como completado y gana XP y monedas',
        icon: <CheckCircle2 className="w-5 h-5" />,
        action: 'Ver hábitos',
        link: null,
        onClick: () => {
          document.querySelector('.habits-section')?.scrollIntoView({ behavior: 'smooth' });
        },
        color: 'from-blue-500 to-cyan-500',
        completed: hasCompletedHabit
      });
    }

    // Step 3: Customize avatar
    if (user && !user.avatar_customized) {
      steps.push({
        id: 'customize_avatar',
        title: 'Personaliza tu avatar',
        description: 'Dale un toque único a tu personaje',
        icon: <Sparkles className="w-5 h-5" />,
        action: 'Ir al Avatar',
        link: createPageUrl('Avatar'),
        color: 'from-purple-500 to-pink-500',
        completed: user.avatar_customized
      });
    }

    // Step 4: Visit shop
    const hasVisitedShop = user && user.has_visited_shop;
    if ((user?.coins || 0) >= 50 && !hasVisitedShop) {
      steps.push({
        id: 'visit_shop',
        title: 'Visita la tienda',
        description: `Tienes ${user?.coins || 0} monedas. ¡Compra algo genial!`,
        icon: <Store className="w-5 h-5" />,
        action: 'Ir a la Tienda',
        link: createPageUrl('Shop'),
        color: 'from-amber-500 to-orange-500',
        completed: hasVisitedShop
      });
    }

    // Step 5: Add friend
    if (friendCount === 0) {
      steps.push({
        id: 'add_friend',
        title: 'Conecta con amigos',
        description: 'El progreso es más divertido acompañado',
        icon: <Users className="w-5 h-5" />,
        action: 'Buscar amigos',
        link: createPageUrl('Social'),
        color: 'from-blue-500 to-indigo-500',
        completed: friendCount > 0
      });
    }

    // Step 6: Try Coach AI
    const hasUsedCoach = user && user.coach_messages_sent > 0;
    if (!hasUsedCoach) {
      steps.push({
        id: 'try_coach',
        title: 'Habla con tu Coach IA',
        description: 'Obtén consejos personalizados basados en tu progreso',
        icon: <Brain className="w-5 h-5" />,
        action: 'Abrir Coach',
        link: createPageUrl('Coach'),
        color: 'from-violet-500 to-purple-500',
        completed: hasUsedCoach
      });
    }

    // Step 7: Create project
    if (habits.length >= 3 && projects.length === 0) {
      steps.push({
        id: 'create_project',
        title: 'Crea tu primer proyecto',
        description: 'Organiza múltiples hábitos en un proyecto con objetivos claros',
        icon: <FolderKanban className="w-5 h-5" />,
        action: 'Crear proyecto',
        link: createPageUrl('Projects'),
        color: 'from-teal-500 to-cyan-500',
        completed: projects.length > 0
      });
    }

    // Step 8: Reach 7-day streak
    const maxStreak = Math.max(...habits.map(h => h.current_streak || 0), 0);
    if (hasCompletedHabit && maxStreak < 7) {
      steps.push({
        id: 'streak_7',
        title: 'Alcanza una racha de 7 días',
        description: `Racha actual: ${maxStreak} días. ¡Sigue así!`,
        icon: <Flame className="w-5 h-5" />,
        action: 'Ver progreso',
        link: createPageUrl('Statistics'),
        color: 'from-orange-500 to-red-500',
        completed: maxStreak >= 7
      });
    }

    return steps;
  };

  const steps = getQuickStartSteps();
  const activeSteps = steps.filter(s => !s.completed);
  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Auto-dismiss if all steps completed
  useEffect(() => {
    if (activeSteps.length === 0 && totalSteps > 0) {
      const timer = setTimeout(() => {
        toast.success('¡Has completado el inicio rápido! 🎉', {
          description: 'Ya dominas lo básico de Habalyze'
        });
        onDismiss?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeSteps.length, totalSteps, onDismiss]);

  if (activeSteps.length === 0) return null;

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <Card className="overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-white relative">
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Inicio Rápido</h3>
                  <p className="text-xs text-purple-100">
                    {completedCount} de {totalSteps} completados
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>

            {/* Steps */}
            <div className="p-4 space-y-3">
              {activeSteps.slice(0, 3).map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-3 border-2 border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                      {step.link ? (
                        <Link to={step.link}>
                          <Button size="sm" className="h-7 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                            {step.action} <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={step.onClick}
                          className="h-7 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {step.action} <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {activeSteps.length > 3 && (
                <p className="text-xs text-center text-gray-500">
                  +{activeSteps.length - 3} pasos más
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {!isExpanded && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsExpanded(true)}
          className="mb-4 w-full"
        >
          <Card className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-gray-800">Inicio Rápido</p>
                  <p className="text-xs text-gray-500">{activeSteps.length} pasos pendientes</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </div>
          </Card>
        </motion.button>
      )}
    </AnimatePresence>
  );
}