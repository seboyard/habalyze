import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, Target, Brain,
  ChevronRight, Zap, Trophy, Users, TrendingUp, Loader2, Pencil, X
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { format, addMonths } from 'date-fns';
import PixelAvatar from '../components/avatar/PixelAvatar';

// ─── STEP 1 DATA ───────────────────────────────────────────────────────────────
const lifeGoals = [
  { id: 'fitness',    emoji: '🏃', label: 'Ponerme en forma y tener más energía' },
  { id: 'career',     emoji: '💼', label: 'Hacer crecer mi negocio o carrera' },
  { id: 'learning',   emoji: '🧠', label: 'Aprender algo nuevo' },
  { id: 'finance',    emoji: '💰', label: 'Mejorar mis finanzas' },
  { id: 'wellbeing',  emoji: '❤️', label: 'Mejorar mis relaciones y bienestar' },
  { id: 'creativity', emoji: '🎨', label: 'Desarrollar mi creatividad' },
];

// ─── GOAL DEFAULTS based on selection ──────────────────────────────────────────
const goalDefaults = {
  fitness:    (d) => ({ title: `Correr un 10K para ${d}`,              habit: 'Salir a correr o entrenar',          minVersion: 'Ponerme la ropa deportiva y salir aunque sea 10 minutos' }),
  career:     (d) => ({ title: `Lanzar mi primer proyecto para ${d}`,  habit: 'Dedicar 1 hora diaria a mi proyecto', minVersion: 'Abrir mi proyecto y trabajar aunque sea 15 minutos' }),
  learning:   (d) => ({ title: `Dominar mi nueva habilidad en 90 días`,habit: 'Estudiar o practicar 30 minutos',      minVersion: 'Abrir el material y aprender algo, aunque sea 10 minutos' }),
  finance:    (d) => ({ title: `Ahorrar y ordenar mis finanzas en 3 meses`, habit: 'Revisar mis gastos del día',     minVersion: 'Registrar un gasto aunque sea uno' }),
  wellbeing:  (d) => ({ title: `Construir una rutina de bienestar sólida`,  habit: '10 minutos de meditación o journaling', minVersion: 'Respirar profundo 3 veces y escribir una frase de gratitud' }),
  creativity: (d) => ({ title: `Terminar mi primer proyecto creativo`,  habit: 'Crear algo, aunque sean 15 minutos', minVersion: 'Abrir mi proyecto creativo y hacer algo, lo que sea' }),
};

// ─── AVATAR base options ────────────────────────────────────────────────────────
const avatarOptions = [
  { skinColor: 'fair',    hairStyle: 'short',    hairColor: 'brown',    shirtStyle: 'tshirt',   shirtColor: '#6366f1' },
  { skinColor: 'medium',  hairStyle: 'curly',    hairColor: 'black',    shirtStyle: 'hoodie',   shirtColor: '#ec4899' },
  { skinColor: 'light',   hairStyle: 'long',     hairColor: 'blonde',   shirtStyle: 'tshirt',   shirtColor: '#10b981' },
  { skinColor: 'tan',     hairStyle: 'spiky',    hairColor: 'darkBrown',shirtStyle: 'jacket',   shirtColor: '#f59e0b' },
  { skinColor: 'dark',    hairStyle: 'afro',     hairColor: 'black',    shirtStyle: 'hoodie',   shirtColor: '#8b5cf6' },
  { skinColor: 'olive',   hairStyle: 'ponytail', hairColor: 'brown',    shirtStyle: 'tshirt',   shirtColor: '#3b82f6' },
];

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPrefs, setUserPrefs] = useState(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [selectedGoals, setSelectedGoals] = useState([]);

  // Step 3
  const [goalTitle, setGoalTitle] = useState('');
  const [createdGoalId, setCreatedGoalId] = useState(null);

  // Step 4 – AI habit suggestions
  const [suggestedHabits, setSuggestedHabits] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [createdHabitIds, setCreatedHabitIds] = useState([]);

  // Step 5
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);

  // Step 6
  const [habitDoneToday, setHabitDoneToday] = useState(null);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [celebrated, setCelebrated] = useState(false);

  // Legacy – keep for finish step
  const [createdHabitId, setCreatedHabitId] = useState(null);

  // Derived defaults from first selected goal
  const primaryGoal = selectedGoals[0];
  const threeMonthsDate = format(addMonths(new Date(), 3), 'dd/MM/yyyy');
  const defaults = primaryGoal ? goalDefaults[primaryGoal]?.(threeMonthsDate) : null;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await db.auth.me();
        setUser(currentUser);

        const prefs = await db.entities.UserPreferences.filter({ user_email: currentUser.email });
        if (prefs.length > 0) {
          setUserPrefs(prefs[0]);
          if (prefs[0].onboarding_status === 'completed') {
            navigate(createPageUrl('Dashboard'));
            return;
          }
        }

        // Handle referral codes (preserve existing logic)
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('invite');
        const oldRefCode = urlParams.get('ref');
        if ((inviteCode || oldRefCode) && !currentUser.referred_by) {
          try {
            let referrerEmail = null;
            let invitation = null;
            if (inviteCode) {
              const invitations = await db.entities.Invitation.filter({ invitation_code: inviteCode, status: 'pending' });
              if (invitations.length > 0) {
                invitation = invitations[0];
                referrerEmail = invitation.referrer_email;
                await db.entities.Invitation.update(invitation.id, { status: 'accepted', accepted_date: new Date().toISOString() });
              }
            } else if (oldRefCode) {
              try { referrerEmail = atob(oldRefCode); } catch (e) {}
            }
            if (referrerEmail && referrerEmail !== currentUser.email) {
              await db.auth.updateMe({ referred_by: referrerEmail });
              const referrers = await db.entities.User.filter({ email: referrerEmail });
              if (referrers.length > 0) {
                const referrer = referrers[0];
                const newCount = (referrer.referral_count || 0) + 1;
                await db.entities.User.update(referrer.id, { referral_count: newCount, coins: (referrer.coins || 0) + 100, experience: (referrer.experience || 0) + 50 });
                await db.entities.Notification.create({ user_email: referrerEmail, type: 'referral_success', title: '¡Nuevo referido!', message: `${currentUser.full_name} se unió con tu invitación. +100 monedas`, icon: '🎉', link: '/dashboard' });
              }
            }
          } catch (e) { console.log('Error processing invite:', e); }
        }
      } catch (e) {
        navigate(createPageUrl('Landing'));
      }
    };
    loadUser();
  }, [navigate]);

  // When primary goal changes, pre-fill suggested goal title
  useEffect(() => {
    if (defaults) {
      setGoalTitle(defaults.title);
    }
  }, [primaryGoal]);

  const toggleGoal = (id) => {
    setSelectedGoals(prev => {
      if (prev.includes(id)) return prev.filter(g => g !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // ── Step 3: Create Goal + load AI habit suggestions ─────────────────────────
  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) return;
    setIsLoading(true);
    try {
      const endDate = format(addMonths(new Date(), 3), 'yyyy-MM-dd');
      const goal = await db.entities.Goal.create({
        title: goalTitle.trim(),
        target_type: 'custom',
        target_value: 100,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: endDate,
        status: 'active',
        icon: lifeGoals.find(g => g.id === primaryGoal)?.emoji || '🎯',
        color: 'purple',
      });
      setCreatedGoalId(goal.id);

      // Load AI habit suggestions in background
      setLoadingSuggestions(true);
      const goalLabels = selectedGoals.map(id => lifeGoals.find(g => g.id === id)?.label).filter(Boolean).join(', ');
      db.integrations.Core.InvokeLLM({
        prompt: `Eres un coach de hábitos. El usuario quiere lograr la siguiente meta: "${goalTitle.trim()}". Sus áreas de interés son: ${goalLabels}. Propón exactamente 6 hábitos concretos, accionables y variados que le ayuden a alcanzar esa meta. Cada hábito debe ser simple, específico y realizables diariamente o casi diariamente. Devuelve SOLO el JSON pedido, sin explicaciones.`,
        response_json_schema: {
          type: 'object',
          properties: {
            habits: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  icon: { type: 'string', enum: ['dumbbell','book','droplet','moon','utensils','heart','brain','smile','coffee','music'] },
                  color: { type: 'string', enum: ['purple','blue','green','orange','pink','red','teal','yellow'] },
                  frequency: { type: 'string', enum: ['daily','weekly'] },
                }
              }
            }
          }
        }
      }).then(res => {
        const habits = res?.habits || [];
        setSuggestedHabits(habits.map((h, i) => ({ ...h, selected: true, editing: false, id: i })));
      }).catch(() => {
        // Fallback with defaults based on goal
        const fallback = goalDefaults[primaryGoal]?.(threeMonthsDate);
        setSuggestedHabits([
          { id: 0, name: fallback?.habit || 'Hábito diario', description: fallback?.minVersion || '', icon: 'heart', color: 'purple', frequency: 'daily', selected: true, editing: false },
        ]);
      }).finally(() => setLoadingSuggestions(false));

      nextStep();
    } catch (e) {
      toast.error('Error al crear la meta');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 4: Create selected habits ──────────────────────────────────────────
  const handleCreateSelectedHabits = async () => {
    const toCreate = suggestedHabits.filter(h => h.selected);
    if (toCreate.length === 0) {
      toast.error('Selecciona al menos un hábito');
      return;
    }
    setIsLoading(true);
    try {
      const created = [];
      for (const h of toCreate) {
        const habit = await db.entities.Habit.create({
          name: h.name.trim(),
          description: h.description || '',
          icon: h.icon || 'heart',
          color: h.color || 'purple',
          frequency: h.frequency || 'daily',
          times_per_week: h.frequency === 'weekly' ? 3 : undefined,
          current_streak: 0,
          best_streak: 0,
          total_completions: 0,
          is_active: true,
          linked_goal_ids: createdGoalId ? [createdGoalId] : [],
        });
        created.push(habit.id);
      }
      setCreatedHabitIds(created);
      setCreatedHabitId(created[0] || null);
      nextStep();
    } catch (e) {
      toast.error('Error al crear hábitos');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 6: Save avatar ──────────────────────────────────────────────────────
  const handleSaveAvatar = async () => {
    setIsLoading(true);
    try {
      await db.auth.updateMe({ avatar_config: avatarOptions[selectedAvatarIndex] });
      nextStep();
    } catch (e) {
      toast.error('Error al guardar avatar');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 6: First check ──────────────────────────────────────────────────────
  const handleHabitCheck = async (done) => {
    setHabitDoneToday(done);
    if (done && !celebrated) {
      setCelebrated(true);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      const firstHabitId = createdHabitIds[0] || createdHabitId;
      if (firstHabitId) {
        const today = format(new Date(), 'yyyy-MM-dd');
        await db.entities.HabitLog.create({ habit_id: firstHabitId, completed_date: today });
        await db.entities.Habit.update(firstHabitId, { current_streak: 1, best_streak: 1, total_completions: 1, last_completed: today });
        await db.auth.updateMe({ experience: (user?.experience || 0) + 20 });
      }
    }
  };

  // ── Step 8: Finish ───────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const prefsData = {
        user_email: user.email,
        onboarding_status: 'completed',
        has_completed_tour: true,
        selected_goals: selectedGoals,
        primary_goal_id: createdGoalId || null,
        primary_habit_id: createdHabitIds[0] || createdHabitId || null,
        onboarding_version: 'v2',
      };

      if (userPrefs?.id) {
        await db.entities.UserPreferences.update(userPrefs.id, prefsData);
      } else {
        await db.entities.UserPreferences.create(prefsData);
      }

      await db.auth.updateMe({ coins: (user?.coins || 0) + 100, experience: (user?.experience || 0) + 50, level: 1 });

      // Beta tester badge
      try {
        const existingBadge = await db.entities.UserBadge.filter({ user_email: user.email, badge_id: 'beta_tester' });
        if (existingBadge.length === 0) {
          await db.entities.UserBadge.create({ user_email: user.email, badge_id: 'beta_tester', current_level: 1, current_progress: 1, unlocked_date: new Date().toISOString(), is_featured: true });
        }
      } catch (e) {}

      try { await db.functions.invoke('sendWelcomeEmail', { userEmail: user.email, userName: user.full_name }); } catch (e) {}

      confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 } });
      toast.success('¡Bienvenido a Habalyze! 🎉', { description: '+100 monedas de bienvenida' });

      setTimeout(() => navigate(createPageUrl('Dashboard')), 1500);
    } catch (e) {
      toast.error('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            {step > 1 && (
              <button onClick={prevStep} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">Paso {step} de {TOTAL_STEPS}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Life Goals ─────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-2">Habalyze</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">¿Qué quieres lograr este año?</h1>
              <p className="text-sm text-violet-700 font-medium mb-1 italic">"Construye los hábitos que construyen tu vida."</p>
              <p className="text-gray-500 mb-6 text-sm">No te preguntamos por hábitos todavía. Primero cuéntanos a dónde vas.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {lifeGoals.map(g => (
                  <motion.button
                    key={g.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedGoals.includes(g.id)
                        ? 'border-violet-500 bg-violet-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-violet-300'
                    }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-sm font-medium text-gray-800 leading-tight">{g.label}</span>
                    {selectedGoals.includes(g.id) && <Check className="w-4 h-4 text-violet-600 ml-auto flex-shrink-0" />}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-center text-gray-400 mb-4">Puedes elegir hasta 3</p>
              <Button
                onClick={nextStep}
                disabled={selectedGoals.length === 0}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 h-12 text-base"
              >
                Esto es lo que quiero <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ── STEP 2: Bridge ─────────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="text-center">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Los que logran sus metas no tienen más fuerza de voluntad.
                </h1>
                <p className="text-gray-500">Tienen mejores sistemas. Habalyze te ayuda a construir el tuyo.</p>
              </div>

              {/* Animation: Habit → Project → Goal */}
              <div className="flex items-center justify-center gap-2 mb-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {[
                  { emoji: '✅', label: 'Hábito diario' },
                  null,
                  { emoji: '🛤️', label: 'Camino activo' },
                  null,
                  { emoji: '🎯', label: 'Meta de vida' },
                ].map((item, i) =>
                  item ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.25 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-2xl shadow">
                        {item.emoji}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                    </motion.div>
                  ) : (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.25 }}>
                      <ArrowRight className="w-5 h-5 text-violet-400" />
                    </motion.div>
                  )
                )}
              </div>

              <Button onClick={nextStep} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 h-12 text-base">
                Crear mi sistema <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ── STEP 3: First Goal ─────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Tu primera meta</h1>
              <p className="text-gray-500 mb-6 text-sm">¿A dónde quieres llegar en los próximos 3 meses?</p>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">Mi meta es:</label>
                <Textarea
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="Describe tu meta..."
                  className="h-24 text-base resize-none"
                />
              </div>

              <p className="text-xs text-gray-400 mb-6">Puedes cambiarla después. Lo importante es empezar con dirección.</p>

              <Button
                onClick={handleCreateGoal}
                disabled={!goalTitle.trim() || isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 h-12 text-base"
              >
                {isLoading ? 'Guardando...' : <>Esta es mi meta <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </motion.div>
          )}

          {/* ── STEP 4: AI Habit Suggestions ───────────────────────────────── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Tus primeros hábitos</h1>
              <p className="text-gray-500 mb-4 text-sm">La IA preparó hábitos personalizados para tu meta. Elige los que quieras y empieza con ellos.</p>

              {loadingSuggestions ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
                  <p className="text-sm text-gray-500">Preparando tus hábitos personalizados...</p>
                </div>
              ) : (
                <div className="space-y-3 mb-5 max-h-[380px] overflow-y-auto pr-1">
                  {suggestedHabits.map((habit, i) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        habit.selected
                          ? 'border-violet-500 bg-violet-50 shadow-sm'
                          : 'border-gray-200 bg-white opacity-60'
                      }`}
                      onClick={() => setSuggestedHabits(prev => prev.map(h => h.id === habit.id ? { ...h, selected: !h.selected } : h))}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                        habit.selected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                      }`}>
                        {habit.selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {habit.editing ? (
                          <Input
                            value={habit.name}
                            autoFocus
                            onClick={e => e.stopPropagation()}
                            onChange={e => setSuggestedHabits(prev => prev.map(h => h.id === habit.id ? { ...h, name: e.target.value } : h))}
                            onBlur={() => setSuggestedHabits(prev => prev.map(h => h.id === habit.id ? { ...h, editing: false } : h))}
                            onKeyDown={e => e.key === 'Enter' && setSuggestedHabits(prev => prev.map(h => h.id === habit.id ? { ...h, editing: false } : h))}
                            className="h-8 text-sm mb-1"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 text-sm leading-tight">{habit.name}</p>
                        )}
                        {habit.description && <p className="text-xs text-gray-500 mt-0.5 leading-tight">{habit.description}</p>}
                        <span className="text-xs text-violet-600 font-medium mt-1 inline-block">
                          {habit.frequency === 'daily' ? '📅 Diario' : '📅 Semanal'}
                        </span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setSuggestedHabits(prev => prev.map(h => h.id === habit.id ? { ...h, editing: true, selected: true } : h)); }}
                        className="p-1.5 rounded-lg hover:bg-violet-100 text-gray-400 hover:text-violet-600 transition-colors flex-shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mb-4 text-center">
                {suggestedHabits.filter(h => h.selected).length} de {suggestedHabits.length} hábitos seleccionados
              </p>

              <Button
                onClick={handleCreateSelectedHabits}
                disabled={isLoading || loadingSuggestions || suggestedHabits.filter(h => h.selected).length === 0}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 h-12 text-base"
              >
                {isLoading ? 'Creando hábitos...' : <>Empezar con estos hábitos <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </motion.div>
          )}

          {/* ── STEP 5: Avatar ─────────────────────────────────────────────── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Tu compañero de camino</h1>
              <p className="text-gray-500 mb-6 text-sm">Cada hábito completado lo hace crecer. Cada meta alcanzada lo transforma.</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {avatarOptions.map((cfg, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatarIndex(i)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                      selectedAvatarIndex === i ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <PixelAvatar user={{ avatar_config: cfg }} size="medium" showLevel={false} showCoins={false} />
                    {selectedAvatarIndex === i && <Check className="w-4 h-4 text-violet-600 mt-1" />}
                  </motion.button>
                ))}
              </div>

              <p className="text-xs text-center text-gray-400 mb-6">Lo podrás personalizar con ropa, accesorios y más a medida que avances.</p>

              <Button
                onClick={handleSaveAvatar}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 h-12 text-base"
              >
                {isLoading ? 'Guardando...' : <>Este soy yo <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </motion.div>
          )}

          {/* ── STEP 6: First Check ────────────────────────────────────────── */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">¿Ya hiciste alguno de tus hábitos hoy?</h1>
              <p className="text-gray-500 mb-6 text-sm font-medium">
                {suggestedHabits.filter(h => h.selected)[0]?.name || 'Tu primer hábito'}
              </p>

              {habitDoneToday === null && (
                <div className="flex flex-col gap-3 mb-6">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleHabitCheck(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold shadow-lg"
                  >
                    ✅ Sí, ya lo hice
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleHabitCheck(false)}
                    className="w-full py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-600 text-base font-medium"
                  >
                    Aún no
                  </motion.button>
                </div>
              )}

              {habitDoneToday === true && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-lg font-bold text-gray-900 mb-1">Así se empieza.</p>
                  <p className="text-gray-500 text-sm mb-4">Un día, una acción. Eso es todo lo que se necesita.</p>
                  <div className="flex items-center justify-center gap-2 bg-green-50 rounded-xl px-4 py-2 border border-green-200 inline-flex mx-auto">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">+20 XP • Día 1 de racha</span>
                  </div>
                </motion.div>
              )}

              {habitDoneToday === false && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
                  <p className="text-base text-gray-700 mb-4">Perfecto. ¿A qué hora quieres recordarlo?</p>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="w-full border-2 border-violet-200 rounded-xl px-4 py-3 text-lg text-center font-bold text-violet-700 mb-3"
                  />
                  <p className="text-sm text-gray-400 italic">Mañana es el primer día.</p>
                </motion.div>
              )}

              {habitDoneToday !== null && (
                <Button onClick={nextStep} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 h-12 text-base">
                  Ver mi sistema <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </motion.div>
          )}

          {/* ── STEP 7: Welcome ────────────────────────────────────────────── */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🚀</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Tu sistema está listo</h1>
                <p className="text-gray-500 text-sm">Esto es lo que puedes hacer desde aquí:</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: TrendingUp, emoji: '📈', title: 'Agregar más hábitos', desc: 'Conecta cada hábito a una meta', color: 'from-violet-500 to-purple-500' },
                  { icon: Users, emoji: '👥', title: 'Unirte a un gremio', desc: 'Compite y motívate con amigos', color: 'from-blue-500 to-cyan-500' },
                  { icon: Trophy, emoji: '🎮', title: 'Explorar recompensas', desc: 'XP, logros, items para tu avatar', color: 'from-amber-500 to-orange-500' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl shadow`}>
                      {item.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-center text-gray-400 mb-6">El resto lo irás descubriendo solo.</p>

              <Button
                onClick={handleFinish}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 h-14 text-lg font-bold shadow-xl"
              >
                {isLoading ? 'Entrando...' : <>Entrar a Habalyze <Sparkles className="w-5 h-5 ml-2" /></>}
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}