import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, TrendingUp, Calendar, Flame, CheckCircle2, Trophy, Clock, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import CreateGoalDialog from '../components/objectives/CreateGoalDialog';
import GoalDetailDialog from '../components/objectives/GoalDetailDialog';
import { sendUnveilEvent } from '../lib/unveilEvents';

export default function ObjectivesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', currentUser?.email],
    queryFn: () => db.entities.Goal.filter({ created_by: currentUser?.email }, '-created_date'),
    enabled: !!currentUser,
    staleTime: 30000,
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits', currentUser?.email],
    queryFn: () => db.entities.Habit.filter({ created_by: currentUser?.email, is_active: true }),
    enabled: !!currentUser,
    staleTime: 30000,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['all-logs', currentUser?.email],
    queryFn: () => db.entities.HabitLog.list(),
    enabled: !!currentUser,
    staleTime: 30000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', currentUser?.email],
    queryFn: () => db.entities.Project.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser,
    staleTime: 30000,
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => db.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setShowCreateDialog(false);
      toast.success('¡Objetivo creado!');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Goal.update(id, data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries(['goals']);
      toast.success('¡Objetivo actualizado!');
      // Unveil: goal achieved
      if (variables.data.status === 'completed') {
        const goal = goals.find(g => g.id === variables.id);
        sendUnveilEvent(currentUser, { event_type: 'goal_achieved', entity_name: goal?.title || '', value: null });
      }
    },
  });

  const calculateGoalProgress = (goal) => {
    const associatedHabits = habits.filter(h => goal.associated_habit_ids?.includes(h.id));
    const associatedProjects = projects.filter(p => goal.associated_project_ids?.includes(p.id));
    
    if (associatedHabits.length === 0 && associatedProjects.length === 0) return 0;

    if (goal.target_type === 'projects') {
      if (associatedProjects.length === 0) return 0;
      const completedProjects = associatedProjects.filter(p => p.status === 'completed').length;
      return Math.min(100, (completedProjects / goal.target_value) * 100);
    }

    if (goal.target_type === 'days') {
      const startDate = parseISO(goal.start_date);
      const today = new Date();
      const daysPassed = differenceInDays(today, startDate);
      const daysWithActivity = new Set();
      
      logs.forEach(log => {
        if (goal.associated_habit_ids?.includes(log.habit_id)) {
          daysWithActivity.add(log.completed_date);
        }
      });
      
      return Math.min(100, (daysWithActivity.size / goal.target_value) * 100);
    }
    
    if (goal.target_type === 'completions') {
      const totalCompletions = associatedHabits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
      return Math.min(100, (totalCompletions / goal.target_value) * 100);
    }
    
    if (goal.target_type === 'streak') {
      const maxStreak = Math.max(...associatedHabits.map(h => h.current_streak || 0), 0);
      return Math.min(100, (maxStreak / goal.target_value) * 100);
    }
    
    return 0;
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const colorGradients = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Objetivos
                </h1>
                <p className="text-gray-600">Metas a largo plazo vinculadas a tus hábitos y caminos</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Objetivo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{activeGoals.length}</p>
                  <p className="text-sm text-gray-600">Activos</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{completedGoals.length}</p>
                  <p className="text-sm text-gray-600">Completados</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{goals.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Objetivos Activos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeGoals.map((goal, index) => {
                const progress = calculateGoalProgress(goal);
                const daysLeft = differenceInDays(parseISO(goal.end_date), new Date());
                const associatedHabits = habits.filter(h => goal.associated_habit_ids?.includes(h.id));
                const associatedProjects = projects.filter(p => goal.associated_project_ids?.includes(p.id));
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="p-6 hover:shadow-lg transition-all cursor-pointer border-2"
                      onClick={() => setSelectedGoal(goal)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorGradients[goal.color]} flex items-center justify-center shadow-md`}>
                            <span className="text-2xl">{goal.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800">{goal.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progreso</span>
                            <span className="font-bold text-purple-600">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>

                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}</span>
                          </div>
                          {associatedHabits.length > 0 && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Flame className="w-4 h-4" />
                              <span>{associatedHabits.length} hábitos</span>
                            </div>
                          )}
                          {associatedProjects.length > 0 && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <FolderKanban className="w-4 h-4" />
                                  <span>{associatedProjects.length} caminos</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {goal.target_type === 'days' && (
                            <Badge className="bg-blue-100 text-blue-700">
                              <Calendar className="w-3 h-3 mr-1" />
                              {goal.target_value} días
                            </Badge>
                          )}
                          {goal.target_type === 'completions' && (
                            <Badge className="bg-green-100 text-green-700">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {goal.target_value} completaciones
                            </Badge>
                          )}
                          {goal.target_type === 'streak' && (
                            <Badge className="bg-orange-100 text-orange-700">
                              <Flame className="w-3 h-3 mr-1" />
                              Racha de {goal.target_value}
                            </Badge>
                          )}
                          {goal.target_type === 'projects' && (
                            <Badge className="bg-purple-100 text-purple-700">
                              <FolderKanban className="w-3 h-3 mr-1" />
                              {goal.target_value} caminos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* User Projects Section */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-blue-600" />
              Tus Caminos
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project, index) => {
                const daysLeft = project.target_date ? differenceInDays(parseISO(project.target_date), new Date()) : null;
                const isLinkedToGoal = activeGoals.some(goal => goal.associated_project_ids?.includes(project.id));
                
                return (
                  <Link key={project.id} to={createPageUrl('Projects')}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md`}>
                              <span className="text-2xl">{project.icon || '🚀'}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-800">{project.name}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Progreso</span>
                              <span className="font-bold text-blue-600">{project.progress || 0}%</span>
                            </div>
                            <Progress value={project.progress || 0} className="h-3" />
                          </div>

                          <div className="flex items-center gap-4 text-sm flex-wrap">
                            {daysLeft !== null && (
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}</span>
                              </div>
                            )}
                            {isLinkedToGoal && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                <Target className="w-3 h-3 mr-1" />
                                Vinculado a objetivo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Objetivos Completados</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => (
                <Card 
                  key={goal.id}
                  className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 cursor-pointer"
                  onClick={() => setSelectedGoal(goal)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-green-800">{goal.title}</h3>
                      <p className="text-sm text-green-600">
                        Completado el {format(parseISO(goal.completion_date), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && projects.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Crea tu primer objetivo</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Define metas a largo plazo y asocia hábitos o caminos para hacer seguimiento automático
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Primer Elemento
            </Button>
          </motion.div>
        )}
      </div>

      <CreateGoalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        habits={habits}
        projects={projects}
        onCreate={(data) => createGoalMutation.mutate(data)}
      />

      {selectedGoal && (
        <GoalDetailDialog
          open={!!selectedGoal}
          onOpenChange={() => setSelectedGoal(null)}
          goal={selectedGoal}
          habits={habits}
          projects={projects}
          logs={logs}
          onUpdate={(data) => updateGoalMutation.mutate({ id: selectedGoal.id, data })}
          calculateProgress={calculateGoalProgress}
        />
      )}
    </div>
  );
}