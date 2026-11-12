import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, X, ChevronLeft, ChevronRight, 
  Target, Users, Trophy, Brain, Store, Zap,
  FolderKanban, Award, BarChart3, Calendar,
  Crown, Gift, Sparkles, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const features = [
  {
    id: 'habits',
    title: 'Hábitos Inteligentes',
    description: 'Crea y rastrea hábitos con recordatorios, rachas y gamificación. Agrupa hábitos similares automáticamente.',
    icon: <Target className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    page: 'Dashboard',
    benefits: ['Rachas y recompensas', 'Recordatorios personalizados', 'Análisis de patrones']
  },
  {
    id: 'projects',
    title: 'Proyectos Organizados',
    description: 'Gestiona proyectos grandes con tareas, dependencias, colaboradores y múltiples vistas (Kanban, Gantt, Timeline).',
    icon: <FolderKanban className="w-6 h-6" />,
    color: 'from-teal-500 to-cyan-500',
    page: 'Projects',
    benefits: ['Vistas múltiples', 'Colaboración en equipo', 'Asistente IA']
  },
  {
    id: 'coach',
    title: 'Coach IA Personal',
    description: 'Conversaciones ilimitadas con tu coach inteligente que analiza tu progreso y te da consejos personalizados.',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-violet-500 to-purple-500',
    page: 'Coach',
    benefits: ['Análisis de patrones', 'Sugerencias proactivas', 'Disponible 24/7'],
    premium: true
  },
  {
    id: 'social',
    title: 'Red Social',
    description: 'Conecta con amigos, compite en rankings, únete a desafíos y comparte tu progreso.',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-500',
    page: 'Social',
    benefits: ['Competencias semanales', 'Desafíos grupales', 'Chat entre amigos']
  },
  {
    id: 'gamification',
    title: 'Gamificación Completa',
    description: 'Sistema de niveles, XP, monedas, gemas, logros, placas y pase de batalla que te mantiene motivado.',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-500',
    page: 'Achievements',
    benefits: ['100+ logros', 'Sistema de placas', 'Pase de batalla estacional']
  },
  {
    id: 'avatar',
    title: 'Avatar Personalizable',
    description: 'Crea tu personaje único con cientos de combinaciones de ropa, accesorios, mascotas y efectos visuales.',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-500',
    page: 'Avatar',
    benefits: ['Pixel art único', 'Crafteo de items', 'Efectos animados']
  },
  {
    id: 'statistics',
    title: 'Estadísticas Avanzadas',
    description: 'Dashboards personalizables con más de 13 tipos de gráficos y análisis profundos de tu progreso.',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    page: 'Statistics',
    benefits: ['Vistas personalizables', 'Heatmaps', 'Análisis predictivo']
  },
  {
    id: 'missions',
    title: 'Misiones y Objetivos',
    description: 'Completa misiones diarias, semanales y estacionales para ganar recompensas exclusivas.',
    icon: <Calendar className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    page: 'Missions',
    benefits: ['Misiones diarias', 'Sagas épicas', 'Eventos estacionales']
  }
];

export default function FeatureDiscovery({ onDismiss }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentFeature = features[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  if (!isExpanded) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsExpanded(true)}
        className="w-full mb-4"
      >
        <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-800">Descubre funcionalidades</h3>
                <p className="text-xs text-gray-600">Conoce todo lo que Habalyze puede hacer por ti</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-600" />
          </div>
        </Card>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="overflow-hidden border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          {/* Header */}
          <div className={`bg-gradient-to-r ${currentFeature.color} p-4 text-white relative`}>
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <motion.div
                key={currentIndex}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                {currentFeature.icon}
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{currentFeature.title}</h3>
                  {currentFeature.premium && (
                    <Badge className="bg-amber-500 text-white text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/90">{currentIndex + 1} de {features.length}</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex ? 'bg-white w-6' : 'bg-white/40 w-1.5'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-700 mb-4 leading-relaxed">
                {currentFeature.description}
              </p>

              {/* Benefits */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase">Beneficios clave:</p>
                {currentFeature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${currentFeature.color}`} />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link to={createPageUrl(currentFeature.page)} className="flex-1">
                  <Button className={`w-full bg-gradient-to-r ${currentFeature.color} hover:opacity-90`}>
                    Explorar <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="flex-shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}