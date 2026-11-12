import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, AlertCircle, Trophy, 
  Calendar, Clock, Target, Sparkles, Flame, ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InsightsPanel({ user, onSendMessage }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const analyzePatterns = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch habits and logs
        const habits = await db.entities.Habit.filter({ 
          created_by: user.email, 
          is_active: true 
        });
        
        const last30Days = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        const logs = await db.entities.HabitLog.filter({
          created_by: user.email,
          completed_date: { $gte: last30Days }
        });

        // Analyze patterns
        const analysis = analyzeHabitPatterns(habits, logs);
        setInsights(analysis);
      } catch (error) {
        console.error('Error analyzing patterns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    analyzePatterns();
  }, [user]);

  const analyzeHabitPatterns = (habits, logs) => {
    if (habits.length === 0) {
      return {
        hasHabits: false,
        message: 'Aún no tienes hábitos creados. ¡Comienza tu viaje!'
      };
    }

    // Best and worst streaks
    const bestStreak = habits.reduce((max, h) => 
      (h.current_streak || 0) > max.streak ? { habit: h, streak: h.current_streak } : max,
      { habit: null, streak: 0 }
    );

    const worstStreak = habits.reduce((min, h) => 
      (h.current_streak || 0) < min.streak ? { habit: h, streak: h.current_streak } : min,
      { habit: habits[0], streak: habits[0]?.current_streak || 0 }
    );

    // Habits at risk (no logs in last 7 days)
    const last7Days = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const habitsAtRisk = habits.filter(h => {
      const recentLogs = logs.filter(l => 
        l.habit_id === h.id && l.completed_date >= last7Days
      );
      return recentLogs.length === 0 && (h.current_streak || 0) > 0;
    });

    // Most productive day of week
    const dayCompletions = logs.reduce((acc, log) => {
      const day = format(parseISO(log.completed_date), 'EEEE', { locale: es });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    const mostProductiveDay = Object.entries(dayCompletions).sort((a, b) => b[1] - a[1])[0];

    // Time analysis (if available)
    const timeAnalysis = logs.reduce((acc, log) => {
      if (!log.scheduled_time) return acc;
      const hour = parseInt(log.scheduled_time.split(':')[0]);
      const timeOfDay = hour < 12 ? 'mañana' : hour < 18 ? 'tarde' : 'noche';
      acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
      return acc;
    }, {});
    const bestTimeOfDay = Object.entries(timeAnalysis).sort((a, b) => b[1] - a[1])[0];

    // Completion rate last 7 days
    const last7DaysLogs = logs.filter(l => l.completed_date >= last7Days);
    const expectedCompletions = habits.length * 7;
    const completionRate = expectedCompletions > 0 
      ? Math.round((last7DaysLogs.length / expectedCompletions) * 100) 
      : 0;

    return {
      hasHabits: true,
      habits: habits.length,
      bestStreak,
      worstStreak,
      habitsAtRisk: habitsAtRisk.length,
      atRiskList: habitsAtRisk,
      mostProductiveDay: mostProductiveDay || ['N/A', 0],
      bestTimeOfDay: bestTimeOfDay || ['N/A', 0],
      completionRate,
      totalLogs: logs.length,
      last7DaysLogs: last7DaysLogs.length
    };
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-purple-200 rounded w-3/4"></div>
          <div className="h-4 bg-purple-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!insights || !insights.hasHabits) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="text-center">
          <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">{insights?.message || 'Cargando análisis...'}</p>
          <Button
            onClick={() => onSendMessage('Quiero crear mi primer hábito')}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Crear mi primer hábito
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 sm:space-y-4 mb-4"
    >
      <Card className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-3 sm:mb-4 group"
        >
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            Sugerencias Inteligentes
            {insights.habitsAtRisk > 0 && (
              <Badge className="bg-red-500 text-white text-xs ml-1">{insights.habitsAtRisk}</Badge>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-600 hidden sm:inline">{isExpanded ? 'Ocultar' : 'Ver'}</span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="hidden md:flex items-center justify-end mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSendMessage('Analiza mi progreso en detalle')}
                  className="text-purple-600 hover:text-purple-700 text-xs"
                >
                  Ver análisis completo →
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {/* Completion rate */}
                <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-purple-100">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-[10px] sm:text-xs text-gray-500">Última semana</span>
                    <Badge className={insights.completionRate >= 70 ? 'bg-green-100 text-green-700 text-[10px] sm:text-xs' : 'bg-orange-100 text-orange-700 text-[10px] sm:text-xs'}>
                      {insights.completionRate}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {insights.completionRate >= 70 ? (
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                    )}
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                      {insights.last7DaysLogs} de {insights.habits * 7}
                    </span>
                  </div>
                </div>

                {/* Best streak */}
                {insights.bestStreak.habit && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-orange-100">
                    <span className="text-[10px] sm:text-xs text-gray-500">Mejor racha</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{insights.bestStreak.habit.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{insights.bestStreak.streak} días 🔥</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Most productive day */}
                {insights.mostProductiveDay[0] !== 'N/A' && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-blue-100">
                    <span className="text-[10px] sm:text-xs text-gray-500">Día más productivo</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm capitalize">{insights.mostProductiveDay[0]}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{insights.mostProductiveDay[1]} completaciones</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Best time of day */}
                {insights.bestTimeOfDay[0] !== 'N/A' && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-violet-100">
                    <span className="text-[10px] sm:text-xs text-gray-500">Mejor momento</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm capitalize">{insights.bestTimeOfDay[0]}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{insights.bestTimeOfDay[1]} completaciones</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Habits at risk alert */}
              {insights.habitsAtRisk > 0 && (
                <div className="bg-red-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border-2 border-red-200">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-red-700 text-xs sm:text-sm mb-1">
                        ⚠️ {insights.habitsAtRisk} hábito{insights.habitsAtRisk > 1 ? 's' : ''} en riesgo
                      </p>
                      <p className="text-[10px] sm:text-xs text-red-600 mb-2 line-clamp-2">
                        {insights.atRiskList.slice(0, 2).map(h => h.name).join(', ')}
                        {insights.habitsAtRisk > 2 && ` y ${insights.habitsAtRisk - 2} más`}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSendMessage(`Necesito ayuda con estos hábitos: ${insights.atRiskList.map(h => h.name).join(', ')}`)}
                        className="text-[10px] sm:text-xs border-red-300 text-red-700 hover:bg-red-100 h-7 sm:h-8"
                      >
                        Pedir consejos
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendMessage('Sugiere un nuevo hábito basado en mi progreso actual')}
                  className="text-[10px] sm:text-xs border-purple-200 hover:bg-purple-50 h-7 sm:h-8 px-2 sm:px-3"
                >
                  💡 Sugerir nuevo hábito
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendMessage('¿Cómo puedo mejorar mis rachas?')}
                  className="text-[10px] sm:text-xs border-orange-200 hover:bg-orange-50 h-7 sm:h-8 px-2 sm:px-3"
                >
                  🔥 Mejorar rachas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendMessage('Crea un proyecto personalizado para mi')}
                  className="text-[10px] sm:text-xs border-violet-200 hover:bg-violet-50 h-7 sm:h-8 px-2 sm:px-3"
                >
                  🎯 Nuevo proyecto
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Motivational message */}
      {isExpanded && insights.completionRate >= 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-200"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-700 text-xs sm:text-sm">¡Excelente trabajo! 🎉</p>
              <p className="text-[10px] sm:text-sm text-green-600">
                Estás en una racha increíble. Sigue así.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}