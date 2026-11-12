import { db } from '@/api/base44Client';
import React, { useState, useEffect, useMemo } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, TrendingUp, ArrowLeft, Plus, Trash2, Save, X, Edit, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { differenceInDays, parseISO } from 'date-fns';

import HabitChart from '../components/statistics/HabitChart';
import StreakHistory from '../components/statistics/StreakHistory';
import CompletionSummary from '../components/statistics/CompletionSummary';
import ProductiveDays from '../components/statistics/ProductiveDays';
import HeatmapCalendar from '../components/statistics/HeatmapCalendar';
import WeekdayPattern from '../components/statistics/WeekdayPattern';
import ConsistencyScore from '../components/statistics/ConsistencyScore';
import TimeOfDayChart from '../components/statistics/TimeOfDayChart';
import HabitComplianceCalendar from '../components/statistics/HabitComplianceCalendar';
import TopHabits from '../components/statistics/TopHabits';
import MonthlyComparison from '../components/statistics/MonthlyComparison';
import GoalProgress from '../components/statistics/GoalProgress';
import HabitSuccessRate from '../components/statistics/HabitSuccessRate';
import ProjectStats from '../components/statistics/ProjectStats';
import ObjectiveProgress from '../components/statistics/ObjectiveProgress';
import OverallSummary from '../components/statistics/OverallSummary';

const ResponsiveGridLayout = WidthProvider(Responsive);

const availableComponents = [
  { id: 'OverallSummary', name: 'Resumen General', component: OverallSummary, defaultSize: { w: 12, h: 6 }, minH: 6, maxH: 6 },
  { id: 'CompletionSummary', name: 'Resumen de Completados', component: CompletionSummary, defaultSize: { w: 12, h: 6 }, minH: 6, maxH: 6 },
  { id: 'ObjectiveProgress', name: 'Progreso de Objetivos', component: ObjectiveProgress, defaultSize: { w: 6, h: 8 }, minH: 8, maxH: 8 },
  { id: 'ProjectStats', name: 'Estadísticas de Proyectos', component: ProjectStats, defaultSize: { w: 6, h: 8 }, minH: 8, maxH: 8 },
  { id: 'GoalProgress', name: 'Progreso de Metas', component: GoalProgress, defaultSize: { w: 6, h: 6 }, minH: 6, maxH: 6 },
  { id: 'HabitChart', name: 'Gráfico de Hábitos', component: HabitChart, defaultSize: { w: 6, h: 7 }, minH: 7, maxH: 7 },
  { id: 'StreakHistory', name: 'Historial de Rachas', component: StreakHistory, defaultSize: { w: 6, h: 7 }, minH: 7, maxH: 7 },
  { id: 'TopHabits', name: 'Top 5 Hábitos', component: TopHabits, defaultSize: { w: 6, h: 6 }, minH: 6, maxH: 6 },
  { id: 'ProductiveDays', name: 'Días Productivos', component: ProductiveDays, defaultSize: { w: 6, h: 6 }, minH: 6, maxH: 6 },
  { id: 'MonthlyComparison', name: 'Comparación Mensual', component: MonthlyComparison, defaultSize: { w: 6, h: 7 }, minH: 7, maxH: 7 },
  { id: 'HabitSuccessRate', name: 'Tasa de Éxito', component: HabitSuccessRate, defaultSize: { w: 6, h: 7 }, minH: 7, maxH: 7 },
  { id: 'HeatmapCalendar', name: 'Calendario Heatmap', component: HeatmapCalendar, defaultSize: { w: 6, h: 7 }, minH: 7, maxH: 7 },
  { id: 'WeekdayPattern', name: 'Patrón Semanal', component: WeekdayPattern, defaultSize: { w: 6, h: 6 }, minH: 6, maxH: 6 },
  { id: 'ConsistencyScore', name: 'Puntuación de Consistencia', component: ConsistencyScore, defaultSize: { w: 6, h: 5 }, minH: 5, maxH: 5 },
  { id: 'TimeOfDayChart', name: 'Gráfico Hora del Día', component: TimeOfDayChart, defaultSize: { w: 6, h: 6 }, minH: 6, maxH: 6 },
  { id: 'HabitComplianceCalendar', name: 'Calendario de Cumplimiento', component: HabitComplianceCalendar, defaultSize: { w: 12, h: 9 }, minH: 9, maxH: 9 },
];

const calculateNoOverlapLayout = (components) => {
  if (!components || components.length === 0) return [];
  
  const layout = [];
  let currentY = 0;
  let currentRowItems = [];
  
  components.forEach((comp, index) => {
    const compInfo = availableComponents.find(c => c.id === comp.component);
    const width = comp.w || compInfo?.defaultSize.w || 6;
    const height = comp.h || compInfo?.defaultSize.h || 6;
    
    const currentRowWidth = currentRowItems.reduce((sum, item) => sum + item.w, 0);
    
    if (currentRowWidth + width > 12 && currentRowItems.length > 0) {
      const maxHeight = Math.max(...currentRowItems.map(item => item.h));
      layout.push(...currentRowItems);
      currentY += maxHeight;
      currentRowItems = [];
    }
    
    const xPos = currentRowItems.reduce((sum, item) => sum + item.w, 0);
    
    const newItem = {
      i: comp.i || `comp-${Date.now()}-${index}`,
      x: xPos,
      y: currentY,
      w: width,
      h: height,
      component: comp.component,
      config: comp.config || {},
      minH: height,
      maxH: height,
      static: false
    };
    
    currentRowItems.push(newItem);
    
    const newRowWidth = currentRowItems.reduce((sum, item) => sum + item.w, 0);
    if (newRowWidth >= 12) {
      const maxHeight = Math.max(...currentRowItems.map(item => item.h));
      layout.push(...currentRowItems);
      currentY += maxHeight;
      currentRowItems = [];
    }
  });
  
  if (currentRowItems.length > 0) {
    layout.push(...currentRowItems);
  }
  
  return layout;
};

export default function StatisticsPage() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [layout, setLayout] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddComponentDialog, setShowAddComponentDialog] = useState(false);
  const [newComponentName, setNewComponentName] = useState('');
  const [showSaveViewDialog, setShowSaveViewDialog] = useState(false);
  const [viewName, setViewName] = useState('');
  const [currentViewId, setCurrentViewId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits-stats', currentUser?.email],
    queryFn: () => db.entities.Habit.filter({ created_by: currentUser?.email, is_active: true }),
    enabled: !!currentUser,
    staleTime: 60000,
  });

  const { data: allLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['all-logs', currentUser?.email],
    queryFn: async () => {
      // Limit to last 180 days to avoid infinite loading with large datasets
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 180);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      return db.entities.HabitLog.filter(
        { created_by: currentUser?.email, completed_date: { $gte: cutoffStr } },
        '-completed_date',
        2000
      );
    },
    enabled: !!currentUser,
    staleTime: 60000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-stats', currentUser?.email],
    queryFn: () => db.entities.Project.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser,
    staleTime: 60000,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals-stats', currentUser?.email],
    queryFn: () => db.entities.Goal.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser,
    staleTime: 60000,
  });

  const { data: statViews = [], isLoading: viewsLoading } = useQuery({
    queryKey: ['stat-views', currentUser?.email],
    queryFn: () => db.entities.StatView.filter({ user_email: currentUser?.email }, '-created_date'),
    enabled: !!currentUser,
    staleTime: 30000,
  });

  useEffect(() => {
    if (habits.length > 0 && !selectedHabit) {
      setSelectedHabit(habits[0]);
    }
  }, [habits, selectedHabit]);

  useEffect(() => {
    const initializeDefaultViews = async () => {
      if (currentUser && statViews.length === 0) {
        const completeComponents = [
          { component: 'OverallSummary', w: 12, h: 6 },
          { component: 'ObjectiveProgress', w: 6, h: 8 },
          { component: 'ProjectStats', w: 6, h: 8 },
          { component: 'TopHabits', w: 6, h: 6 },
          { component: 'StreakHistory', w: 6, h: 7 },
          { component: 'MonthlyComparison', w: 6, h: 7 },
          { component: 'HabitSuccessRate', w: 6, h: 7 },
          { component: 'HeatmapCalendar', w: 6, h: 7 },
          { component: 'WeekdayPattern', w: 6, h: 6 },
        ];
        
        const minimalComponents = [
          { component: 'OverallSummary', w: 12, h: 6 },
          { component: 'ObjectiveProgress', w: 6, h: 8 },
          { component: 'ProjectStats', w: 6, h: 8 },
          { component: 'TopHabits', w: 12, h: 6 },
        ];
        
        const analyticComponents = [
          { component: 'HabitSuccessRate', w: 6, h: 7 },
          { component: 'MonthlyComparison', w: 6, h: 7 },
          { component: 'ConsistencyScore', w: 6, h: 5 },
          { component: 'HeatmapCalendar', w: 6, h: 7 },
          { component: 'WeekdayPattern', w: 6, h: 6 },
          { component: 'TimeOfDayChart', w: 6, h: 6 },
          { component: 'HabitComplianceCalendar', w: 12, h: 9 },
        ];

        await db.entities.StatView.bulkCreate([
          {
            user_email: currentUser.email,
            view_name: 'Vista Completa',
            is_default: true,
            layout: calculateNoOverlapLayout(completeComponents)
          },
          {
            user_email: currentUser.email,
            view_name: 'Minimalista',
            is_default: false,
            layout: calculateNoOverlapLayout(minimalComponents)
          },
          {
            user_email: currentUser.email,
            view_name: 'Analítica',
            is_default: false,
            layout: calculateNoOverlapLayout(analyticComponents)
          }
        ]);

        queryClient.invalidateQueries(['stat-views']);
      }
    };

    initializeDefaultViews();
  }, [currentUser, statViews.length, queryClient]);

  useEffect(() => {
    if (statViews.length > 0 && !currentViewId) {
      const defaultView = statViews.find(v => v.is_default) || statViews[0];
      setCurrentViewId(defaultView.id);
      setLayout(defaultView.layout || []);
      setViewName(defaultView.view_name);
    }
  }, [statViews, currentViewId]);

  useEffect(() => {
    if (currentViewId && statViews.length > 0) {
      const selectedView = statViews.find(v => v.id === currentViewId);
      if (selectedView && selectedView.layout) {
        const recalculatedLayout = calculateNoOverlapLayout(selectedView.layout).map(item => ({
          ...item,
          static: !isEditing
        }));
        setLayout(recalculatedLayout);
        setViewName(selectedView.view_name);
      }
    }
  }, [currentViewId, statViews, isEditing]);

  const isLoading = habitsLoading || logsLoading || viewsLoading;

  const habitLogs = selectedHabit 
    ? allLogs.filter(log => log.habit_id === selectedHabit.id)
    : [];

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
      const daysWithActivity = new Set();
      
      allLogs.forEach(log => {
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

  const createViewMutation = useMutation({
    mutationFn: async ({ name, layoutConfig }) => {
      await db.entities.StatView.create({
        user_email: currentUser.email,
        view_name: name,
        layout: layoutConfig,
        is_default: statViews.length === 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stat-views']);
      setShowSaveViewDialog(false);
      setViewName('');
      toast.success('Vista creada');
    },
  });

  const updateViewMutation = useMutation({
    mutationFn: async ({ viewId, layoutConfig }) => {
      await db.entities.StatView.update(viewId, { layout: layoutConfig });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stat-views']);
      toast.success('Vista guardada');
      setIsEditing(false);
    },
  });

  const deleteViewMutation = useMutation({
    mutationFn: async (viewId) => {
      await db.entities.StatView.delete(viewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stat-views']);
      setCurrentViewId(null);
      toast.success('Vista eliminada');
    },
  });

  const handleLayoutChange = (newLayout) => {
    if (!isEditing) return;
    
    const updatedLayout = newLayout.map(item => {
      const existing = layout.find(l => l.i === item.i);
      return { ...existing, ...item };
    });
    
    const recalculatedLayout = calculateNoOverlapLayout(updatedLayout);
    setLayout(recalculatedLayout);
  };

  const handleSaveLayout = () => {
    if (currentViewId) {
      updateViewMutation.mutate({ viewId: currentViewId, layoutConfig: layout });
    }
  };

  const handleAddComponent = () => {
    if (!newComponentName) {
      toast.error('Selecciona un componente');
      return;
    }

    const componentInfo = availableComponents.find(c => c.id === newComponentName);
    if (!componentInfo) return;

    const newItem = {
      i: `comp-${Date.now()}`,
      component: componentInfo.id,
      w: componentInfo.defaultSize.w,
      h: componentInfo.defaultSize.h,
      config: {}
    };

    const updatedLayout = calculateNoOverlapLayout([...layout, newItem]);
    setLayout(updatedLayout);
    setShowAddComponentDialog(false);
    setNewComponentName('');
    toast.success('Componente añadido');
  };

  const handleRemoveComponent = (itemId) => {
    setLayout(layout.filter(item => item.i !== itemId));
    toast.success('Componente eliminado');
  };

  const handleCreateView = () => {
    if (!viewName.trim()) {
      toast.error('Ingresa un nombre para la vista');
      return;
    }
    createViewMutation.mutate({ name: viewName, layoutConfig: layout });
  };

  const renderComponent = (componentId, config) => {
    const Component = availableComponents.find(c => c.id === componentId)?.component;
    if (!Component) return null;

    const props = { habits, logs: allLogs, projects, goals };

    if (componentId === 'OverallSummary') {
      return <Component habits={habits} projects={projects} goals={goals} />;
    }
    if (componentId === 'ObjectiveProgress') {
      return <Component goals={goals} habits={habits} projects={projects} logs={allLogs} calculateProgress={calculateGoalProgress} />;
    }
    if (componentId === 'ProjectStats') {
      return <Component projects={projects} />;
    }
    if (componentId === 'HabitChart') {
      return <Component {...props} logs={habitLogs} period={selectedPeriod} habitName={selectedHabit?.name || 'Todos'} />;
    }
    if (componentId === 'HeatmapCalendar') {
      return <Component {...props} logs={habitLogs} habit={selectedHabit} />;
    }

    return <Component {...props} />;
  };

  const currentView = useMemo(() => statViews.find(v => v.id === currentViewId), [statViews, currentViewId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        <div className="mb-6 md:mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4 hover:bg-purple-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Estadísticas
                </h1>
                <p className="text-sm md:text-base text-gray-600">Analiza tu progreso y rendimiento</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={isEditing ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSaveLayout();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={isEditing ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {isEditing ? <><Save className="w-4 h-4 mr-2" /> Guardar</> : <><Edit className="w-4 h-4 mr-2" /> Editar</>}
              </Button>
              {isEditing && (
                <>
                  <Button size="sm" onClick={() => setShowAddComponentDialog(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay datos de hábitos disponibles</p>
            <Link to={createPageUrl('Dashboard')}>
              <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500">
                Crear Primer Hábito
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Selector de Vista */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-xl shadow-md border-2 border-gray-200">
              <LayoutGrid className="w-5 h-5 text-purple-600" />
              <Select onValueChange={setCurrentViewId} value={currentViewId || ''}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Seleccionar Vista" />
                </SelectTrigger>
                <SelectContent>
                  {statViews.map(view => (
                    <SelectItem key={view.id} value={view.id}>
                      {view.view_name} {view.is_default && '⭐'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentView && (
                <>
                  <span className="text-xs md:text-sm text-gray-600 flex-1">
                    {layout.length} componente{layout.length !== 1 && 's'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSaveViewDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nueva Vista
                    </Button>
                    {!currentView.is_default && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteViewMutation.mutate(currentViewId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Selector de Hábito y Periodo */}
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-md border-2 border-gray-200">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Label className="w-full text-xs md:text-sm font-medium text-gray-700">Filtrar por hábito:</Label>
                  <div className="flex flex-wrap gap-2">
                    {habits.map(habit => (
                      <Button
                        key={habit.id}
                        size="sm"
                        variant={selectedHabit?.id === habit.id ? 'default' : 'outline'}
                        onClick={() => setSelectedHabit(habit)}
                        className={selectedHabit?.id === habit.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-xs' : 'text-xs'}
                      >
                        {habit.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Label className="text-xs md:text-sm font-medium text-gray-700">Periodo:</Label>
                  {['week', 'month', 'year'].map(period => (
                    <Button
                      key={period}
                      size="sm"
                      variant={selectedPeriod === period ? 'default' : 'outline'}
                      onClick={() => setSelectedPeriod(period)}
                      className={selectedPeriod === period ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-xs' : 'text-xs'}
                    >
                      {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Layout */}
            {layout.length > 0 ? (
              <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 6, xs: 6, xxs: 6 }}
                rowHeight={70}
                margin={[12, 12]}
                containerPadding={[0, 0]}
                isDraggable={false}
                isResizable={false}
                onLayoutChange={handleLayoutChange}
                compactType={null}
                preventCollision={true}
                allowOverlap={false}
                useCSSTransforms={true}
              >
                {layout.map(item => (
                  <div key={item.i} className="relative h-full">
                    {isEditing && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 w-7 h-7 md:w-8 md:h-8"
                        onClick={() => handleRemoveComponent(item.i)}
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    )}
                    <div className="h-full">
                      {renderComponent(item.component, item.config)}
                    </div>
                  </div>
                ))}
              </ResponsiveGridLayout>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No hay componentes en esta vista</p>
                <Button onClick={() => setShowAddComponentDialog(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Primer Componente
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Dialog: Añadir Componente */}
        <Dialog open={showAddComponentDialog} onOpenChange={setShowAddComponentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir Componente al Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Seleccionar Componente</Label>
              <Select onValueChange={setNewComponentName} value={newComponentName}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un componente..." />
                </SelectTrigger>
                <SelectContent>
                  {availableComponents.map(comp => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddComponentDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddComponent}>Añadir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Nueva Vista */}
        <Dialog open={showSaveViewDialog} onOpenChange={setShowSaveViewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Vista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Nombre de la Vista</Label>
              <Input
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Ej: Mi Dashboard Personal"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveViewDialog(false)}>Cancelar</Button>
              <Button onClick={handleCreateView}>Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}