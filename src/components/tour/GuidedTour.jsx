import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

const tourSteps = [
  {
    target: 'dashboard',
    title: '¡Bienvenido a Habalyze!',
    description: 'Este es tu Dashboard central. Aquí verás tus hábitos diarios, progreso y acceso rápido a todas las funcionalidades.',
    icon: '🏠',
    details: 'El Dashboard se actualiza en tiempo real con tu progreso diario'
  },
  {
    target: 'habits',
    title: 'Sistema de Hábitos',
    description: 'Crea y rastrea hábitos con frecuencias personalizadas. Gana XP, monedas y mantén rachas épicas.',
    icon: '✅',
    details: 'Los hábitos similares se agrupan automáticamente para mejor organización'
  },
  {
    target: 'projects',
    title: 'Proyectos y Tareas',
    description: 'Organiza objetivos grandes en proyectos con tareas, dependencias y múltiples vistas (Kanban, Gantt, Timeline).',
    icon: '📋',
    details: 'Colabora con amigos y usa el asistente IA para generar tareas'
  },
  {
    target: 'social',
    title: 'Red Social Motivadora',
    description: 'Conecta con amigos, compite en rankings semanales, únete a desafíos y comparte logros.',
    icon: '👥',
    details: 'El progreso es más divertido y sostenible en comunidad'
  },
  {
    target: 'coach',
    title: 'Coach IA Personal',
    description: 'Tu asistente inteligente analiza tu progreso y te da consejos personalizados. Premium: mensajes ilimitados.',
    icon: '🧠',
    details: 'El Coach aprende de tus patrones y sugiere mejoras proactivamente'
  },
  {
    target: 'gamification',
    title: 'Gamificación Total',
    description: 'Sistema completo con niveles, XP, monedas, logros, placas, avatar personalizable y pase de batalla.',
    icon: '🎮',
    details: 'Cada acción te recompensa y te acerca a nuevos objetivos'
  },
  {
    target: 'statistics',
    title: 'Análisis Avanzado',
    description: 'Dashboards personalizables con 13+ tipos de gráficos. Visualiza patrones y optimiza tu progreso.',
    icon: '📊',
    details: 'Crea vistas personalizadas arrastrando componentes'
  },
  {
    target: 'complete',
    title: '¡Listo para Conquistar!',
    description: 'Ya conoces todo lo que Habalyze ofrece. ¡Completa tu primer hábito y comienza tu transformación!',
    icon: '🚀',
    details: 'Usa la guía de "Inicio Rápido" para seguir los primeros pasos'
  }
];

export default function GuidedTour({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-white relative">
              <button
                onClick={handleSkip}
                className="absolute top-2 right-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Progress dots */}
              <div className="flex justify-center gap-1 mb-4">
                {tourSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep ? 'bg-white w-6' : i < currentStep ? 'bg-white/80' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-6xl text-center mb-3"
              >
                {step.icon}
              </motion.div>
              
              <h2 className="text-xl font-bold text-center">{step.title}</h2>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-gray-700 text-center mb-3 leading-relaxed">
                  {step.description}
                </p>
                {step.details && (
                  <p className="text-sm text-gray-500 text-center mb-6 italic">
                    💡 {step.details}
                  </p>
                )}
              </motion.div>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600"
                >
                  {isLastStep ? (
                    <>
                      ¡Comenzar! <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Siguiente <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              
              {/* Skip link */}
              <button
                onClick={handleSkip}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
              >
                Saltar tutorial
              </button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}