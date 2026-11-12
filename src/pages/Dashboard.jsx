import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import '../components/i18n/config';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Award, Zap, BarChart3, FolderKanban, ChevronRight, Settings, CheckCircle2, Brain, MessageSquare, History } from 'lucide-react';
import GoalContextHeader from '../components/dashboard/GoalContextHeader';
import { Link } from 'react-router-dom';
import { format, startOfDay, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { REWARDS, getStreakBonus, calculateLevel } from '../components/common/constants';
import { sendUnveilEvent } from '../lib/unveilEvents';

import PixelAvatar from '../components/avatar/PixelAvatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HabitCard from '../components/habits/HabitCard';
import LevelProgress from '../components/habits/LevelProgress';
import CreateHabitDialog from '../components/habits/CreateHabitDialog';
import EditHabitDialog from '../components/habits/EditHabitDialog';
import ScratchCard from '../components/rewards/ScratchCard';
import GuidedTour from '../components/tour/GuidedTour';
import ProjectTaskList from '../components/projects/ProjectTaskList';
import { celebrations } from '../components/rewards/CelebrationEffects';
import DailyQuote from '../components/dashboard/DailyQuote';
import DashboardSettings from '../components/dashboard/DashboardSettings';
import HabitGroup from '../components/dashboard/HabitGroup';
import ShareImageModal from '../components/social/ShareImageModal';
import QuickStartGuide from '../components/dashboard/QuickStartGuide';
import FeatureDiscovery from '../components/dashboard/FeatureDiscovery';
import PWAInstallPrompt from '../components/common/PWAInstallPrompt';
import ActionHistory from '../components/dashboard/ActionHistory';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showDailyQuote, setShowDailyQuote] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEventType, setShareEventType] = useState(null);
  const [shareEventData, setShareEventData] = useState(null);
  const [user, setUser] = useState(null);
  const [userPrefs, setUserPrefs] = useState(null);
  const [showCompletedSection, setShowCompletedSection] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [showFeatureDiscovery, setShowFeatureDiscovery] = useState(true);
  const [undoStack, setUndoStack] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const queryClient = useQueryClient();
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const dateLocale = i18n.language === 'en' ? enUS : es;

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();

      const updates = {};
      if (!currentUser.level) updates.level = 1;
      if (currentUser.experience === null || currentUser.experience === undefined) updates.experience = 0;
      if (currentUser.coins === null || currentUser.coins === undefined) updates.coins = 0;
      if (currentUser.gems === null || currentUser.gems === undefined) updates.gems = 0;
      if (!currentUser.username || currentUser.username.trim() === '') updates.username = `user${Date.now()}`;
      if (!currentUser.full_name || currentUser.full_name.trim() === '') updates.full_name = 'Usuario';
      updates.last_login_date = new Date().toISOString();

      if (Object.keys(updates).length > 0) {
        await db.auth.updateMe(updates);
        const updatedUser = await db.auth.me();
        setUser(updatedUser);
      } else {
        setUser(currentUser);
      }

      try {
        const userBadges = await db.entities.UserBadge.filter({ 
          user_email: currentUser.email, 
          badge_id: 'beta_tester' 
        });
        if (userBadges.length === 0) {
          await db.entities.UserBadge.create({
            user_email: currentUser.email,
            badge_id: 'beta_tester',
            current_level: 1,
            current_progress: 1,
            unlocked_date: new Date().toISOString(),
            is_featured: true
          });
        }
      } catch (e) {
        console.log('Error checking beta badge:', e);
      }

      try {
        const prefs = await db.entities.UserPreferences.filter({ user_email: currentUser.email });
        if (prefs.length > 0) {
          setUserPrefs(prefs[0]);
          if (prefs[0].onboarding_status === 'completed' && !prefs[0].has_completed_tour) {
            setShowTour(true);
          }
          if (prefs[0].quick_start_dismissed || prefs[0].show_quick_start_guide === false) {
            setShowQuickStart(false);
          }
          if (prefs[0].feature_discovery_dismissed) {
            setShowFeatureDiscovery(false);
          }
        } else {
          window.location.href = createPageUrl('Onboarding');
        }
      } catch (e) {
        console.log('Error fetching preferences:', e);
      }
    };
    loadUser();
    }, []);

    useEffect(() => {
    const handleOpenCreate = () => setShowCreateDialog(true);
    window.addEventListener('openCreateHabit', handleOpenCreate);
    return () => window.removeEventListener('openCreateHabit', handleOpenCreate);
  }, []);

  // Pull-to-refresh for mobile
  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && !isRefreshing) {
        currentY = e.touches[0].clientY;
        const distance = currentY - startY;
        if (distance > 0 && distance < 150) {
          setPullDistance(distance);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80 && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(0);
        
        await queryClient.invalidateQueries(['habits']);
        await queryClient.invalidateQueries(['logs']);
        await queryClient.invalidateQueries(['active-projects']);
        await queryClient.invalidateQueries(['project-tasks-dashboard']);
        
        setTimeout(() => {
          setIsRefreshing(false);
          toast.success('Actualizado');
        }, 500);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, queryClient]);

    const { data: allHabits = [], isLoading } = useQuery({
    queryKey: ['habits', user?.email],
    queryFn: async () => {
      const habits = await db.entities.Habit.filter({ is_active: true, created_by: user?.email }, '-created_date');
      return habits;
    },
    enabled: !!user,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const { data: activeGoals = [] } = useQuery({
    queryKey: ['active-goals-dashboard', user?.email],
    queryFn: () => db.entities.Goal.filter({ status: 'active', created_by: user?.email }),
    enabled: !!user,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const { data: activeProjects = [] } = useQuery({
    queryKey: ['active-projects', user?.email],
    queryFn: () => db.entities.Project.filter({ created_by: user?.email, status: 'active' }),
    enabled: !!user,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const { data: projectTasks = [] } = useQuery({
    queryKey: ['project-tasks-dashboard', activeProjects.map(p => p.id).join(',')],
    queryFn: () => {
      const projectIds = activeProjects.map(p => p.id);
      if (projectIds.length === 0) return Promise.resolve([]);
      
      return db.entities.ProjectTask.filter({ project_id: { $in: projectIds } });
    },
    enabled: !!user && activeProjects.length > 0,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const getProjectTasksForProject = (projectId) => {
    return projectTasks
      .filter(t => t.project_id === projectId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const projectsWithPendingTasks = activeProjects.filter(project => {
    const tasks = getProjectTasksForProject(project.id);
    return tasks.length > 0 && tasks.some(t => t.status === 'pending' || t.status === 'in_progress');
  });

  const quickCompleteTaskMutation = useMutation({
    mutationFn: async ({ task, project }) => {
      const tasks = getProjectTasksForProject(project.id);
      
      if (task.depends_on?.length > 0) {
        const unmetDeps = task.depends_on.some(order => {
          const dep = tasks.find(t => t.order === order);
          return !dep || dep.status !== 'completed';
        });
        if (unmetDeps) throw new Error('Completa las tareas previas primero');
      }

      const shouldDelete = task.type === 'one-time' && !task.is_milestone && !task.is_setup;

      const newCoins = (user?.coins || 0) + (task.reward_coins || 10);
      const newXP = (user?.experience || 0) + (task.reward_xp || 20);
      await db.auth.updateMe({ coins: newCoins, experience: newXP });

      const tasksToUnlock = tasks.filter(t => 
        t.status === 'locked' && 
        t.depends_on?.includes(task.order)
      );
      for (const t of tasksToUnlock) {
        const allDepsMet = t.depends_on.every(order => {
          const dep = tasks.find(x => x.order === order);
          return dep && (dep.status === 'completed' || dep.id === task.id);
        });
        if (allDepsMet) {
          await db.entities.ProjectTask.update(t.id, { status: 'pending' });
        }
      }

      if (shouldDelete) {
        await db.entities.ProjectTask.delete(task.id);
      } else {
        await db.entities.ProjectTask.update(task.id, {
          status: 'completed',
          completed_date: format(new Date(), 'yyyy-MM-dd')
        });
      }

      const remaining = tasks.filter(t => t.id !== task.id);
      const completed = remaining.filter(t => t.status === 'completed').length + (shouldDelete ? 0 : 1);
      const total = shouldDelete ? remaining.length : tasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 100;
      
      await db.entities.Project.update(project.id, {
        progress: Math.min(progress, 100)
      });

      return { coins: task.reward_coins || 10, xp: task.reward_xp || 20, isMilestone: task.is_milestone };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['project-tasks-dashboard']);
      queryClient.invalidateQueries(['active-projects']);
      toast.success(result.isMilestone ? '🏆 ¡Hito completado!' : '✓ Tarea de proyecto completada', {
        description: `+${result.coins} monedas, +${result.xp} XP`
      });
      db.auth.me().then(setUser);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const todayDayOfWeek = getDay(new Date());
  const currentTime = format(new Date(), 'HH:mm');

  const parentHabits = allHabits.filter(h => !h.parent_habit_id);
  const subHabits = allHabits.filter(h => h.parent_habit_id);

  const expandedHabits = parentHabits.flatMap(habit => {
    let showToday = true;
    if (habit.frequency === 'custom') {
      showToday = (habit.weekly_days || []).includes(todayDayOfWeek);
    }
    
    if (!showToday) return [];
    
    const relatedSubHabits = subHabits.filter(sh => sh.parent_habit_id === habit.id);
    
    if (relatedSubHabits.length > 0) {
      return relatedSubHabits.flatMap(subHabit => {
        if (subHabit.scheduled_times && subHabit.scheduled_times.length > 0) {
          return subHabit.scheduled_times.map(time => ({
            ...subHabit,
            _scheduledTime: time,
            _uniqueKey: `${subHabit.id}_${time}`,
            _parentHabit: habit
          }));
        }
        return [{ ...subHabit, _uniqueKey: subHabit.id, _parentHabit: habit }];
      });
    }
    
    if (habit.scheduled_times && habit.scheduled_times.length > 0) {
      return habit.scheduled_times.map(time => ({
        ...habit,
        _scheduledTime: time,
        _uniqueKey: `${habit.id}_${time}`
      }));
    }
    
    return [{ ...habit, _uniqueKey: habit.id }];
  });

  const habits = expandedHabits.sort((a, b) => {
    const timeA = a._scheduledTime || '99:99';
    const timeB = b._scheduledTime || '99:99';
    return timeA.localeCompare(timeB);
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs', today, user?.email],
    queryFn: () => db.entities.HabitLog.filter({ completed_date: today, created_by: user?.email }),
    enabled: !!user,
    staleTime: 60000,
    gcTime: 300000,
    placeholderData: [],
  });

  const isTimeSlotCompleted = (habitId, scheduledTime) => {
    if (!scheduledTime) {
      return logs.some(log => log.habit_id === habitId && !log.scheduled_time);
    }
    return logs.some(log => log.habit_id === habitId && log.scheduled_time === scheduledTime);
  };

  const getCompletedTimes = (habitId) => {
    return logs.filter(log => log.habit_id === habitId).map(log => log.scheduled_time).filter(Boolean);
  };

  const createHabitMutation = useMutation({
    mutationFn: (habitData) => db.entities.Habit.create(habitData),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      setShowCreateDialog(false);
      toast.success('¡Hábito creado!');
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ habitId, data }) => db.entities.Habit.update(habitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['habits']);
      setShowEditDialog(false);
      
      // Add to undo stack
      setUndoStack(prev => [...prev, {
        type: 'update',
        habitId: variables.habitId,
        oldData: editingHabit,
        timestamp: Date.now()
      }]);
      
      setEditingHabit(null);
      toast.success('¡Hábito actualizado!', {
        action: {
          label: 'Deshacer',
          onClick: () => handleUndo()
        }
      });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId) => db.entities.Habit.update(habitId, { is_active: false }),
    onSuccess: (_, habitId) => {
      queryClient.invalidateQueries(['habits']);
      const deletedHabit = allHabits.find(h => h.id === habitId);
      
      // Add to undo stack
      setUndoStack(prev => [...prev, {
        type: 'delete',
        habit: deletedHabit,
        timestamp: Date.now()
      }]);
      
      toast.success('Hábito eliminado', {
        action: {
          label: 'Deshacer',
          onClick: () => handleUndo()
        }
      });
    },
  });

  const handleUndo = async (index = undoStack.length - 1) => {
    if (undoStack.length === 0 || index < 0 || index >= undoStack.length) {
      toast.error('No hay acciones para deshacer');
      return;
    }

    const lastAction = undoStack[index];
    
    try {
      if (lastAction.type === 'delete') {
        // Restore deleted habit
        await db.entities.Habit.update(lastAction.habit.id, { is_active: true });
        toast.success('Hábito restaurado');
      } else if (lastAction.type === 'update') {
        // Revert update
        await db.entities.Habit.update(lastAction.habitId, lastAction.oldData);
        toast.success('Cambios deshechos');
      } else if (lastAction.type === 'complete') {
        // Undo habit completion
        await db.entities.HabitLog.delete(lastAction.logId);
        await db.entities.Habit.update(lastAction.habitId, {
          current_streak: lastAction.oldStreak,
          total_completions: lastAction.oldCompletions
        });
        const xpToRemove = lastAction.xpGained || 10;
        await db.auth.updateMe({ 
          experience: Math.max(0, (user?.experience || 0) - xpToRemove)
        });
        toast.success('Completado deshecho');
      }
      
      queryClient.invalidateQueries(['habits']);
      queryClient.invalidateQueries(['logs']);
      setUndoStack(prev => prev.filter((_, i) => i !== index));
      
      const updatedUser = await db.auth.me();
      setUser(updatedUser);
    } catch (error) {
      toast.error('Error al deshacer acción');
    }
  };

  const checkAndUnlockAchievements = async (totalCompletions, habitCount, maxStreak) => {
    const achievements = await db.entities.Achievement.list();
    const userAchievements = await db.entities.UserAchievement.filter({ user_email: user?.email });
    const unlockedIds = userAchievements.map(ua => ua.achievement_id);

    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.achievement_id)) continue;

      let shouldUnlock = false;
      
      if (achievement.requirement_type === 'total_completions' && totalCompletions >= achievement.requirement_value) {
        shouldUnlock = true;
      } else if (achievement.requirement_type === 'habit_count' && habitCount >= achievement.requirement_value) {
        shouldUnlock = true;
      } else if (achievement.requirement_type === 'streak_days' && maxStreak >= achievement.requirement_value) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        await db.entities.UserAchievement.create({
          user_email: user?.email,
          achievement_id: achievement.achievement_id,
          unlocked_date: new Date().toISOString(),
          progress: achievement.requirement_value
        });

        const newCoins = (user?.coins || 0) + achievement.reward_coins;
        const newXP = (user?.experience || 0) + achievement.reward_xp;
        await db.auth.updateMe({ coins: newCoins, experience: newXP });

        toast.success(`¡Logro desbloqueado! ${achievement.icon}`, {
          description: `${achievement.title} - +${achievement.reward_coins} monedas`,
          duration: 5000,
          action: {
            label: 'Compartir',
            onClick: () => {
              setShareEventType('achievement');
              setShareEventData({
                achievement_title: achievement.title,
                achievement_description: achievement.description,
                achievement_icon: achievement.icon,
                achievement_rarity: achievement.rarity || 'common'
              });
              setShowShareModal(true);
            }
          }
        });

        await db.entities.Notification.create({
          user_email: user?.email,
          type: 'achievement_unlocked',
          title: '¡Logro Desbloqueado!',
          message: `Has desbloqueado: ${achievement.title} - +${achievement.reward_coins} monedas`,
          icon: achievement.icon,
          link: createPageUrl('Achievements')
        });

        await db.entities.FriendActivity.create({
          user_email: user?.email,
          user_name: user?.full_name,
          activity_type: 'achievement_unlocked',
          title: `¡Logro desbloqueado: ${achievement.title}!`,
          description: `${achievement.description} - Rareza: ${achievement.rarity}`,
          icon: achievement.icon,
          metadata: {
            achievement_id: achievement.achievement_id,
            achievement_rarity: achievement.rarity,
            reward_coins: achievement.reward_coins,
            reward_xp: achievement.reward_xp
          }
        });

        const friendships = await db.entities.Friendship.list();
        const myFriendships = friendships.filter(f => 
          f.user1_email === user?.email || f.user2_email === user?.email
        );
        
        for (const friendship of myFriendships) {
          const friendEmail = friendship.user1_email === user?.email ? friendship.user2_email : friendship.user1_email;
          await db.entities.Notification.create({
            user_email: friendEmail,
            type: 'friend_activity',
            title: 'Actividad de amigo',
            message: `${user?.full_name} desbloqueó: ${achievement.title}`,
            icon: achievement.icon,
            link: createPageUrl('Social')
          });
        }
      }
    }
  };

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habit, isCompleted, scheduledTime }) => {
      if (!isCompleted) {
        queryClient.setQueryData(['logs', today, user?.email], (old = []) => [
          ...old,
          {
            habit_id: habit.id,
            completed_date: today,
            scheduled_time: scheduledTime || null,
            created_date: new Date().toISOString()
          }
        ]);
      } else {
        queryClient.setQueryData(['logs', today, user?.email], (old = []) => 
          old.filter(l => !(l.habit_id === habit.id && 
            (scheduledTime ? l.scheduled_time === scheduledTime : !l.scheduled_time)))
        );
      }

      if (isCompleted) {
        const log = logs.find(l => 
          l.habit_id === habit.id && 
          (scheduledTime ? l.scheduled_time === scheduledTime : !l.scheduled_time)
        );
        if (log) await db.entities.HabitLog.delete(log.id);
        
        const newStreak = Math.max(0, habit.current_streak - 1);
        await db.entities.Habit.update(habit.id, {
          current_streak: newStreak,
          total_completions: Math.max(0, habit.total_completions - 1)
        });
        
        const newXP = Math.max(0, (user?.experience || 0) - 10);
        await db.auth.updateMe({ experience: newXP });
        // Unveil: racha rota
        sendUnveilEvent(user, { event_type: 'habit_broken', entity_name: habit.name, value: habit.current_streak });
      } else {
        const createdLog = await db.entities.HabitLog.create({
          habit_id: habit.id,
          completed_date: today,
          scheduled_time: scheduledTime || null
        });
        
        const oldStreak = habit.current_streak || 0;
        const oldCompletions = habit.total_completions || 0;
        const newStreak = oldStreak + 1;
        const newBestStreak = Math.max(habit.best_streak || 0, newStreak);
        await db.entities.Habit.update(habit.id, {
          current_streak: newStreak,
          best_streak: newBestStreak,
          total_completions: oldCompletions + 1,
          last_completed: today
        });
        
        const xpGain = REWARDS.HABIT_XP_BASE + Math.floor(newStreak / 7) * REWARDS.HABIT_XP_STREAK_BONUS;
        const newXP = (user?.experience || 0) + xpGain;
        const newLevel = calculateLevel(newXP);

        // Add to undo stack
        setUndoStack(prev => [...prev, {
          type: 'complete',
          habitId: habit.id,
          logId: createdLog.id,
          oldStreak,
          oldCompletions,
          xpGained: xpGain,
          timestamp: Date.now()
        }]);

        const streakBonus = getStreakBonus(newStreak);
        const coinBonus = streakBonus ? streakBonus.coins : 0;
        const bonusMessage = streakBonus ? streakBonus.message : '';
        
        const newCoins = (user?.coins || 0) + coinBonus;
        
        const bpXPGain = Math.floor(xpGain * REWARDS.BP_XP_MULTIPLIER);
        const newBPXP = (user?.battle_pass_xp || 0) + bpXPGain;
        const newBPTier = Math.floor(newBPXP / REWARDS.BP_XP_PER_TIER);

        await db.auth.updateMe({ 
          experience: newXP,
          level: newLevel,
          coins: newCoins,
          battle_pass_xp: newBPXP,
          battle_pass_tier: Math.max(user?.battle_pass_tier || 0, newBPTier)
        });

        // Unveil: hábito completado
        sendUnveilEvent(user, { event_type: 'habit_completed', entity_name: habit.name, value: newStreak });
        // Unveil: streak milestone (7, 14, 30, 60, 90)
        if ([7, 14, 30, 60, 90].includes(newStreak)) {
          sendUnveilEvent(user, { event_type: 'streak_milestone', entity_name: habit.name, value: newStreak });
        }

        if (bonusMessage) {
          toast.success(bonusMessage, {
            description: `Ahora tienes ${newCoins} monedas`,
            duration: 5000,
            action: {
              label: 'Compartir',
              onClick: () => {
                setShareEventType('streak');
                setShareEventData({ streak: newStreak });
                setShowShareModal(true);
              }
            }
          });
          celebrations.streakMilestone(newStreak);
        } else {
          celebrations.habitComplete();
        }

        if (newLevel > (user?.level || 1)) {
          toast.success(`¡Subiste al nivel ${newLevel}! 🎉`, {
            description: '¡Sigue así, campeón!',
            action: {
              label: 'Compartir',
              onClick: () => {
                setShareEventType('level_up');
                setShareEventData({ level: newLevel });
                setShowShareModal(true);
              }
            }
          });
          celebrations.levelUp(newLevel);
          setShowScratchCard(true);
        } else {
          toast.success(`+${xpGain} XP ganados! 🌟`);
        }

        try {
          const categoryResponse = await db.functions.invoke('analyzeHabitCategory', {
            habit_name: habit.name,
            habit_description: habit.description
          });

          if (categoryResponse.data.category) {
            const category = categoryResponse.data.category;
            const badgeId = category;

            const userBadges = await db.entities.UserBadge.filter({
              user_email: user?.email,
              badge_id: badgeId
            });

            const newProgress = userBadges.length > 0 ? (userBadges[0].current_progress || 0) + 1 : 1;
            
            const badges = await db.entities.Badge.filter({ badge_id: badgeId });
            if (badges.length > 0) {
              const badge = badges[0];
              const levels = badge.levels || [];
              let newLevel = 1;
              
              for (let i = 0; i < levels.length; i++) {
                if (newProgress >= levels[i].requirement_value) {
                  newLevel = levels[i].level;
                }
              }

              if (userBadges.length === 0) {
                await db.entities.UserBadge.create({
                  user_email: user?.email,
                  badge_id: badgeId,
                  current_level: newLevel,
                  current_progress: newProgress,
                  unlocked_date: new Date().toISOString()
                });
                toast.success(`¡Nueva placa desbloqueada! ${badge.icon}`, {
                  description: badge.name,
                  duration: 5000
                });
              } else {
                const oldLevel = userBadges[0].current_level || 1;
                await db.entities.UserBadge.update(userBadges[0].id, {
                  current_progress: newProgress,
                  current_level: newLevel
                });
                
                if (newLevel > oldLevel) {
                  toast.success(`¡Placa mejorada! ${badge.icon}`, {
                    description: `${badge.name} - Nivel ${newLevel}`,
                    duration: 5000,
                    action: {
                      label: 'Compartir',
                      onClick: () => {
                        setShareEventType('badge');
                        setShareEventData({
                          badge_name: badge.name,
                          badge_icon: badge.icon,
                          badge_level: newLevel,
                          progress: newProgress
                        });
                        setShowShareModal(true);
                      }
                    }
                  });
                }
              }
            }
          }
        } catch (e) {
          console.log('Error updating category badge:', e);
        }

        const allHabits = await db.entities.Habit.filter({ created_by: user?.email });
        const totalCompletions = allHabits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
        const maxStreak = Math.max(...allHabits.map(h => h.best_streak || 0), 0);
        await checkAndUnlockAchievements(totalCompletions, allHabits.length, maxStreak);
        
        // Update linked projects progress
        if (habit.linked_project_ids && habit.linked_project_ids.length > 0) {
          for (const projectId of habit.linked_project_ids) {
            try {
              const project = await db.entities.Project.filter({ id: projectId });
              if (project.length > 0) {
                const projectHabits = allHabits.filter(h => h.linked_project_ids?.includes(projectId));
                const logsForProject = await db.entities.HabitLog.filter({ created_by: user?.email });
                const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
                const relevantLogs = logsForProject.filter(log => 
                  projectHabits.some(h => h.id === log.habit_id) && 
                  log.completed_date >= startOfYear
                );
                
                const totalDaysInYear = 365;
                const completedDays = new Set(relevantLogs.map(log => log.completed_date)).size;
                const progress = Math.min(100, Math.round((completedDays / totalDaysInYear) * 100));
                
                await db.entities.Project.update(project[0].id, { progress });
              }
            } catch (e) {
              console.log('Error updating linked project:', e);
            }
          }
        }
        
        try {
          const userAchievements = await db.entities.UserAchievement.filter({ user_email: user?.email });
          const achievementCount = userAchievements.length;
          const lograderBadges = await db.entities.UserBadge.filter({ 
            user_email: user?.email, 
            badge_id: 'logrador' 
          });
          const lograderThresholds = [1, 3, 5, 10, 15, 20, 30, 40, 50, 75];
          let lograderLevel = 0;
          for (let i = 0; i < lograderThresholds.length; i++) {
            if (achievementCount >= lograderThresholds[i]) lograderLevel = i + 1;
          }
          
          if (lograderLevel > 0) {
            if (lograderBadges.length === 0) {
              await db.entities.UserBadge.create({
                user_email: user?.email,
                badge_id: 'logrador',
                current_level: lograderLevel,
                current_progress: achievementCount,
                unlocked_date: new Date().toISOString()
              });
            } else {
              await db.entities.UserBadge.update(lograderBadges[0].id, {
                current_progress: achievementCount,
                current_level: lograderLevel
              });
            }
          }
        } catch (e) {
          console.log('Error updating logrador badge:', e);
        }

        if (newStreak % 10 === 0 && newStreak >= 10) {
          await db.entities.FriendActivity.create({
            user_email: user?.email,
            user_name: user?.full_name,
            activity_type: 'streak_milestone',
            title: `¡Racha épica de ${newStreak} días!`,
            description: `${habit.name} - ${newStreak} días consecutivos sin fallar`,
            icon: '🔥',
            metadata: { 
              habit_name: habit.name, 
              streak_days: newStreak,
              habit_icon: habit.icon,
              habit_color: habit.color
            }
          });
        } else if (newStreak % 3 === 0 && newStreak >= 3) {
          await db.entities.FriendActivity.create({
            user_email: user?.email,
            user_name: user?.full_name,
            activity_type: 'habit_completed',
            title: `Completó un hábito`,
            description: `${habit.name} - ${newStreak} días de racha`,
            icon: habit.icon || '✅',
            metadata: { 
              habit_name: habit.name, 
              streak_days: newStreak,
              habit_icon: habit.icon,
              habit_color: habit.color
            }
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      queryClient.invalidateQueries(['logs']);
      const loadUser = async () => {
        const currentUser = await db.auth.me();
        setUser(currentUser);
      };
      loadUser();
    },
  });

  const completedToday = logs.length;
  const totalHabits = habits.length;
  const uniqueHabitsCount = allHabits.filter(h => {
    if (h.frequency === 'custom') return (h.weekly_days || []).includes(todayDayOfWeek);
    return true;
  }).length;

  const completedHabits = habits.filter(habit => {
    const scheduledTime = habit._scheduledTime;
    return isTimeSlotCompleted(habit.id, scheduledTime);
  });

  const pendingHabits = habits.filter(habit => {
    const scheduledTime = habit._scheduledTime;
    return !isTimeSlotCompleted(habit.id, scheduledTime);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
          >
            <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              {isRefreshing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Actualizando...</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: pullDistance > 80 ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ↓
                  </motion.div>
                  <span className="text-sm font-medium text-gray-700">
                    {pullDistance > 80 ? 'Suelta para actualizar' : 'Arrastra para actualizar'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4 lg:gap-6 mb-4 lg:mb-6">
          <div className="flex items-center gap-4 lg:gap-6">
            <Link to={createPageUrl('Profile')}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer">
                <PixelAvatar user={user} size="large" showLevel={true} showCoins={false} />
              </motion.div>
            </Link>
            <div>
              <p className="text-sm md:text-base text-gray-600">
                {format(new Date(), i18n.language === 'en' ? "EEEE, MMMM d" : "EEEE, d 'de' MMMM", { locale: dateLocale })}
              </p>
              <div className="flex items-center gap-2 md:gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <img src="/assets/neo_pixel_cozy/v1/ui/badges/monedas_32x32.png" alt="" width="22" height="22" style={{ imageRendering: 'pixelated' }} />
                  <span className="font-bold text-amber-600">{user?.coins || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src="/assets/neo_pixel_cozy/v1/ui/badges/xp_32x32.png" alt="" width="22" height="22" style={{ imageRendering: 'pixelated' }} />
                  <span className="font-bold text-violet-600">{user?.experience || 0} xp</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-end gap-2 lg:gap-3 w-full lg:w-auto items-center">
            {undoStack.length > 0 && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowHistory(true)}
                  className="w-full sm:w-auto border-2 border-purple-300 hover:bg-purple-50"
                >
                  <History className="w-5 h-5 mr-2" />
                  Historial ({undoStack.length})
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleUndo()}
                  className="w-full sm:w-auto border-2 border-amber-300 hover:bg-amber-50 text-amber-700"
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    ↶
                  </motion.div>
                  <span className="ml-2">Deshacer</span>
                </Button>
              </>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="w-full sm:w-auto border-2 border-purple-300 hover:bg-purple-50"
            >
              <Settings className="w-5 h-5 mr-2" />
              {t('dashboard.customize', 'Personalizar')}
            </Button>
            <Link to={createPageUrl('Statistics')} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-purple-300 hover:bg-purple-50"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                {t('nav.statistics')}
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={() => setShowCreateDialog(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('dashboard.newHabit')}
            </Button>
          </div>
        </div>

        {/* Goal context header */}
        <GoalContextHeader
          goals={activeGoals}
          habits={allHabits}
          userName={user?.full_name}
        />

        {showQuickStart && userPrefs && userPrefs.show_quick_start_guide !== false && (
          <QuickStartGuide
            user={user}
            habits={parentHabits}
            projects={activeProjects}
            friendCount={0}
            onDismiss={async () => {
              setShowQuickStart(false);
              if (userPrefs) {
                await db.entities.UserPreferences.update(userPrefs.id, { 
                  quick_start_dismissed: true 
                });
              }
            }}
          />
        )}

        {showFeatureDiscovery && userPrefs && (user?.level || 1) >= 2 && (
          <FeatureDiscovery
            onDismiss={async () => {
              setShowFeatureDiscovery(false);
              if (userPrefs) {
                await db.entities.UserPreferences.update(userPrefs.id, { 
                  feature_discovery_dismissed: true 
                });
              }
            }}
          />
        )}

        {userPrefs?.show_daily_quote && showDailyQuote && (
          <DailyQuote 
            user={user} 
            userPrefs={userPrefs}
            onClose={() => setShowDailyQuote(false)}
          />
        )}

        {user && pendingHabits.length > 0 && completedToday === 0 && userPrefs?.show_proactive_coach !== false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-6 text-white shadow-lg mb-8"
          >
            <div className="flex items-center gap-4 mb-3">
              <Brain className="w-8 h-8 text-white" />
              <h2 className="text-xl font-bold">Tu Coach IA está aquí</h2>
            </div>
            <p className="text-violet-100 mb-4">
              Tienes {pendingHabits.length} hábito{pendingHabits.length > 1 ? 's' : ''} pendiente{pendingHabits.length > 1 ? 's' : ''} hoy. 
              {pendingHabits.length > 3 
                ? ' Empieza con solo uno - ¡el más fácil!' 
                : ' ¡Tómate 5 minutos y completa el primero!'}
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.location.href = createPageUrl('Coach')}
                className="bg-white text-violet-600 hover:bg-violet-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Hablar con mi Coach
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <LevelProgress user={user} />
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3 md:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.today')}</p>
                  <p className="text-2xl font-bold text-gray-800">{completedToday}/{totalHabits}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.bestStreak')}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.max(...habits.map(h => h.best_streak || 0), 0)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {projectsWithPendingTasks.length > 0 && userPrefs?.show_project_tasks_on_dashboard !== false && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-violet-600" />
                {t('dashboard.projectTasks')}
              </h2>
              <Link to={createPageUrl('Projects')}>
                <Button variant="ghost" size="sm" className="text-violet-600">
                  {t('common.viewAll', 'Ver todos')} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {projectsWithPendingTasks.slice(0, 2).map(project => {
                const tasks = getProjectTasksForProject(project.id);
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 border-2 border-violet-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{project.icon || '🎯'}</span>
                        <span className="font-medium text-gray-800">{project.name}</span>
                      </div>
                      <Link to={createPageUrl('Projects')}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-violet-600">
                          Detalles <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <ProjectTaskList
                      tasks={tasks}
                      onCompleteTask={(task) => quickCompleteTaskMutation.mutate({ task, project })}
                      compact={true}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Refresh button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              queryClient.invalidateQueries(['habits']);
              queryClient.invalidateQueries(['logs']);
              queryClient.invalidateQueries(['active-projects']);
              queryClient.invalidateQueries(['project-tasks-dashboard']);
              toast.success('Actualizado');
            }}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
        </div>

        <div className="space-y-6 habits-section">
          {completedHabits.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <button
                onClick={() => setShowCompletedSection(!showCompletedSection)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  {t('dashboard.completedToday')} ({completedHabits.length})
                </h2>
                <motion.div
                  animate={{ rotate: showCompletedSection ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </motion.div>
              </button>

              {showCompletedSection && (
                <div className="grid gap-3">
                  {(() => {
                    if (userPrefs?.group_similar_habits !== false) {
                      const grouped = {};
                      const ungrouped = [];

                      completedHabits.forEach(habit => {
                        if (habit._parentHabit) {
                          const groupKey = habit._parentHabit.id;
                          if (!grouped[groupKey]) grouped[groupKey] = { name: habit._parentHabit.name, habits: [] };
                          grouped[groupKey].habits.push(habit);
                        } else if (habit.group_key) {
                          if (!grouped[habit.group_key]) grouped[habit.group_key] = { name: habit.group_key, habits: [] };
                          grouped[habit.group_key].habits.push(habit);
                        } else {
                          const baseName = habit.name
                            .replace(/\s*\(.*?\)\s*/g, '')
                            .replace(/\s*-\s*(mañana|tarde|noche|mediodía)/gi, '')
                            .trim();

                          if (habit.scheduled_times && habit.scheduled_times.length > 1) {
                            if (!grouped[baseName]) grouped[baseName] = { name: baseName, habits: [] };
                            grouped[baseName].habits.push(habit);
                          } else {
                            ungrouped.push(habit);
                          }
                        }
                      });

                      return (
                        <>
                          {Object.entries(grouped).map(([groupKey, group]) => (
                            <HabitGroup
                              key={groupKey}
                              groupName={group.name}
                              habits={group.habits}
                              logs={logs}
                              onToggle={(params) => toggleHabitMutation.mutate(params)}
                              onEdit={(habit) => {
                                setEditingHabit(habit);
                                setShowEditDialog(true);
                              }}
                              disabled={toggleHabitMutation.isPending}
                            />
                          ))}
                          {ungrouped.map((habit) => {
                            const scheduledTime = habit._scheduledTime;
                            const isCompleted = isTimeSlotCompleted(habit.id, scheduledTime);
                            const completedTimes = getCompletedTimes(habit.id);

                            return (
                              <HabitCard
                                key={habit._uniqueKey}
                                habit={habit}
                                isCompleted={isCompleted}
                                scheduledTime={scheduledTime}
                                completedTimes={completedTimes}
                                onToggle={() => toggleHabitMutation.mutate({
                                  habit,
                                  isCompleted,
                                  scheduledTime
                                })}
                                onEdit={() => {
                                  setEditingHabit(habit);
                                  setShowEditDialog(true);
                                }}
                                disabled={toggleHabitMutation.isPending}
                              />
                            );
                          })}
                        </>
                      );
                    } else {
                      return completedHabits.map((habit) => {
                        const scheduledTime = habit._scheduledTime;
                        const isCompleted = isTimeSlotCompleted(habit.id, scheduledTime);
                        const completedTimes = getCompletedTimes(habit.id);

                        return (
                          <HabitCard
                            key={habit._uniqueKey}
                            habit={habit}
                            isCompleted={isCompleted}
                            scheduledTime={scheduledTime}
                            completedTimes={completedTimes}
                            onToggle={() => toggleHabitMutation.mutate({
                              habit,
                              isCompleted,
                              scheduledTime
                            })}
                            onEdit={() => {
                              setEditingHabit(habit);
                              setShowEditDialog(true);
                            }}
                            disabled={toggleHabitMutation.isPending}
                          />
                        );
                      });
                    }
                  })()}
                </div>
              )}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
              {t('dashboard.pendingHabits')} ({pendingHabits.length})
            </h2>

          {/* Group habits by goal when goals exist */}
          {!isLoading && pendingHabits.length > 0 && activeGoals.length > 0 && (() => {
            const habitsByGoal = {};
            const unlinkedHabits = [];

            pendingHabits.forEach(habit => {
              const goalId = habit.linked_goal_ids?.[0];
              const goal = goalId ? activeGoals.find(g => g.id === goalId) : null;
              if (goal) {
                if (!habitsByGoal[goal.id]) habitsByGoal[goal.id] = { goal, habits: [] };
                habitsByGoal[goal.id].habits.push(habit);
              } else {
                unlinkedHabits.push(habit);
              }
            });

            const hasGrouping = Object.keys(habitsByGoal).length > 0;
            if (!hasGrouping) return null; // Fall through to default rendering below

            return (
              <div className="grid gap-6">
                {Object.values(habitsByGoal).map(({ goal, habits: goalHabits }) => (
                  <div key={goal.id}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-lg">{goal.icon || '🎯'}</span>
                      <h3 className="text-base font-bold text-violet-700">{goal.title}</h3>
                      <div className="flex-1 h-px bg-violet-200 ml-2" />
                    </div>
                    <div className="grid gap-3">
                      {goalHabits.map(habit => {
                        const scheduledTime = habit._scheduledTime;
                        const isCompleted = isTimeSlotCompleted(habit.id, scheduledTime);
                        const completedTimes = getCompletedTimes(habit.id);
                        return (
                          <HabitCard
                            key={habit._uniqueKey}
                            habit={habit}
                            isCompleted={isCompleted}
                            scheduledTime={scheduledTime}
                            completedTimes={completedTimes}
                            onToggle={() => toggleHabitMutation.mutate({ habit, isCompleted, scheduledTime })}
                            onEdit={() => { setEditingHabit(habit); setShowEditDialog(true); }}
                            disabled={toggleHabitMutation.isPending}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                {unlinkedHabits.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-base font-bold text-gray-500">Hábitos generales</span>
                      <div className="flex-1 h-px bg-gray-200 ml-2" />
                    </div>
                    <div className="grid gap-3">
                      {unlinkedHabits.map(habit => {
                        const scheduledTime = habit._scheduledTime;
                        const isCompleted = isTimeSlotCompleted(habit.id, scheduledTime);
                        const completedTimes = getCompletedTimes(habit.id);
                        return (
                          <HabitCard
                            key={habit._uniqueKey}
                            habit={habit}
                            isCompleted={isCompleted}
                            scheduledTime={scheduledTime}
                            completedTimes={completedTimes}
                            onToggle={() => toggleHabitMutation.mutate({ habit, isCompleted, scheduledTime })}
                            onEdit={() => { setEditingHabit(habit); setShowEditDialog(true); }}
                            disabled={toggleHabitMutation.isPending}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {isLoading ? (
            <LoadingSpinner size="medium" message={t('common.loading')} />
          ) : pendingHabits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">{t('dashboard.createFirstHabit')}</p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('habits.create')}
              </Button>
            </div>
          ) : (activeGoals.length > 0 && pendingHabits.some(h => h.linked_goal_ids?.length > 0)) ? null : (
            <div className="grid gap-4">
              {(() => {
                if (userPrefs?.group_similar_habits !== false) {
                  const grouped = {};
                  const ungrouped = [];

                  pendingHabits.forEach(habit => {
                    if (habit._parentHabit) {
                      const groupKey = habit._parentHabit.id;
                      if (!grouped[groupKey]) grouped[groupKey] = { name: habit._parentHabit.name, habits: [] };
                      grouped[groupKey].habits.push(habit);
                    } else if (habit.group_key) {
                      if (!grouped[habit.group_key]) grouped[habit.group_key] = { name: habit.group_key, habits: [] };
                      grouped[habit.group_key].habits.push(habit);
                    } else {
                      const baseName = habit.name
                        .replace(/\s*\(.*?\)\s*/g, '')
                        .replace(/\s*-\s*(mañana|tarde|noche|mediodía)/gi, '')
                        .trim();

                      if (habit.scheduled_times && habit.scheduled_times.length > 1) {
                        if (!grouped[baseName]) grouped[baseName] = { name: baseName, habits: [] };
                        grouped[baseName].habits.push(habit);
                      } else {
                        ungrouped.push(habit);
                      }
                    }
                  });

                  return (
                    <>
                      {Object.entries(grouped).map(([groupKey, group]) => (
                        <HabitGroup
                          key={groupKey}
                          groupName={group.name}
                          habits={group.habits}
                          logs={logs}
                          onToggle={(params) => toggleHabitMutation.mutate(params)}
                          onEdit={(habit) => {
                            setEditingHabit(habit);
                            setShowEditDialog(true);
                          }}
                          disabled={toggleHabitMutation.isPending}
                        />
                      ))}
                      {ungrouped.map((habit) => {
                        const scheduledTime = habit._scheduledTime;
                        const isCompleted = isTimeSlotCompleted(habit.id, scheduledTime);
                        const completedTimes = getCompletedTimes(habit.id);
                        
                        return (
                          <HabitCard
                            key={habit._uniqueKey}
                            habit={habit}
                            isCompleted={isCompleted}
                            scheduledTime={scheduledTime}
                            completedTimes={completedTimes}
                            onToggle={() => toggleHabitMutation.mutate({
                              habit,
                              isCompleted,
                              scheduledTime
                            })}
                            onEdit={() => {
                              setEditingHabit(habit);
                              setShowEditDialog(true);
                            }}
                            disabled={toggleHabitMutation.isPending}
                            />
                        );
                      })}
                    </>
                  );
                  } else {
                  return pendingHabits.map((habit) => {
                    const scheduledTime = habit._scheduledTime;
                    const isCompleted = isTimeSlotCompleted(habit.id, scheduledTime);
                    const completedTimes = getCompletedTimes(habit.id);
                    
                    return (
                      <HabitCard
                        key={habit._uniqueKey}
                        habit={habit}
                        isCompleted={isCompleted}
                        scheduledTime={scheduledTime}
                        completedTimes={completedTimes}
                        onToggle={() => toggleHabitMutation.mutate({
                          habit,
                          isCompleted,
                          scheduledTime
                        })}
                        onEdit={() => {
                          setEditingHabit(habit);
                          setShowEditDialog(true);
                        }}
                        disabled={toggleHabitMutation.isPending}
                        />
                        );
                        });
                        }
                        })()}
                        </div>
                        )}
                        </div>
                        </div>
      </div>

      <CreateHabitDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => createHabitMutation.mutate(data)}
      />

      {editingHabit && (
        <EditHabitDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          habit={editingHabit}
          onUpdate={(data) => updateHabitMutation.mutate({ habitId: editingHabit.id, data })}
          onDelete={() => deleteHabitMutation.mutate(editingHabit.id)}
        />
      )}

      <ScratchCard
        open={showScratchCard}
        onClose={() => setShowScratchCard(false)}
        onRewardClaimed={async (reward) => {
          if (reward.type === 'coins') {
            await db.auth.updateMe({ coins: (user?.coins || 0) + reward.amount });
          } else if (reward.type === 'xp') {
            await db.auth.updateMe({ experience: (user?.experience || 0) + reward.amount });
          }
          const updatedUser = await db.auth.me();
          setUser(updatedUser);
        }}
        onBoxOpened={async () => {
          const newCount = (user?.lootboxes_opened || 0) + 1;
          await db.auth.updateMe({ lootboxes_opened: newCount });
          
          try {
            await db.functions.invoke('updateBadgeProgress', {
              badge_id: 'caja_sorpresa',
              progress_value: newCount
            });
          } catch (e) {
            console.log('Error updating caja sorpresa badge:', e);
          }
          
          const updatedUser = await db.auth.me();
          setUser(updatedUser);
        }}
      />

      <GuidedTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={async () => {
          setShowTour(false);
          if (userPrefs) {
            await db.entities.UserPreferences.update(userPrefs.id, { has_completed_tour: true });
          }
        }}
      />

      <DashboardSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        userPrefs={userPrefs}
      />

      <ShareImageModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        eventType={shareEventType}
        eventData={shareEventData}
        user={user}
      />

      <PWAInstallPrompt userPrefs={userPrefs} />

      <ActionHistory
        open={showHistory}
        onOpenChange={setShowHistory}
        actions={undoStack}
        onUndo={(index) => {
          handleUndo(index);
          if (undoStack.length <= 1) {
            setShowHistory(false);
          }
        }}
      />
    </div>
  );
}