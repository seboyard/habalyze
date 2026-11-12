import { db } from '@/api/base44Client';
import React, { useState, useEffect, useMemo } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import '../components/i18n/config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FolderKanban, Plus, Sparkles, Target, Calendar, ChevronLeft, 
  CheckCircle2, Circle, Star, Lightbulb, Trophy, ArrowLeft, Coins,
  Lock, ArrowRight, Settings, Repeat, CalendarDays, LayoutGrid,
  GanttChart, List, Brain, BarChart3, Maximize2, Minimize2, History,
  Users, UserPlus, Crown, ToggleLeft, ToggleRight, X, Trash2, Archive
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import CreateProjectDialog from '../components/projects/CreateProjectDialog';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectTaskList from '../components/projects/ProjectTaskList';
import ProjectKanban from '../components/projects/ProjectKanban';
import ProjectGantt from '../components/projects/ProjectGantt';
import ProjectTimeline from '../components/projects/ProjectTimeline';
import ProjectAIAssistant from '../components/projects/ProjectAIAssistant';
import ProjectTaskHistory from '../components/projects/ProjectTaskHistory';
import ProjectCollaborators from '../components/projects/ProjectCollaborators';
import ProjectChat from '../components/projects/ProjectChat';
import WeeklyProgressBar from '../components/projects/WeeklyProgressBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const colorClasses = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  red: 'from-red-500 to-red-600',
  teal: 'from-teal-500 to-teal-600',
  yellow: 'from-yellow-500 to-yellow-600',
};

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : es;
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch own projects and collaborations in parallel
  const { data: ownProjects = [], isLoading: ownLoading } = useQuery({
    queryKey: ['own-projects', user?.email],
    queryFn: () => db.entities.Project.filter({ created_by: user?.email }),
    enabled: !!user,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['project-collaborations', user?.email],
    queryFn: () => db.entities.ProjectCollaborator.filter({ user_email: user?.email, status: 'accepted' }),
    enabled: !!user,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  // Combine project IDs from owned projects and collaborations
  const allProjectIds = useMemo(() => {
    const ownedIds = ownProjects.map(p => p.id);
    const collabIds = collaborations.map(c => c.project_id);
    return Array.from(new Set([...ownedIds, ...collabIds]));
  }, [ownProjects, collaborations]);

  // Fetch all projects (owned and collaborated) in a single query
  const { data: allProjectsData = [], isLoading: allProjectsLoading } = useQuery({
    queryKey: ['all-projects', allProjectIds],
    queryFn: () => allProjectIds.length > 0 
      ? db.entities.Project.filter({ id: { $in: allProjectIds } })
      : Promise.resolve([]),
    enabled: allProjectIds.length > 0,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const projects = allProjectsData;
  const projectsLoading = ownLoading || allProjectsLoading;

  // Fetch all tasks and collaborators in single queries using $in operator
  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['project-tasks', allProjectIds.join(',')],
    queryFn: () => allProjectIds.length > 0
      ? db.entities.ProjectTask.filter({ project_id: { $in: allProjectIds } })
      : Promise.resolve([]),
    enabled: allProjectIds.length > 0,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  const { data: allCollaborators = [] } = useQuery({
    queryKey: ['all-collaborators', allProjectIds.join(',')],
    queryFn: () => allProjectIds.length > 0
      ? db.entities.ProjectCollaborator.filter({ project_id: { $in: allProjectIds } })
      : Promise.resolve([]),
    enabled: allProjectIds.length > 0,
    staleTime: 300000,
    gcTime: 600000,
    placeholderData: [],
  });

  // Fetch week statuses for selected project
  const { data: weekStatuses = [] } = useQuery({
    queryKey: ['week-statuses', selectedProject?.id],
    queryFn: () => db.entities.ProjectWeekStatus.filter({ project_id: selectedProject.id }),
    enabled: !!selectedProject && selectedProject.weekly_tracking_enabled,
    staleTime: 60000,
    placeholderData: [],
  });

  // Get current week status
  const currentWeekStatus = weekStatuses.find(
    w => w.week_number === (selectedWeekNumber || selectedProject?.current_week_number)
  );

  // Update selected week when project changes
  useEffect(() => {
    if (selectedProject && selectedProject.weekly_tracking_enabled) {
      setSelectedWeekNumber(selectedProject.current_week_number || 1);
    } else {
      setSelectedWeekNumber(null);
    }
  }, [selectedProject?.id]);

  const getProjectCollaborators = (projectId) => {
    return allCollaborators.filter(c => c.project_id === projectId);
  };

  const getProjectTasks = (projectId, weekNumber = null) => {
    let tasks = allTasks.filter(t => t.project_id === projectId);
    
    // Filtrar por semana si está habilitado el seguimiento semanal
    if (weekNumber !== null) {
      tasks = tasks.filter(t => t.assigned_week_number === weekNumber);
    }
    
    return tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Check if a task can be completed (dependencies met)
  const canCompleteTask = (task, projectTasks) => {
    if (task.status === 'locked') return false;
    // Permitir si depends_on no existe, está vacío, o es null/undefined
    if (!task.depends_on || !Array.isArray(task.depends_on) || task.depends_on.length === 0) return true;
    
    return task.depends_on.every(depOrder => {
      const depTask = projectTasks.find(t => t.order === depOrder);
      // Si la tarea dependiente no existe, no bloqueamos (corrige dependencias rotas)
      if (!depTask) return true;
      return depTask.status === 'completed';
    });
  };

  // Unlock dependent tasks after completion
  const unlockDependentTasks = async (completedTask, projectTasks) => {
    const tasksToUnlock = projectTasks.filter(t => 
      t.status === 'locked' && 
      t.depends_on && 
      t.depends_on.includes(completedTask.order)
    );

    for (const task of tasksToUnlock) {
      // Check if ALL dependencies are now met
      const allDepsMet = task.depends_on.every(depOrder => {
        const depTask = projectTasks.find(t => t.order === depOrder);
        return depTask && (depTask.status === 'completed' || depTask.id === completedTask.id);
      });

      if (allDepsMet) {
        await db.entities.ProjectTask.update(task.id, { status: 'pending' });
      }
    }
  };

  // Toggle advanced mode mutation
  const toggleAdvancedModeMutation = useMutation({
    mutationFn: async (project) => {
      await db.entities.Project.update(project.id, {
        advanced_mode: !project.advanced_mode
      });
      return !project.advanced_mode;
    },
    onSuccess: (newMode) => {
      queryClient.invalidateQueries(['own-projects']);
      queryClient.invalidateQueries(['all-projects']);
      toast.success(newMode ? 'Modo avanzado activado' : 'Modo avanzado desactivado');
      // Also update selected project locally
      if (selectedProject) {
        setSelectedProject({ ...selectedProject, advanced_mode: newMode });
      }
    }
  });

  // Assign task mutation
  const assignTaskMutation = useMutation({
    mutationFn: async ({ task, assigneeEmail }) => {
      // Verificar que la tarea existe primero
      try {
        const taskExists = await db.entities.ProjectTask.filter({ id: task.id });
        if (!taskExists || taskExists.length === 0) {
          throw new Error('Esta tarea no existe o fue eliminada. Refresca la página para ver las tareas actuales.');
        }
      } catch (error) {
        throw new Error('Esta tarea no existe o fue eliminada. Refresca la página para ver las tareas actuales.');
      }

      const assignee = assigneeEmail 
        ? [...allCollaborators, { user_email: user?.email, user_name: user?.full_name }].find(c => c.user_email === assigneeEmail)
        : null;

      await db.entities.ProjectTask.update(task.id, {
        assigned_to: assigneeEmail || null,
        assigned_to_name: assignee?.user_name || null
      });

      // Send notification if assigning to someone else
      if (assigneeEmail && assigneeEmail !== user?.email) {
        await db.entities.Notification.create({
          user_email: assigneeEmail,
          type: 'task_assigned',
          title: 'Nueva tarea asignada',
          message: `Te han asignado la tarea "${task.title}"`,
          icon: '📋',
          link: createPageUrl('Projects')
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project-tasks']);
      toast.success('Tarea asignada');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Error al asignar tarea';
      toast.error(errorMessage, {
        description: errorMessage.includes('eliminada') ? 'Refrescando lista de tareas...' : undefined
      });
      
      // Auto-refrescar si la tarea no existe
      if (errorMessage.includes('eliminada') || errorMessage.includes('no existe')) {
        setTimeout(() => {
          queryClient.invalidateQueries(['project-tasks']);
          queryClient.invalidateQueries(['own-projects']);
          queryClient.invalidateQueries(['all-projects']);
        }, 2000);
      }
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ task, project }) => {
      // Verificar que la tarea existe primero
      try {
        const taskExists = await db.entities.ProjectTask.filter({ id: task.id });
        if (!taskExists || taskExists.length === 0) {
          throw new Error('Esta tarea no existe o fue eliminada. Refresca la página para ver las tareas actuales.');
        }
      } catch (error) {
        throw new Error('Esta tarea no existe o fue eliminada. Refresca la página para ver las tareas actuales.');
      }

      const projectTasks = getProjectTasks(project.id, null);
      
      // Check dependencies
      if (!canCompleteTask(task, projectTasks)) {
        throw new Error('Completa las tareas previas primero');
      }

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      // Determine if task should be deleted after completion
      const shouldDeleteAfterComplete = 
        task.type === 'one-time' && 
        !task.is_milestone && 
        !task.is_setup &&
        newStatus === 'completed';

      if (newStatus === 'completed' && task.status !== 'completed') {
        // Unlock dependent tasks BEFORE potentially deleting
        await unlockDependentTasks(task, projectTasks);

        // Give rewards
        const taskCoins = task.reward_coins || 10;
        const taskXP = task.reward_xp || 20;
        const newCoins = (user?.coins || 0) + taskCoins;
        const newXP = (user?.experience || 0) + taskXP;
        await db.auth.updateMe({ coins: newCoins, experience: newXP });

        // Delete or mark as completed
        if (shouldDeleteAfterComplete) {
          await db.entities.ProjectTask.delete(task.id);
        } else {
          await db.entities.ProjectTask.update(task.id, {
            status: 'completed',
            completed_date: format(new Date(), 'yyyy-MM-dd')
          });
        }

        // Recalculate progress
        const remainingTasks = projectTasks.filter(t => t.id !== task.id);
        const completedTasks = remainingTasks.filter(t => t.status === 'completed');
        const totalRemaining = shouldDeleteAfterComplete ? remainingTasks.length : projectTasks.length;
        const completedCount = completedTasks.length + (shouldDeleteAfterComplete ? 0 : 1);
        
        const progress = totalRemaining > 0 
          ? Math.round((completedCount / totalRemaining) * 100) 
          : 100;
        
        // Check if project is complete (all remaining tasks done)
        const pendingTasks = remainingTasks.filter(t => 
          t.status !== 'completed' && t.status !== 'skipped'
        );
        const isProjectComplete = pendingTasks.length === 0 || progress >= 100;
        
        await db.entities.Project.update(project.id, { 
          progress: Math.min(progress, 100),
          status: isProjectComplete ? 'completed' : 'active'
        });

        // Create milestone activity for friends
        if (task.is_milestone) {
          await db.entities.FriendActivity.create({
            user_email: user.email,
            user_name: user.full_name,
            activity_type: 'milestone_completed',
            title: 'Completó un hito',
            description: `${task.title} en "${project.name}"`,
            icon: '🏆'
          });
        }

        // Create project completion activity
        if (isProjectComplete) {
          await db.entities.FriendActivity.create({
            user_email: user.email,
            user_name: user.full_name,
            activity_type: 'project_completed',
            title: '¡Completó un proyecto!',
            description: project.name,
            icon: '🎉'
          });
        }

        // Notify project owner if task completed by collaborator
        if (project.created_by !== user?.email) {
          await db.entities.Notification.create({
            user_email: project.created_by,
            type: 'task_completed',
            title: 'Tarea completada',
            message: `${user?.full_name} completó la tarea "${task.title}" en "${project.name}"`,
            icon: '✅',
            link: createPageUrl('Projects')
          });
        }

        return { 
          rewarded: true, 
          coins: task.reward_coins || 10, 
          xp: task.reward_xp || 20, 
          isMilestone: task.is_milestone,
          isSetup: task.is_setup,
          projectComplete: isProjectComplete,
          wasDeleted: shouldDeleteAfterComplete
        };
      } else {
        // Uncompleting a task
        await db.entities.ProjectTask.update(task.id, {
          status: 'pending',
          completed_date: null
        });
      }
      return { rewarded: false };
    },
    onSuccess: async (result, variables) => {
      queryClient.invalidateQueries(['project-tasks']);
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['week-statuses']);
      
      // Actualizar progreso semanal si está habilitado
      if (variables.project.weekly_tracking_enabled) {
        try {
          await db.functions.invoke('updateWeeklyProgress', { 
            project_id: variables.project.id 
          });
        } catch (e) {
          console.log('Error updating weekly progress:', e);
        }
      }
      
      if (result.rewarded) {
        if (result.projectComplete) {
          toast.success('🎉 ¡PROYECTO COMPLETADO!', {
            description: `+${result.coins} monedas, +${result.xp} XP`
          });
        } else if (result.isMilestone) {
          toast.success('🏆 ¡Hito completado!', {
            description: `+${result.coins} monedas, +${result.xp} XP`
          });
        } else if (result.isSetup) {
          toast.success('⚙️ ¡Configuración completada!', {
            description: `+${result.coins} monedas - Ya no necesitarás hacer esto de nuevo`
          });
        } else if (result.wasDeleted) {
          toast.success('✓ ¡Tarea completada y eliminada!', {
            description: `+${result.coins} monedas, +${result.xp} XP - Siguiente tarea desbloqueada`
          });
        } else {
          toast.success('✓ Tarea completada', {
            description: `+${result.coins} monedas, +${result.xp} XP`
          });
        }
        db.auth.me().then(setUser);
      }
    },
    onError: (error) => {
      const errorMessage = error.message || 'Error al completar tarea';
      toast.error(errorMessage, {
        description: errorMessage.includes('eliminada') ? 'Refrescando lista de tareas...' : undefined,
        action: errorMessage.includes('eliminada') ? {
          label: 'Refrescar',
          onClick: () => {
            queryClient.invalidateQueries(['project-tasks']);
            queryClient.invalidateQueries(['own-projects']);
            queryClient.invalidateQueries(['all-projects']);
          }
        } : undefined
      });
      
      // Auto-refrescar si la tarea no existe
      if (errorMessage.includes('eliminada') || errorMessage.includes('no existe')) {
        setTimeout(() => {
          queryClient.invalidateQueries(['project-tasks']);
          queryClient.invalidateQueries(['own-projects']);
          queryClient.invalidateQueries(['all-projects']);
        }, 2000);
      }
    }
  });

  // Skip task mutation
  const skipTaskMutation = useMutation({
    mutationFn: async ({ task, project }) => {
      // Verificar que la tarea existe primero
      try {
        const taskExists = await db.entities.ProjectTask.filter({ id: task.id });
        if (!taskExists || taskExists.length === 0) {
          throw new Error('Esta tarea no existe o fue eliminada. Refresca la página para ver las tareas actuales.');
        }
      } catch (error) {
        throw new Error('Esta tarea no existe o fue eliminada. Refresca la página para ver las tareas actuales.');
      }

      const projectTasks = getProjectTasks(project.id);
      
      // Mark as skipped
      await db.entities.ProjectTask.update(task.id, {
        status: 'skipped',
        completed_date: format(new Date(), 'yyyy-MM-dd')
      });

      // Unlock dependent tasks
      await unlockDependentTasks(task, projectTasks);

      // Recalculate progress
      const completedOrSkipped = projectTasks.filter(t => 
        t.status === 'completed' || t.status === 'skipped' || t.id === task.id
      ).length;
      const progress = Math.round((completedOrSkipped / projectTasks.length) * 100);
      
      await db.entities.Project.update(project.id, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project-tasks']);
      queryClient.invalidateQueries(['projects']);
      toast.info('Tarea saltada', {
        description: 'Siguiente tarea desbloqueada'
      });
    },
    onError: (error) => {
      const errorMessage = error.message || 'Error al saltar tarea';
      toast.error(errorMessage, {
        description: errorMessage.includes('eliminada') ? 'Refrescando lista de tareas...' : undefined
      });
      
      // Auto-refrescar si la tarea no existe
      if (errorMessage.includes('eliminada') || errorMessage.includes('no existe')) {
        setTimeout(() => {
          queryClient.invalidateQueries(['project-tasks']);
          queryClient.invalidateQueries(['own-projects']);
          queryClient.invalidateQueries(['all-projects']);
        }, 2000);
      }
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await db.entities.ProjectTask.delete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project-tasks']);
      toast.success('Tarea eliminada');
    }
  });

  const archiveProjectMutation = useMutation({
    mutationFn: async (projectId) => {
      await db.entities.Project.update(projectId, { status: 'archived' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['own-projects']);
      queryClient.invalidateQueries(['all-projects']);
      setSelectedProject(null);
      toast.success('Proyecto archivado');
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId) => {
      const tasks = await db.entities.ProjectTask.filter({ project_id: projectId });
      for (const task of tasks) {
        await db.entities.ProjectTask.delete(task.id);
      }
      await db.entities.Project.delete(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['own-projects']);
      queryClient.invalidateQueries(['all-projects']);
      setSelectedProject(null);
      toast.success('Proyecto eliminado');
    }
  });

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4 hover:bg-purple-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mis Caminos
                </h1>
                <p className="text-gray-600">Rutas a largo plazo con tareas generadas por IA</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  queryClient.invalidateQueries(['own-projects']);
                  queryClient.invalidateQueries(['all-projects']);
                  queryClient.invalidateQueries(['project-tasks']);
                  queryClient.invalidateQueries(['all-collaborators']);
                  toast.success(t('common.updated', 'Actualizado'));
                }}
                variant="outline"
                className="gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('common.refresh', 'Actualizar')}
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Camino
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projectsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-gray-300">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No tienes caminos todavía</h3>
            <p className="text-gray-500 mb-6">
              Crea tu primer camino y la IA generará tareas progresivas para ayudarte a alcanzar tu objetivo.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Crear Camino con IA
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {activeProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Caminos Activos ({activeProjects.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProjects.map(project => {
                    const tasks = getProjectTasks(project.id);
                    const completed = tasks.filter(t => t.status === 'completed').length;
                    const collabs = getProjectCollaborators(project.id).filter(c => c.status === 'accepted');
                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        tasksCompleted={completed}
                        totalTasks={tasks.length}
                        collaboratorCount={collabs.length}
                        isCollaborator={project.created_by !== user?.email}
                        onClick={() => setSelectedProject(project)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {completedProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  {t('projects.completedProjects')} ({completedProjects.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedProjects.map(project => {
                    const tasks = getProjectTasks(project.id);
                    const collabs = getProjectCollaborators(project.id).filter(c => c.status === 'accepted');
                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        tasksCompleted={tasks.length}
                        totalTasks={tasks.length}
                        collaboratorCount={collabs.length}
                        isCollaborator={project.created_by !== user?.email}
                        onClick={() => setSelectedProject(project)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {archivedProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Archive className="w-5 h-5 text-gray-600" />
                  {t('projects.archivedProjects', 'Proyectos Archivados')} ({archivedProjects.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {archivedProjects.map(project => {
                    const tasks = getProjectTasks(project.id);
                    const collabs = getProjectCollaborators(project.id).filter(c => c.status === 'accepted');
                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        tasksCompleted={tasks.filter(t => t.status === 'completed').length}
                        totalTasks={tasks.length}
                        collaboratorCount={collabs.length}
                        isCollaborator={project.created_by !== user?.email}
                        onClick={() => setSelectedProject(project)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={(project) => {
          queryClient.invalidateQueries(['projects']);
          queryClient.invalidateQueries(['project-tasks']);
          setSelectedProject(project);
        }}
      />

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto transition-all duration-300",
          isExpanded ? "sm:max-w-[95vw] sm:h-[95vh]" : "sm:max-w-4xl"
        )}>
          {selectedProject && (
            <>
              <DialogHeader>
                <div className={cn("h-2 -mx-6 -mt-6 mb-4 bg-gradient-to-r rounded-t-lg", colorClasses[selectedProject.color] || colorClasses.purple)} />

                <DialogTitle className="flex items-center gap-3">
                  <span className="text-3xl">{selectedProject.icon || '🎯'}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                    <p className="text-sm text-gray-500 font-normal">{selectedProject.description}</p>
                  </div>
                </DialogTitle>

                {/* Barra de acciones del proyecto */}
                <div className="flex items-center gap-2 mt-4 pb-4 border-b flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="gap-2"
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    {isExpanded ? 'Minimizar' : 'Expandir'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('¿Archivar este proyecto? Podrás verlo en el historial.')) {
                        archiveProjectMutation.mutate(selectedProject.id);
                      }
                    }}
                    className="gap-2 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                  >
                    <Archive className="w-4 h-4" />
                    Archivar
                  </Button>

                  {selectedProject.created_by === user?.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('¿Eliminar este proyecto permanentemente? Esta acción no se puede deshacer.')) {
                          deleteProjectMutation.mutate(selectedProject.id);
                        }
                      }}
                      className="gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Progress */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">{t('projects.progress')}</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAdvancedModeMutation.mutate(selectedProject)}
                        className={cn(
                          "h-7 text-xs gap-1",
                          selectedProject.advanced_mode ? "text-purple-600" : "text-gray-500"
                        )}
                      >
                        {selectedProject.advanced_mode ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        {t('projects.advancedMode')}
                      </Button>
                      <span className="font-bold">{selectedProject.progress || 0}%</span>
                    </div>
                  </div>
                  <Progress value={selectedProject.progress || 0} className="h-3" />

                  {selectedProject.target_date && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {t('projects.target', 'Meta')}: {format(new Date(selectedProject.target_date), i18n.language === 'en' ? "MMMM d, yyyy" : "d 'de' MMMM, yyyy", { locale: dateLocale })}
                      {differenceInDays(new Date(selectedProject.target_date), new Date()) >= 0 && (
                        <Badge variant="outline" className="ml-2">
                          {differenceInDays(new Date(selectedProject.target_date), new Date())} {t('projects.daysRemaining', 'días restantes')}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Weekly Progress Bar */}
                {selectedProject.weekly_tracking_enabled && currentWeekStatus && (
                  <WeeklyProgressBar
                    project={selectedProject}
                    currentWeekStatus={currentWeekStatus}
                    selectedWeekNumber={selectedWeekNumber}
                    onPreviousWeek={() => setSelectedWeekNumber(Math.max(1, selectedWeekNumber - 1))}
                    onNextWeek={() => setSelectedWeekNumber(Math.min(selectedProject.total_weeks, selectedWeekNumber + 1))}
                    canGoPrevious={selectedWeekNumber > 1}
                    canGoNext={selectedWeekNumber < selectedProject.total_weeks}
                  />
                )}

                {/* Chat IA integrado */}
                <div className="bg-white rounded-xl p-4 border-2 border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Chat con IA del Proyecto</h3>
                  </div>
                  <ProjectChat
                    project={selectedProject}
                    user={user}
                    onRefresh={() => {
                      queryClient.invalidateQueries(['project-tasks']);
                      queryClient.invalidateQueries(['own-projects']);
                      queryClient.invalidateQueries(['all-projects']);
                      queryClient.invalidateQueries(['week-statuses']);
                    }}
                  />
                </div>

                {/* Collaborators indicator */}
                {getProjectCollaborators(selectedProject.id).filter(c => c.status === 'accepted').length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      <Users className="w-3 h-3 mr-1" />
                      {t('projects.collaborativeProject', 'Proyecto colaborativo')} ({getProjectCollaborators(selectedProject.id).filter(c => c.status === 'accepted').length + 1} {t('projects.people', 'personas')})
                    </Badge>
                  </div>
                )}

                {/* Views Tabs */}
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid grid-cols-7 w-full">
                    <TabsTrigger value="list" className="text-xs">
                      <List className="w-4 h-4 mr-1" />
                      {t('projects.list')}
                    </TabsTrigger>
                    <TabsTrigger value="kanban" className="text-xs">
                      <LayoutGrid className="w-4 h-4 mr-1" />
                      {t('projects.kanban')}
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="text-xs">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {t('projects.timeline')}
                    </TabsTrigger>
                    <TabsTrigger value="gantt" className="text-xs">
                      <GanttChart className="w-4 h-4 mr-1" />
                      {t('projects.gantt')}
                    </TabsTrigger>
                    <TabsTrigger value="team" className="text-xs">
                      <Users className="w-4 h-4 mr-1" />
                      {t('projects.collaborators')}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">
                      <History className="w-4 h-4 mr-1" />
                      {t('projects.history', 'Historial')}
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Asistente
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="list" className="mt-4">
                    <ProjectTaskList
                      tasks={getProjectTasks(selectedProject.id, selectedProject.weekly_tracking_enabled ? selectedWeekNumber : null)}
                      onCompleteTask={(task) => completeTaskMutation.mutate({ task, project: selectedProject })}
                      onSkipTask={(task) => skipTaskMutation.mutate({ task, project: selectedProject })}
                      onAssignTask={(task, email) => assignTaskMutation.mutate({ task, assigneeEmail: email })}
                      onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
                      showCompleted={selectedProject.status === 'completed'}
                      advancedMode={selectedProject.advanced_mode}
                      collaborators={[
                        { user_email: selectedProject.created_by, user_name: 'Propietario' },
                        ...getProjectCollaborators(selectedProject.id).filter(c => c.status === 'accepted')
                      ]}
                      currentUser={user}
                    />
                  </TabsContent>

                  <TabsContent value="kanban" className="mt-4">
                    <ProjectKanban
                      tasks={getProjectTasks(selectedProject.id)}
                      onCompleteTask={(task) => completeTaskMutation.mutate({ task, project: selectedProject })}
                    />
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-4">
                    <ProjectTimeline
                      tasks={getProjectTasks(selectedProject.id)}
                      onCompleteTask={(task) => completeTaskMutation.mutate({ task, project: selectedProject })}
                    />
                  </TabsContent>

                  <TabsContent value="gantt" className="mt-4">
                    <ProjectGantt
                      tasks={getProjectTasks(selectedProject.id)}
                      project={selectedProject}
                      onCompleteTask={(task) => completeTaskMutation.mutate({ task, project: selectedProject })}
                    />
                  </TabsContent>

                  <TabsContent value="team" className="mt-4">
                    <ProjectCollaborators
                      project={selectedProject}
                      collaborators={getProjectCollaborators(selectedProject.id)}
                      currentUser={user}
                      isOwner={selectedProject.created_by === user?.email}
                      onRefresh={() => {
                        queryClient.invalidateQueries(['all-collaborators']);
                        queryClient.invalidateQueries(['own-projects']);
                        queryClient.invalidateQueries(['all-projects']);
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="history" className="mt-4">
                    <ProjectTaskHistory tasks={getProjectTasks(selectedProject.id)} />
                  </TabsContent>

                  <TabsContent value="ai" className="mt-4">
                    <ProjectAIAssistant
                      project={selectedProject}
                      tasks={getProjectTasks(selectedProject.id)}
                      onRefresh={() => {
                        queryClient.invalidateQueries(['project-tasks']);
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}