import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, Flame, Trophy, Users, Zap, Star, 
  Crown, TrendingUp, Target, Heart, Play, Pause, 
  RotateCcw, ChevronRight, X, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const ExampleAvatar = ({ level, size = 60 }) => {
  // Evolución del avatar femenino según el nivel
  const shirtColor = level >= 5 ? '#E91E63' : level >= 3 ? '#9C27B0' : '#7E57C2';
  const hasGlasses = level >= 3;
  const hasCrown = level >= 5;
  const hasWings = level >= 10;
  
  return (
    <div className="relative">
      <svg width={size} height={size * 1.4} viewBox="-15 -10 100 130" className="drop-shadow-xl">
        {/* Sombra */}
        <ellipse cx="35" cy="106" rx="18" ry="4" fill="rgba(0,0,0,0.2)" />
        
        {/* Alas (nivel 10+) */}
        {hasWings && (
          <g>
            <path d="M52 56 Q70 40 80 60 Q70 55 52 66" fill="#e1bee7" opacity="0.9" />
            <path d="M18 56 Q0 40 -10 60 Q0 55 18 66" fill="#e1bee7" opacity="0.9" />
          </g>
        )}
        
        {/* Zapatos */}
        <rect x="20" y="96" width="14" height="6" rx="2" fill="#E91E63" />
        <rect x="36" y="96" width="14" height="6" rx="2" fill="#E91E63" />
        
        {/* Pantalones/Falda */}
        <path d="M20 78 L50 78 L54 98 L16 98 Z" fill="#9C27B0" />
        
        {/* Cuerpo/Vestido */}
        <rect x="20" y="52" width="30" height="28" fill={shirtColor} />
        <rect x="14" y="54" width="8" height="18" fill={shirtColor} />
        <rect x="48" y="54" width="8" height="18" fill={shirtColor} />
        
        {/* Cuello */}
        <ellipse cx="35" cy="50" rx="7" ry="4" fill="#FED6A8" />
        
        {/* Cabeza */}
        <ellipse cx="35" cy="30" rx="18" ry="20" fill="#FED6A8" />
        
        {/* Orejas */}
        <ellipse cx="16" cy="32" rx="4" ry="6" fill="#FED6A8" />
        <ellipse cx="54" cy="32" rx="4" ry="6" fill="#FED6A8" />
        
        {/* Aretes dorados */}
        <circle cx="16" cy="32" r="2" fill="#FFD700" />
        <circle cx="54" cy="32" r="2" fill="#FFD700" />
        
        {/* Mejillas sonrojadas */}
        <ellipse cx="22" cy="36" rx="5" ry="3" fill="#FFCDD2" opacity="0.5" />
        <ellipse cx="48" cy="36" rx="5" ry="3" fill="#FFCDD2" opacity="0.5" />
        
        {/* Ojos grandes (estilo kawaii) */}
        <ellipse cx="27" cy="28" rx="4" ry="4" fill="#1a1a2e" />
        <rect x="25" y="26" width="2" height="2" fill="white" />
        <ellipse cx="43" cy="28" rx="4" ry="4" fill="#1a1a2e" />
        <rect x="41" y="26" width="2" height="2" fill="white" />
        
        {/* Boca sonriente */}
        <rect x="31" y="38" width="2" height="1" fill="#e74c3c" />
        <rect x="33" y="39" width="4" height="1" fill="#e74c3c" />
        <rect x="37" y="38" width="2" height="1" fill="#e74c3c" />
        
        {/* Cabello largo femenino */}
        <rect x="20" y="8" width="30" height="8" fill="#3d2314" />
        <rect x="16" y="14" width="6" height="36" fill="#3d2314" />
        <rect x="48" y="14" width="6" height="36" fill="#3d2314" />
        <rect x="16" y="48" width="8" height="4" fill="#3d2314" />
        <rect x="46" y="48" width="8" height="4" fill="#3d2314" />
        
        {/* Gafas (nivel 3+) */}
        {hasGlasses && (
          <g>
            <rect x="21" y="24" width="10" height="8" rx="1" fill="none" stroke="#E91E63" strokeWidth="2" />
            <rect x="38" y="24" width="10" height="8" rx="1" fill="none" stroke="#E91E63" strokeWidth="2" />
            <rect x="31" y="27" width="7" height="2" fill="#E91E63" />
          </g>
        )}
        
        {/* Corona dorada (nivel 5+) */}
        {hasCrown && (
          <g>
            <rect x="20" y="4" width="30" height="8" fill="#ffd700" />
            <rect x="18" y="8" width="4" height="10" fill="#ffd700" />
            <rect x="48" y="8" width="4" height="10" fill="#ffd700" />
            <rect x="22" y="0" width="4" height="6" fill="#ffd700" />
            <rect x="32" y="-4" width="6" height="10" fill="#ffd700" />
            <rect x="44" y="0" width="4" height="6" fill="#ffd700" />
            <circle cx="35" cy="0" r="3" fill="#E91E63" />
            <circle cx="24" cy="4" r="2" fill="#3B82F6" />
            <circle cx="46" cy="4" r="2" fill="#3B82F6" />
          </g>
        )}
      </svg>
      <motion.div 
        className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs border-2 border-white"
        key={level}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
      >
        {level}
      </motion.div>
    </div>
  );
};

const scenarios = [
  {
    day: 'Día 1',
    title: 'Laura comienza su viaje',
    actions: [
      { type: 'create', text: 'Crea su primer hábito: "Meditar 10 min"', icon: '🧘♀️' },
      { type: 'complete', text: 'Completa su primera meditación', reward: '+10 XP, +5 monedas', icon: '✅' }
    ],
    stats: { level: 1, xp: 10, coins: 5, streak: 1 }
  },
  {
    day: 'Día 7',
    title: 'Primera semana completada',
    actions: [
      { type: 'streak', text: '¡7 días de racha en meditación!', icon: '🔥' },
      { type: 'achievement', text: 'Logro desbloqueado: "Primera Semana"', reward: '+50 monedas', icon: '🏆' },
      { type: 'level', text: '¡Subió al Nivel 2!', icon: '⭐' }
    ],
    stats: { level: 2, xp: 120, coins: 85, streak: 7 }
  },
  {
    day: 'Día 14',
    title: 'Expandiendo hábitos',
    actions: [
      { type: 'create', text: 'Agrega "Leer 20 páginas" y "Ejercicio 30 min"', icon: '📚' },
      { type: 'social', text: 'Se conecta con su amiga Ana', icon: '👥' },
      { type: 'challenge', text: 'Ana la invita al desafío "30 días fit"', icon: '💪' }
    ],
    stats: { level: 3, xp: 280, coins: 165, streak: 14 }
  },
  {
    day: 'Día 30',
    title: 'Transformación visible',
    actions: [
      { type: 'streak', text: '¡30 días de racha! 🔥🔥🔥', icon: '🎉' },
      { type: 'achievement', text: 'Desbloqueó 5 logros diferentes', icon: '🏅' },
      { type: 'social', text: 'En el Top 10 del ranking semanal', icon: '🏆' },
      { type: 'shop', text: 'Compró su primera corona dorada', icon: '👑' }
    ],
    stats: { level: 5, xp: 890, coins: 420, streak: 30 }
  },
  {
    day: 'Día 90',
    title: '¡Vida transformada!',
    actions: [
      { type: 'milestone', text: 'Racha de 90 días - ¡Hábito consolidado!', icon: '🌟' },
      { type: 'achievement', text: 'Placa "Maestro de Hábitos" - Nivel 10', icon: '💎' },
      { type: 'social', text: '15 amigos en la comunidad', icon: '❤️' },
      { type: 'stats', text: 'Mejoró su productividad en 85%', icon: '📊' }
    ],
    stats: { level: 12, xp: 3200, coins: 1850, streak: 90 },
    final: true
  }
];

export default function DemoSimulation({ open, onClose }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentAction, setCurrentAction] = useState(0);

  useEffect(() => {
    if (!open) {
      // Reset when dialog closes
      setCurrentScene(0);
      setCurrentAction(0);
      setIsPlaying(true);
      return;
    }

    if (!isPlaying) return;

    const timer = setTimeout(() => {
      const scene = scenarios[currentScene];
      
      if (currentAction < scene.actions.length - 1) {
        setCurrentAction(currentAction + 1);
      } else if (currentScene < scenarios.length - 1) {
        setCurrentScene(currentScene + 1);
        setCurrentAction(0);
      } else {
        setIsPlaying(false);
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [open, isPlaying, currentScene, currentAction]);

  const handleRestart = () => {
    setCurrentScene(0);
    setCurrentAction(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    const scene = scenarios[currentScene];
    if (currentAction < scene.actions.length - 1) {
      setCurrentAction(currentAction + 1);
    } else if (currentScene < scenarios.length - 1) {
      setCurrentScene(currentScene + 1);
      setCurrentAction(0);
    }
  };

  if (!open) return null;

  const scene = scenarios[currentScene] || scenarios[0];
  const visibleActions = scene?.actions?.slice(0, currentAction + 1) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-4 sm:p-6 text-white">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Historia de Laura: 90 días de transformación</h2>
          <p className="text-sm sm:text-base text-purple-100">Mira cómo Habalyze cambió su vida paso a paso</p>
          
          <div className="flex items-center gap-2 mt-4">
            {scenarios.map((s, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < currentScene ? 'bg-white' :
                  i === currentScene ? 'bg-white/60' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left: Timeline */}
            <div>
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                    {scene.day.split(' ')[1]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{scene.title}</h3>
                    <p className="text-sm text-gray-500">{scene.day}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {visibleActions.map((action, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white border-2 border-purple-100 rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{action.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{action.text}</p>
                            {action.reward && (
                              <p className="text-sm text-green-600 font-semibold mt-1">
                                {action.reward}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {scene.final && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center"
                >
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">¡Vida Transformada!</h3>
                  <p className="text-green-700">
                    Laura ahora medita diariamente, lee 2 libros al mes, hace ejercicio 4x semana y tiene una comunidad que la motiva.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right: Stats Dashboard */}
            <div className="space-y-4">
              <motion.div
                key={`avatar-${currentScene}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex justify-center"
              >
                <ExampleAvatar level={scene.stats.level} size={100} />
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  key={`level-${scene.stats.level}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 border-2 border-amber-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <span className="text-xs text-amber-700 font-medium">Nivel</span>
                  </div>
                  <p className="text-3xl font-black text-amber-600">{scene.stats.level}</p>
                </motion.div>

                <motion.div
                  key={`streak-${scene.stats.streak}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-4 border-2 border-orange-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <span className="text-xs text-orange-700 font-medium">Racha</span>
                  </div>
                  <p className="text-3xl font-black text-orange-600">{scene.stats.streak}</p>
                </motion.div>

                <motion.div
                  key={`xp-${scene.stats.xp}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="text-xs text-purple-700 font-medium">XP Total</span>
                  </div>
                  <p className="text-2xl font-black text-purple-600">{scene.stats.xp.toLocaleString()}</p>
                </motion.div>

                <motion.div
                  key={`coins-${scene.stats.coins}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-4 border-2 border-yellow-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💰</span>
                    <span className="text-xs text-amber-700 font-medium">Monedas</span>
                  </div>
                  <p className="text-2xl font-black text-amber-600">{scene.stats.coins}</p>
                </motion.div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  Progreso de Hábitos
                </h4>
                <div className="space-y-3">
                  {[
                    { name: '🧘♀️ Meditar', progress: Math.min(100, (scene.stats.streak / 30) * 100) },
                    currentScene >= 2 && { name: '📚 Leer', progress: Math.min(100, ((scene.stats.streak - 14) / 30) * 100) },
                    currentScene >= 2 && { name: '🏃♀️ Ejercicio', progress: Math.min(100, ((scene.stats.streak - 14) / 30) * 100) },
                  ].filter(Boolean).map((habit, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{habit.name}</span>
                        <span className="font-bold text-purple-600">{Math.round(habit.progress)}%</span>
                      </div>
                      <Progress value={habit.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {currentScene >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-4"
                >
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Comunidad
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs">👩</div>
                      <span className="text-gray-700">Ana completó su reto</span>
                    </div>
                    {currentScene >= 3 && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs">👨</div>
                        <span className="text-gray-700">Pedro se unió al desafío</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
            
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant="outline"
              size="sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Continuar
                </>
              )}
            </Button>

            {!isPlaying && !scene?.final && currentScene < scenarios.length - 1 && (
              <Button
                onClick={handleNext}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {scene?.final && (
              <Button
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    const signupBtn = document.querySelector('[data-signup-btn]');
                    if (signupBtn) signupBtn.click();
                  }, 100);
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500"
              >
                ¡Quiero empezar! <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Escena {currentScene + 1} de {scenarios.length} • 
              Acción {currentAction + 1} de {scene?.actions?.length || 0}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}