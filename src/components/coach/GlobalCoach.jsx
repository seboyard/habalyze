import { db } from '@/api/base44Client';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { Brain, X, MessageCircle, Target, Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeEngagement, toDateKey } from '@/lib/engagementEngine';
import { completeHabit } from '@/lib/habitActions';
import CoachInsightCards from './CoachInsightCards';
import CoachChat from './CoachChat';

const DAY_MS = 24 * 60 * 60 * 1000;

export default function GlobalCoach() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('today');
  const [user, setUser] = useState(null);
  const location = useLocation();
  const queryClient = useQueryClient();

  const today = toDateKey(new Date());
  const historyStart = toDateKey(new Date(Date.now() - 14 * DAY_MS));

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const { data: habits = [] } = useQuery({
    queryKey: ['habits', user?.email],
    queryFn: () => db.entities.Habit.filter({ is_active: true, created_by: user?.email }, '-created_date'),
    enabled: !!user?.email,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['logs', today, user?.email],
    queryFn: () => db.entities.HabitLog.filter({ completed_date: today, created_by: user?.email }),
    enabled: !!user?.email,
    staleTime: 60000,
    gcTime: 300000,
    placeholderData: [],
  });

  const { data: historyLogs = [] } = useQuery({
    queryKey: ['coach-history-logs', user?.email, today],
    queryFn: () => db.entities.HabitLog.filter({ created_by: user?.email, completed_date: { $gte: historyStart } }),
    enabled: !!user?.email && open,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const logs = useMemo(() => {
    const byId = new Map();
    [...todayLogs, ...historyLogs].forEach((log) => {
      if (log?.id) byId.set(log.id, log);
      else byId.set(`${log.habit_id}-${log.completed_date}-${log.scheduled_time || ''}`, log);
    });
    return Array.from(byId.values());
  }, [todayLogs, historyLogs]);

  const insight = useMemo(
    () => analyzeEngagement({ habits, logs, user }),
    [habits, logs, user]
  );

  const completeMutation = useMutation({
    mutationFn: ({ habit }) => completeHabit({ habit, user, date: today }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries(['habits']);
      queryClient.invalidateQueries(['logs']);
      queryClient.invalidateQueries(['coach-history-logs']);
      db.auth.me().then(setUser).catch(() => {});
      toast.success(`+${result.xpGain} XP · racha de ${result.newStreak} días`, {
        description: result.bonusMessage || `${variables.habit.name} completado`,
      });
    },
    onError: () => toast.error('No se pudo marcar el hábito. Intenta de nuevo.'),
  });

  // No mostrarlo en la página del Coach (ya existe ahí) ni en el onboarding
  const hidden = ['/Coach', '/Onboarding'].includes(location.pathname);
  if (hidden || !user) return null;

  const level = insight.momentumLevel;
  const TrendIcon = insight.trend >= 0 ? TrendingUp : TrendingDown;

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            aria-label="Abrir Coach IA"
            className="fixed z-40 right-4 bottom-24 lg:right-6 lg:bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-2xl shadow-purple-500/40 flex items-center justify-center"
          >
            <Brain className="w-7 h-7" />
            {insight.pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-white text-violet-700 text-[11px] font-bold flex items-center justify-center border-2 border-violet-500">
                {insight.pendingCount > 9 ? '9+' : insight.pendingCount}
              </span>
            )}
            {insight.streakAtRisk.length > 0 && (
              <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[9px]">
                🔥
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed z-50 inset-x-0 bottom-0 lg:inset-x-auto lg:right-6 lg:bottom-6 w-full lg:w-[400px] max-h-[88vh] lg:max-h-[76vh] bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 px-4 py-3 text-white flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold leading-tight">Coach IA</p>
                    <p className="text-[11px] text-violet-100">
                      {insight.greeting}, {user.full_name?.split(' ')[0] || 'crack'} · {level.label} {level.emoji}
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1.5 rounded-full hover:bg-white/20">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] text-violet-100 mb-1">
                    <span>Impulso</span>
                    <span className="flex items-center gap-0.5 font-semibold text-white">
                      {insight.momentum}%
                      <TrendIcon className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/25 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${level.bar}`}
                      style={{ width: `${Math.max(4, insight.momentum)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right leading-tight">
                  <p className="text-[10px] text-violet-100">Hoy</p>
                  <p className="text-sm font-bold">
                    {insight.doneToday}/{insight.dueToday}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              <button
                onClick={() => setTab('today')}
                className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  tab === 'today' ? 'text-violet-700 border-b-2 border-violet-600' : 'text-gray-500'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                Hoy
              </button>
              <button
                onClick={() => setTab('chat')}
                className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  tab === 'chat' ? 'text-violet-700 border-b-2 border-violet-600' : 'text-gray-500'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Hablar
              </button>
            </div>

            {/* Body */}
            {tab === 'today' ? (
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">{insight.headline}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {insight.riskScore > 0
                      ? `${insight.streakAtRisk.length} racha${insight.streakAtRisk.length > 1 ? 's' : ''} en riesgo ahora mismo`
                      : insight.hasHistory
                        ? `Mejor racha actual: ${insight.bestStreak} días`
                        : 'Marquemos el primer hábito de hoy'}
                  </p>
                </div>

                <CoachInsightCards
                  nudges={insight.nudges}
                  onComplete={(habit) => completeMutation.mutate({ habit })}
                  isCompleting={completeMutation.isPending}
                />

                {insight.premiumHook && (
                  <Link to={insight.premiumHook.url} onClick={() => setOpen(false)}>
                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3">
                      <p className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                        <Crown className="w-4 h-4" />
                        {insight.premiumHook.title}
                      </p>
                      <p className="text-xs text-amber-800/80 mt-0.5">{insight.premiumHook.body}</p>
                    </div>
                  </Link>
                )}

                <Link to="/Dashboard" onClick={() => setOpen(false)}>
                  <p className="text-center text-[11px] text-violet-600 font-semibold py-1">
                    Ver mi dashboard de hoy →
                  </p>
                </Link>
              </div>
            ) : (
              <CoachChat user={user} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}