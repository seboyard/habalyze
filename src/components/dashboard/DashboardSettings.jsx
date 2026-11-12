import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Sparkles, LayoutGrid, Zap, Brain } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardSettings({ open, onOpenChange, userPrefs }) {
  const [showDailyQuote, setShowDailyQuote] = useState(true);
  const [groupSimilarHabits, setGroupSimilarHabits] = useState(true);
  const [showProjectTasks, setShowProjectTasks] = useState(true);
  const [showQuickStartGuide, setShowQuickStartGuide] = useState(true);
  const [showProactiveCoach, setShowProactiveCoach] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState('default');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userPrefs) {
      setShowDailyQuote(userPrefs.show_daily_quote !== false);
      setGroupSimilarHabits(userPrefs.group_similar_habits !== false);
      setShowProjectTasks(userPrefs.show_project_tasks_on_dashboard !== false);
      setShowQuickStartGuide(userPrefs.show_quick_start_guide !== false);
      setShowProactiveCoach(userPrefs.show_proactive_coach !== false);
      setCompactView(userPrefs.compact_view === true);
      setDashboardLayout(userPrefs.dashboard_layout || 'default');
    }
  }, [userPrefs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (userPrefs?.id) {
        await db.entities.UserPreferences.update(userPrefs.id, {
          show_daily_quote: showDailyQuote,
          group_similar_habits: groupSimilarHabits,
          show_project_tasks_on_dashboard: showProjectTasks,
          show_quick_start_guide: showQuickStartGuide,
          show_proactive_coach: showProactiveCoach,
          compact_view: compactView,
          dashboard_layout: dashboardLayout
        });
        toast.success('Preferencias guardadas');
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error('Error: no se encontraron preferencias');
      }
    } catch (e) {
      toast.error('Error al guardar');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Personalizar Inicio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <Label htmlFor="daily-quote" className="font-medium">Frase del día</Label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Muestra una frase motivacional generada por IA cada día
              </p>
            </div>
            <Switch
              id="daily-quote"
              checked={showDailyQuote}
              onCheckedChange={setShowDailyQuote}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <Label htmlFor="quick-start" className="font-medium">Guía de Inicio Rápido</Label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Muestra pasos sugeridos al inicio para usuarios nuevos
              </p>
            </div>
            <Switch
              id="quick-start"
              checked={showQuickStartGuide}
              onCheckedChange={setShowQuickStartGuide}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-600" />
                <Label htmlFor="proactive-coach" className="font-medium">Coach Proactivo</Label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Muestra sugerencias del Coach IA cuando hay hábitos pendientes
              </p>
            </div>
            <Switch
              id="proactive-coach"
              checked={showProactiveCoach}
              onCheckedChange={setShowProactiveCoach}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-purple-600" />
                <Label htmlFor="group-habits" className="font-medium">Agrupar hábitos similares</Label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Agrupa automáticamente hábitos relacionados (ej: cepillar dientes en diferentes horarios)
              </p>
            </div>
            <Switch
              id="group-habits"
              checked={groupSimilarHabits}
              onCheckedChange={setGroupSimilarHabits}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="show-projects" className="font-medium">Tareas de proyectos</Label>
              <p className="text-sm text-gray-500 mt-1">
                Muestra las próximas tareas de tus proyectos activos
              </p>
            </div>
            <Switch
              id="show-projects"
              checked={showProjectTasks}
              onCheckedChange={setShowProjectTasks}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="compact-view" className="font-medium">Vista compacta</Label>
              <p className="text-sm text-gray-500 mt-1">
                Tarjetas de hábitos más pequeñas
              </p>
            </div>
            <Switch
              id="compact-view"
              checked={compactView}
              onCheckedChange={setCompactView}
            />
          </div>

          <div className="space-y-3">
            <Label>Diseño del dashboard</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDashboardLayout('default')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  dashboardLayout === 'default' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <p className="font-medium text-sm">Clásico</p>
                <p className="text-xs text-gray-500">Vista tradicional</p>
              </button>
              <button
                type="button"
                onClick={() => setDashboardLayout('cards')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  dashboardLayout === 'cards' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <p className="font-medium text-sm">Tarjetas</p>
                <p className="text-xs text-gray-500">Vista en cuadrícula</p>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}