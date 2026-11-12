import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, Award, Trophy, Target, Users, Zap, Crown, 
  Gift, Sparkles, TrendingUp, ArrowLeft, Calendar,
  FolderKanban, Brain, Store, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function DocumentationPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await db.auth.me();
        setUser(currentUser);
      } catch (e) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges-docs'],
    queryFn: () => db.entities.Badge.list(),
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['all-achievements-docs'],
    queryFn: () => db.entities.Achievement.list(),
  });

  const badgesByCategory = allBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {});

  const achievementsByCategory = allAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  const categoryLabels = {
    social: 'Social',
    habits: 'Hábitos',
    projects: 'Proyectos',
    streaks: 'Rachas',
    special: 'Especial',
    events: 'Eventos',
    challenges: 'Desafíos'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 pb-24">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <Link to={createPageUrl('Landing')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Book className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Documentación
            </h1>
            <p className="text-gray-600">Guía completa de Habalyze</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="overview">
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </TabsTrigger>
            <TabsTrigger value="features">
              <Sparkles className="w-4 h-4 mr-2" />
              Funciones
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="w-4 h-4 mr-2" />
              Placas
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="w-4 h-4 mr-2" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="economy">
              <Zap className="w-4 h-4 mr-2" />
              Economía
            </TabsTrigger>
            <TabsTrigger value="tips">
              <Brain className="w-4 h-4 mr-2" />
              Tips
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Bienvenido a Habalyze
              </h2>
              <p className="text-gray-600 mb-4">
                Habalyze es una plataforma gamificada para construir y mantener hábitos saludables. 
                Transforma tu rutina diaria en una aventura épica con recompensas, logros y un sistema social.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Target className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-bold">Hábitos</h3>
                  <p className="text-sm text-gray-600">Crea y sigue tus rutinas diarias</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-bold">Progreso</h3>
                  <p className="text-sm text-gray-600">Visualiza tu evolución con estadísticas</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Users className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-bold">Social</h3>
                  <p className="text-sm text-gray-600">Compite y colabora con amigos</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Sistema de Niveles y XP</h2>
              <p className="text-gray-600 mb-4">
                Ganas experiencia (XP) completando hábitos. Cada 100 XP subes de nivel.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Completar un hábito</span>
                  <Badge className="bg-green-500">+10-50 XP</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Racha de 7 días</span>
                  <Badge className="bg-orange-500">Bonus +20 XP</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Racha de 30 días</span>
                  <Badge className="bg-red-500">Bonus +50 XP</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Completar proyecto</span>
                  <Badge className="bg-purple-500">+100 XP</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
              <p className="text-gray-600">
                Tu pantalla principal donde ves todos tus hábitos del día. Toca cada hábito para marcarlo como completado y ganar recompensas.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FolderKanban className="w-6 h-6 text-violet-600" />
                Proyectos
              </h2>
              <p className="text-gray-600 mb-4">
                Define objetivos grandes y la IA te generará un plan de tareas progresivo. Perfecto para metas a largo plazo.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Generación automática de tareas con IA</li>
                <li>• Vista Kanban, Timeline y Gantt</li>
                <li>• Colaboración con amigos</li>
                <li>• Modo avanzado con asignaciones</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                Coach IA
              </h2>
              <p className="text-gray-600">
                Tu asistente personal inteligente que analiza tu progreso y te da consejos personalizados. Disponible 24/7 para motivarte y guiarte.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Store className="w-6 h-6 text-pink-600" />
                Tienda y Avatar
              </h2>
              <p className="text-gray-600 mb-4">
                Usa las monedas que ganas para personalizar tu avatar pixel art con más de 200 accesorios.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Estilos de cabello y colores</li>
                <li>• Ropa y accesorios</li>
                <li>• Mascotas y efectos especiales</li>
                <li>• Items exclusivos por logros</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                Social
              </h2>
              <p className="text-gray-600 mb-4">
                Conecta con amigos, compite en rankings y participa en desafíos.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Sistema de amigos</li>
                <li>• Feed de actividades</li>
                <li>• Ranking semanal</li>
                <li>• Desafíos colaborativos y competitivos</li>
                <li>• Chat privado</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Misiones y Battle Pass</h2>
              <p className="text-gray-600 mb-4">
                Completa misiones diarias, semanales y especiales para ganar recompensas extra.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Misiones diarias: Refrescan cada 24h</li>
                <li>• Misiones semanales: Objetivos más grandes</li>
                <li>• Sagas: Cadenas de misiones con historia</li>
                <li>• Battle Pass: Temporadas con recompensas exclusivas</li>
              </ul>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                Sistema de Placas
              </h2>
              <p className="text-gray-600 mb-4">
                Las placas son reconocimientos que se actualizan automáticamente según tu progreso. Cada placa tiene múltiples niveles.
              </p>
            </Card>

            {Object.entries(badgesByCategory).map(([category, badges]) => (
              <Card key={category} className="p-6">
                <h3 className="text-xl font-bold mb-4">{categoryLabels[category] || category}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {badges.map(badge => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border-2 border-purple-100 rounded-xl hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{badge.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{badge.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">{badge.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-purple-600">Niveles:</p>
                            {badge.levels?.map((level, i) => (
                              <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">Nivel {level.level}</Badge>
                                <span>{level.requirement_value} {badge.requirement_type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-600" />
                Sistema de Logros
              </h2>
              <p className="text-gray-600 mb-4">
                Los logros son objetivos únicos que desbloqueas una sola vez. Te dan grandes recompensas.
              </p>
            </Card>

            {Object.entries(achievementsByCategory).map(([category, achievements]) => (
              <Card key={category} className="p-6">
                <h3 className="text-xl font-bold mb-4">{categoryLabels[category] || category}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map(achievement => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border-2 border-amber-100 rounded-xl hover:border-amber-300 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800">{achievement.title}</h4>
                            <Badge className={`text-xs ${
                              achievement.rarity === 'legendary' ? 'bg-amber-500' :
                              achievement.rarity === 'epic' ? 'bg-purple-500' :
                              achievement.rarity === 'rare' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-amber-600">💰 {achievement.reward_coins} monedas</span>
                            <span className="text-purple-600">⚡ {achievement.reward_xp} XP</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Requisito: {achievement.requirement_value} {achievement.requirement_type}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Economy Tab */}
          <TabsContent value="economy" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Economía del Juego</h2>
              <p className="text-gray-600 mb-4">
                Habalyze tiene dos monedas principales: Monedas (💰) y Gemas (💎).
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">💰 Monedas</h3>
              <p className="text-gray-600 mb-4">Se ganan completando hábitos y misiones. Úsalas para:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Items de la tienda</span>
                  <span className="text-amber-600 font-bold">50-500 💰</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Cajas sorpresa</span>
                  <span className="text-amber-600 font-bold">100 💰</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Items épicos</span>
                  <span className="text-amber-600 font-bold">1000+ 💰</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">💎 Gemas</h3>
              <p className="text-gray-600 mb-4">Moneda premium. Se obtienen:</p>
              <ul className="space-y-2 text-gray-600">
                <li>• Subiendo de nivel (1 gema cada 5 niveles)</li>
                <li>• Logros legendarios</li>
                <li>• Eventos especiales</li>
                <li>• Compra con dinero real</li>
              </ul>
              <p className="text-gray-600 mt-4">Úsalas para items exclusivos y beneficios premium.</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Sistema de Rachas</h3>
              <p className="text-gray-600 mb-4">
                Mantén tus hábitos consecutivamente para multiplicar recompensas:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span>7 días de racha</span>
                  <Badge className="bg-orange-500">+50 monedas bonus</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span>14 días de racha</span>
                  <Badge className="bg-orange-600">+100 monedas bonus</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span>30 días de racha</span>
                  <Badge className="bg-red-500">+250 monedas bonus</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-300">
                  <span>100 días de racha</span>
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500">+1000 monedas + Item exclusivo</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                Tips Pro
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                  <h3 className="font-bold mb-2">🎯 Empieza pequeño</h3>
                  <p className="text-gray-600">No te sobrecargues. 2-3 hábitos simples son perfectos para empezar. La consistencia es más importante que la cantidad.</p>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                  <h3 className="font-bold mb-2">⏰ Programa horarios</h3>
                  <p className="text-gray-600">Asocia tus hábitos a horas específicas del día. Esto crea rutinas automáticas y aumenta tu tasa de éxito.</p>
                </div>

                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                  <h3 className="font-bold mb-2">🔥 Protege tus rachas</h3>
                  <p className="text-gray-600">Las rachas son tu activo más valioso. Una racha de 30 días vale 10x más que 30 días aleatorios.</p>
                </div>

                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                  <h3 className="font-bold mb-2">👥 Usa el poder social</h3>
                  <p className="text-gray-600">Agrega amigos y únete a desafíos. La competencia amistosa te mantiene motivado.</p>
                </div>

                <div className="p-4 bg-pink-50 border-l-4 border-pink-500 rounded-r-lg">
                  <h3 className="font-bold mb-2">📊 Revisa estadísticas</h3>
                  <p className="text-gray-600">Analiza tus patrones semanalmente. Identifica qué funciona y qué no para optimizar.</p>
                </div>

                <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                  <h3 className="font-bold mb-2">🤖 Habla con tu Coach</h3>
                  <p className="text-gray-600">El Coach IA analiza TUS datos específicos. Úsalo cuando necesites motivación o consejos personalizados.</p>
                </div>

                <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                  <h3 className="font-bold mb-2">🎯 Proyectos para grandes metas</h3>
                  <p className="text-gray-600">Si tienes un objetivo grande (ej: correr un maratón), usa Proyectos. La IA te creará un plan paso a paso.</p>
                </div>

                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <h3 className="font-bold mb-2">💰 Invierte sabiamente</h3>
                  <p className="text-gray-600">Guarda monedas para items épicos en lugar de gastarlas en todo. Los items raros valen la espera.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}