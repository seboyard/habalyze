// Motor de engagement de Habalyze
// Modelo de "impulso" (momentum) + generador de nudges contextuales.
// Basado en dos ideas de la ciencia del hábito:
//   1. Lo reciente pesa más que lo antiguo (decaimiento por recencia).
//   2. Las rachas son frágiles al inicio: hay que protegerlas antes de que se rompan.

const DAY_MS = 24 * 60 * 60 * 1000;

export const toDateKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ¿Este hábito toca hoy?
export const isHabitDueOn = (habit, date) => {
  const dow = new Date(date).getDay();
  const days = habit.weekly_days || [];
  if (habit.frequency === 'custom' || habit.frequency === 'weekly') {
    return days.length > 0 ? days.includes(dow) : true;
  }
  return true;
};

export const MOMENTUM_LEVELS = {
  starting: { label: 'Arrancando', emoji: '🌱', text: 'text-gray-600', bar: 'from-gray-400 to-slate-500' },
  building: { label: 'Construyendo', emoji: '🧱', text: 'text-blue-600', bar: 'from-blue-400 to-cyan-400' },
  strong: { label: 'En racha', emoji: '⚡', text: 'text-violet-600', bar: 'from-violet-500 to-fuchsia-500' },
  elite: { label: 'Imparable', emoji: '🔥', text: 'text-amber-600', bar: 'from-amber-400 to-orange-500' },
};

const levelFor = (momentum) => {
  if (momentum >= 71) return 'elite';
  if (momentum >= 46) return 'strong';
  if (momentum >= 21) return 'building';
  return 'starting';
};

export const greetingForHour = (hour) => {
  if (hour < 6) return 'Sigue madrugando';
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

/**
 * Analiza el estado del usuario y devuelve métricas + nudges priorizados.
 */
export function analyzeEngagement({ habits = [], logs = [], user = null, now = new Date() }) {
  const activeHabits = habits.filter((h) => h.is_active !== false);
  const today = toDateKey(now);
  const nowMs = now.getTime();
  const hour = now.getHours();

  // Índice: fecha -> set de habit_ids completados
  const completedByDate = {};
  logs.forEach((log) => {
    if (!log.completed_date) return;
    if (!completedByDate[log.completed_date]) completedByDate[log.completed_date] = new Set();
    completedByDate[log.completed_date].add(log.habit_id);
  });

  // ── Hoy ────────────────────────────────────────────────────────────
  const dueHabits = activeHabits.filter((h) => isHabitDueOn(h, now));
  const doneIds = completedByDate[today] || new Set();
  const pendingHabits = dueHabits.filter((h) => !doneIds.has(h.id));
  const doneToday = dueHabits.length - pendingHabits.length;
  const progressPct = dueHabits.length > 0 ? Math.round((doneToday / dueHabits.length) * 100) : 0;

  // ── Momentum (días 1..14, para no castigar la mañana) ──────────────
  const dayRatios = [];
  for (let d = 1; d <= 14; d++) {
    const date = new Date(nowMs - d * DAY_MS);
    const key = toDateKey(date);
    const expected = activeHabits.filter((h) => isHabitDueOn(h, date)).length;
    const actual = completedByDate[key] ? completedByDate[key].size : 0;
    const ratio = expected > 0 ? Math.min(1, actual / expected) : 0;
    dayRatios.push({ key, ratio, d });
  }

  const weightedAvg = (items) => {
    let sum = 0;
    let weights = 0;
    items.forEach(({ ratio, d }) => {
      const w = 1 / (1 + d * 0.35);
      sum += ratio * w;
      weights += w;
    });
    return weights > 0 ? sum / weights : 0;
  };

  const hasHistory = activeHabits.length > 0 && dayRatios.some((d) => d.ratio > 0);
  const momentum = hasHistory ? Math.round(weightedAvg(dayRatios) * 100) : 0;
  const recent7 = momentum ? Math.round(weightedAvg(dayRatios.slice(0, 7)) * 100) : 0;
  const previous7 = Math.round(weightedAvg(dayRatios.slice(7)) * 100);
  const trend = hasHistory ? recent7 - previous7 : 0;

  // ── Días sin completar nada ────────────────────────────────────────
  let daysSinceLast = null;
  for (let d = 0; d <= 14; d++) {
    const key = toDateKey(new Date(nowMs - d * DAY_MS));
    if (completedByDate[key] && completedByDate[key].size > 0) {
      daysSinceLast = d;
      break;
    }
  }

  // ── Rachas en riesgo ───────────────────────────────────────────────
  const streakAtRisk = pendingHabits
    .filter((h) => (h.current_streak || 0) >= 2)
    .sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0));

  const riskScore = streakAtRisk.reduce((sum, h) => sum + Math.min(h.current_streak || 0, 30), 0);
  const bestStreak = Math.max(0, ...activeHabits.map((h) => h.current_streak || 0));
  const longestEver = Math.max(0, ...activeHabits.map((h) => h.best_streak || 0));

  // Hábito recomendado para hoy: la racha más larga en riesgo, si no el de hora más temprana
  const scheduledSorted = [...pendingHabits].sort((a, b) => {
    const ta = a.scheduled_times?.[0] || '99:99';
    const tb = b.scheduled_times?.[0] || '99:99';
    return ta.localeCompare(tb);
  });
  const recommendedHabit = streakAtRisk[0] || scheduledSorted[0] || null;

  const isPremium = !!(user?.is_premium && user?.premium_until && new Date(user.premium_until) > new Date());
  const xp = user?.experience || 0;
  const xpToNext = 100 - (xp % 100);

  // ── Nudges priorizados ─────────────────────────────────────────────
  const nudges = [];

  if (streakAtRisk.length > 0 && streakAtRisk[0].current_streak >= 3) {
    const h = streakAtRisk[0];
    nudges.push({
      id: 'streak_rescue',
      variant: 'danger',
      emoji: '🔥',
      title: `Tu racha de ${h.current_streak} días está en juego`,
      body: `${h.name} sigue pendiente. Un minuto ahora y la racha aguanta.`,
      habit: h,
      actionLabel: 'Marcar hecho',
    });
  }

  if (activeHabits.length === 0) {
    nudges.push({
      id: 'first_habit',
      variant: 'info',
      emoji: '🌱',
      title: 'Empecemos con un solo hábito',
      body: 'Un hábito pequeño, hecho hoy, vale más que diez planeados.',
      link: { url: '/Dashboard', label: 'Crear mi primer hábito' },
    });
  } else if (pendingHabits.length > 0 && doneToday === 0 && !nudges.some((n) => n.id === 'streak_rescue')) {
    nudges.push({
      id: 'start_day',
      variant: 'info',
      emoji: '🎯',
      title: pendingHabits.length > 3 ? 'Empieza por el más fácil' : 'Abre el día con uno',
      body:
        pendingHabits.length > 3
          ? `Tienes ${pendingHabits.length} pendientes. Elige uno y el resto se hace más ligero.`
          : `Te queda${pendingHabits.length > 1 ? 'n' : ''} ${pendingHabits.length} por hacer. Son 2 minutos.`,
      habit: recommendedHabit,
      actionLabel: 'Marcar hecho',
    });
  }

  if (doneToday > 0 && pendingHabits.length > 0) {
    nudges.push({
      id: 'almost_there',
      variant: 'warn',
      emoji: '⚡',
      title: `Te falta${pendingHabits.length > 1 ? 'n' : ''} ${pendingHabits.length} para cerrar el día`,
      body: `Llevas ${doneToday} de ${dueHabits.length}. No dejes la racha a medias.`,
      habit: recommendedHabit,
      actionLabel: 'Marcar hecho',
    });
  }

  if (daysSinceLast !== null && daysSinceLast >= 2) {
    nudges.push({
      id: 'comeback',
      variant: 'warn',
      emoji: '🔄',
      title: `Hace ${daysSinceLast} días que no marcas nada`,
      body: 'No hace falta recuperar todo: un solo hábito hoy reinicia el impulso.',
      habit: recommendedHabit,
      actionLabel: 'Volver con uno',
    });
  }

  if (dueHabits.length > 0 && pendingHabits.length === 0) {
    nudges.push({
      id: 'day_complete',
      variant: 'success',
      emoji: '🏆',
      title: '¡Día completo!',
      body: `Cerraste los ${dueHabits.length} hábitos de hoy. Así se construye un hábito de verdad.`,
      link: { url: '/Statistics', label: 'Ver mi progreso' },
    });
  }

  if (hasHistory && momentum > 0) {
    nudges.push({
      id: 'level_up',
      variant: 'info',
      emoji: '⭐',
      title: `Te faltan ${xpToNext} XP para el siguiente nivel`,
      body: `Nivel ${user?.level || 1} · impulso ${momentum}%. Un hábito más y subes.`,
      link: { url: '/Achievements', label: 'Ver logros' },
    });
  }

  const premiumHook =
    !isPremium && streakAtRisk.length > 0
      ? {
          title: 'Protege tus rachas con Premium',
          body: `Tienes ${streakAtRisk.length} racha${streakAtRisk.length > 1 ? 's' : ''} en riesgo. Con Premium puedes recuperarlas y hablar sin límite con tu coach.`,
          url: '/Premium',
        }
      : null;

  const momentumLevel = MOMENTUM_LEVELS[levelFor(momentum)];

  const headline = dueHabits.length === 0
    ? 'Aún no tienes hábitos para hoy'
    : pendingHabits.length === 0
      ? 'Todo hecho por hoy ✨'
      : `${doneToday} de ${dueHabits.length} hechos`;

  return {
    today,
    hour,
    greeting: greetingForHour(hour),
    headline,
    momentum,
    momentumLevel,
    momentumKey: levelFor(momentum),
    trend,
    hasHistory,
    dueToday: dueHabits.length,
    doneToday,
    pendingCount: pendingHabits.length,
    pendingHabits,
    progressPct,
    daysSinceLast,
    streakAtRisk,
    riskScore,
    bestStreak,
    longestEver,
    recommendedHabit,
    xpToNext,
    isPremium,
    nudges: nudges.slice(0, 4),
    premiumHook,
  };
}