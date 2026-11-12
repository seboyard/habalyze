import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Plus, Heart, Dumbbell, Brain, Moon, BookOpen, Coffee,
  Droplet, Utensils, Music, Smile, Star, Check, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'Todos', icon: Star, color: 'bg-violet-500' },
  { id: 'health', label: 'Salud', icon: Heart, color: 'bg-red-500' },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'bg-green-500' },
  { id: 'mental', label: 'Mental', icon: Brain, color: 'bg-purple-500' },
  { id: 'sleep', label: 'Sueño', icon: Moon, color: 'bg-indigo-500' },
  { id: 'learning', label: 'Aprendizaje', icon: BookOpen, color: 'bg-amber-500' },
  { id: 'productivity', label: 'Productividad', icon: Coffee, color: 'bg-orange-500' },
  { id: 'nutrition', label: 'Nutrición', icon: Utensils, color: 'bg-teal-500' },
];

const habitLibrary = [
  // Health
  { id: 'water_8', name: 'Beber 8 vasos de agua', description: 'Mantén tu cuerpo hidratado para mejor energía y concentración.', category: 'health', icon: 'droplet', color: 'blue', difficulty: 'easy', benefit: 'Mejora la energía y concentración', tips: ['Ten una botella siempre cerca', 'Pon alarmas cada 2 horas'] },
  { id: 'vitamins', name: 'Tomar vitaminas', description: 'Suplementa tu dieta con vitaminas esenciales.', category: 'health', icon: 'heart', color: 'red', difficulty: 'easy', benefit: 'Fortalece el sistema inmune', tips: ['Tómalas con el desayuno', 'Mantén un pastillero'] },
  { id: 'no_alcohol', name: 'Día sin alcohol', description: 'Reduce el consumo de alcohol para mejor salud.', category: 'health', icon: 'heart', color: 'pink', difficulty: 'medium', benefit: 'Mejora la calidad del sueño', tips: ['Reemplaza con agua con gas', 'Ten alternativas sin alcohol'] },
  
  // Fitness
  { id: 'exercise_30', name: '30 min de ejercicio', description: 'Mantén tu cuerpo activo con ejercicio diario.', category: 'fitness', icon: 'dumbbell', color: 'green', difficulty: 'medium', benefit: 'Mejora la salud cardiovascular', tips: ['Hazlo a la misma hora', 'Prepara tu ropa la noche anterior'] },
  { id: 'stretching', name: 'Estiramientos', description: 'Mejora tu flexibilidad con estiramientos diarios.', category: 'fitness', icon: 'heart', color: 'teal', difficulty: 'easy', benefit: 'Reduce tensión muscular', tips: ['Hazlo al despertar', 'Solo necesitas 10 minutos'] },
  { id: 'walk_10k', name: '10,000 pasos', description: 'Camina más para mantenerte activo.', category: 'fitness', icon: 'heart', color: 'green', difficulty: 'medium', benefit: 'Quema calorías extra', tips: ['Usa las escaleras', 'Da paseos cortos cada hora'] },
  { id: 'strength', name: 'Entrenamiento de fuerza', description: 'Desarrolla músculo con ejercicios de fuerza.', category: 'fitness', icon: 'dumbbell', color: 'red', difficulty: 'hard', benefit: 'Aumenta masa muscular', tips: ['Empieza con peso corporal', 'Descansa entre series'] },
  
  // Mental
  { id: 'meditate_10', name: 'Meditar 10 minutos', description: 'Calma tu mente con meditación diaria.', category: 'mental', icon: 'brain', color: 'purple', difficulty: 'medium', benefit: 'Reduce estrés y ansiedad', tips: ['Usa apps como Headspace', 'Hazlo al despertar'] },
  { id: 'journal', name: 'Escribir en diario', description: 'Reflexiona sobre tu día escribiendo.', category: 'mental', icon: 'book', color: 'pink', difficulty: 'easy', benefit: 'Mejora el autoconocimiento', tips: ['Escribe 3 cosas buenas del día', 'Hazlo antes de dormir'] },
  { id: 'gratitude', name: 'Practicar gratitud', description: 'Agradece por 3 cosas cada día.', category: 'mental', icon: 'smile', color: 'yellow', difficulty: 'easy', benefit: 'Aumenta la felicidad', tips: ['Sé específico en tu gratitud', 'Incluye personas'] },
  { id: 'no_phone_1h', name: '1 hora sin teléfono', description: 'Desconecta del teléfono para estar presente.', category: 'mental', icon: 'brain', color: 'blue', difficulty: 'medium', benefit: 'Mejora la concentración', tips: ['Ponlo en otra habitación', 'Activa modo avión'] },
  
  // Sleep
  { id: 'sleep_8h', name: 'Dormir 8 horas', description: 'Descansa lo suficiente para rendir mejor.', category: 'sleep', icon: 'moon', color: 'purple', difficulty: 'medium', benefit: 'Mejora la energía', tips: ['Acuéstate a la misma hora', 'Evita pantallas antes de dormir'] },
  { id: 'no_screens', name: 'Sin pantallas antes de dormir', description: 'Evita pantallas 1 hora antes de dormir.', category: 'sleep', icon: 'moon', color: 'blue', difficulty: 'medium', benefit: 'Mejora calidad del sueño', tips: ['Lee un libro físico', 'Usa luz cálida'] },
  { id: 'sleep_routine', name: 'Rutina de relajación', description: 'Prepárate para dormir con una rutina calmante.', category: 'sleep', icon: 'moon', color: 'pink', difficulty: 'easy', benefit: 'Facilita conciliar el sueño', tips: ['Té caliente sin cafeína', 'Música relajante'] },
  
  // Learning
  { id: 'read_20', name: 'Leer 20 páginas', description: 'Expande tu conocimiento leyendo diariamente.', category: 'learning', icon: 'book', color: 'orange', difficulty: 'medium', benefit: 'Aumenta el conocimiento', tips: ['Ten un libro siempre cerca', 'Lee antes de dormir'] },
  { id: 'language', name: 'Practicar idioma', description: 'Aprende o mejora un idioma nuevo.', category: 'learning', icon: 'brain', color: 'blue', difficulty: 'medium', benefit: 'Mejora capacidades cognitivas', tips: ['Usa Duolingo', '15 minutos son suficientes'] },
  { id: 'learn_new', name: 'Aprender algo nuevo', description: 'Dedica tiempo a aprender una habilidad.', category: 'learning', icon: 'brain', color: 'purple', difficulty: 'medium', benefit: 'Mantiene la mente activa', tips: ['Elige un tema de interés', 'Ve tutoriales cortos'] },
  { id: 'podcast', name: 'Escuchar podcast educativo', description: 'Aprende mientras haces otras cosas.', category: 'learning', icon: 'music', color: 'green', difficulty: 'easy', benefit: 'Aprovecha tiempo muerto', tips: ['Durante el transporte', 'Mientras cocinas'] },
  
  // Productivity
  { id: 'plan_day', name: 'Planificar el día', description: 'Empieza cada día con un plan claro.', category: 'productivity', icon: 'brain', color: 'purple', difficulty: 'easy', benefit: 'Aumenta la productividad', tips: ['Hazlo la noche anterior', 'Prioriza 3 tareas'] },
  { id: 'pomodoro', name: 'Sesión Pomodoro', description: 'Trabaja en bloques de 25 minutos.', category: 'productivity', icon: 'coffee', color: 'orange', difficulty: 'medium', benefit: 'Mejora el enfoque', tips: ['Usa un temporizador', 'Toma descansos cortos'] },
  { id: 'inbox_zero', name: 'Inbox Zero', description: 'Vacía tu bandeja de entrada diariamente.', category: 'productivity', icon: 'brain', color: 'blue', difficulty: 'medium', benefit: 'Reduce estrés', tips: ['Revisa 2 veces al día', 'Responde, archiva o elimina'] },
  { id: 'no_procrastination', name: 'Sin procrastinar', description: 'Haz primero la tarea más difícil.', category: 'productivity', icon: 'coffee', color: 'red', difficulty: 'hard', benefit: 'Completa tareas importantes', tips: ['Empieza con 2 minutos', 'Elimina distracciones'] },
  
  // Nutrition
  { id: 'healthy_breakfast', name: 'Desayuno saludable', description: 'Empieza el día con un desayuno nutritivo.', category: 'nutrition', icon: 'utensils', color: 'green', difficulty: 'easy', benefit: 'Energía para el día', tips: ['Prepara la noche anterior', 'Incluye proteína'] },
  { id: 'fruits_veggies', name: '5 frutas/verduras', description: 'Come al menos 5 porciones de vegetales.', category: 'nutrition', icon: 'utensils', color: 'teal', difficulty: 'medium', benefit: 'Mejora la salud', tips: ['Ten snacks listos', 'Añade a cada comida'] },
  { id: 'no_junk', name: 'Sin comida chatarra', description: 'Evita alimentos procesados por un día.', category: 'nutrition', icon: 'utensils', color: 'red', difficulty: 'hard', benefit: 'Reduce inflamación', tips: ['Prepara snacks saludables', 'Come antes de tener hambre'] },
  { id: 'meal_prep', name: 'Preparar comidas', description: 'Prepara tus comidas con anticipación.', category: 'nutrition', icon: 'utensils', color: 'orange', difficulty: 'medium', benefit: 'Ahorra tiempo y dinero', tips: ['Elige un día fijo', 'Cocina en lotes'] },
];

const difficultyConfig = {
  easy: { label: 'Fácil', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Medio', color: 'bg-amber-100 text-amber-700' },
  hard: { label: 'Difícil', color: 'bg-red-100 text-red-700' },
};

export default function HabitLibraryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const addHabitMutation = useMutation({
    mutationFn: async (habit) => {
      await db.entities.Habit.create({
        name: habit.name,
        description: habit.description,
        icon: habit.icon,
        color: habit.color,
        frequency: 'daily',
        current_streak: 0,
        best_streak: 0,
        total_completions: 0,
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      toast.success('¡Hábito añadido!', { description: 'Ya está disponible en tu dashboard' });
      setSelectedHabit(null);
    }
  });

  const filteredHabits = habitLibrary.filter(habit => {
    const matchesCategory = activeCategory === 'all' || habit.category === activeCategory;
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          habit.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Librería de Hábitos</h1>
              <p className="text-purple-200 text-sm">Explora y añade hábitos probados</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar hábitos..."
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-purple-200"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={activeCategory === cat.id ? `${cat.color} text-white` : ''}
              >
                <Icon className="w-4 h-4 mr-1" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">{filteredHabits.length} hábitos encontrados</p>

        {/* Habits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit, i) => {
            const difficulty = difficultyConfig[habit.difficulty];
            const category = categories.find(c => c.id === habit.category);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card 
                  className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-violet-200"
                  onClick={() => setSelectedHabit(habit)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      `bg-${habit.color}-100`
                    )}>
                      <Star className={`w-6 h-6 text-${habit.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{habit.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{habit.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={difficulty.color}>{difficulty.label}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {category?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Habit Detail Modal */}
      {selectedHabit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedHabit(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden">
              <div className={`bg-gradient-to-r from-${selectedHabit.color}-500 to-${selectedHabit.color}-600 p-6 text-white`}>
                <h2 className="text-2xl font-bold">{selectedHabit.name}</h2>
                <p className="text-white/80 mt-1">{selectedHabit.description}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Beneficio Principal</h3>
                  <p className="text-gray-600 bg-green-50 p-3 rounded-lg">
                    ✨ {selectedHabit.benefit}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Consejos para Empezar</h3>
                  <ul className="space-y-2">
                    {selectedHabit.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedHabit(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600"
                    onClick={() => addHabitMutation.mutate(selectedHabit)}
                    disabled={addHabitMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addHabitMutation.isPending ? 'Añadiendo...' : 'Añadir Hábito'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}