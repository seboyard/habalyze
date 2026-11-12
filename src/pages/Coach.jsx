import { db } from '@/api/base44Client';
import React, { useState, useEffect, useRef } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, Sparkles, Loader2, MessageCircle, ArrowLeft, Crown, Lock, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import MessageBubble from '../components/coach/MessageBubble';
import InsightsPanel from '../components/coach/InsightsPanel';

import { FREE_DAILY_LIMIT } from '@/lib/coachUsage';

const TRIAL_DAYS = 7;

export default function CoachPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyMessages, setDailyMessages] = useState(0);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const isPremium = currentUser?.is_premium && currentUser?.premium_until && new Date(currentUser.premium_until) > new Date();
  const canSendMessage = isPremium || dailyMessages < FREE_DAILY_LIMIT;

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
      
      // Load daily message count from localStorage
      const today = new Date().toDateString();
      const stored = localStorage.getItem('coach_messages_date');
      if (stored === today) {
        setDailyMessages(parseInt(localStorage.getItem('coach_messages_count') || '0'));
      } else {
        localStorage.setItem('coach_messages_date', today);
        localStorage.setItem('coach_messages_count', '0');
        setDailyMessages(0);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const initConversation = async () => {
      if (!currentUser) return;

      const conversations = await db.agents.listConversations({
        agent_name: 'habit_coach'
      });

      if (conversations && conversations.length > 0) {
        const conv = conversations[0];
        setConversation(conv);
        setMessages(conv.messages || []);
      } else {
        const newConv = await db.agents.createConversation({
          agent_name: 'habit_coach',
          metadata: {
            name: 'Coach Personal',
            description: 'Conversación con tu coach de hábitos',
            user_email: currentUser.email
          }
        });
        setConversation(newConv);
        setMessages(newConv.messages || []);
      }
    };

    initConversation();
  }, [currentUser]);

  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = db.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || isLoading) return;

    if (!canSendMessage) {
      toast.error('Límite diario alcanzado', {
        description: 'Suscríbete a Premium para mensajes ilimitados',
        action: {
          label: 'Ver Premium',
          onClick: () => navigate(createPageUrl('Premium'))
        }
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Increment daily counter for free users
    if (!isPremium) {
      const newCount = dailyMessages + 1;
      setDailyMessages(newCount);
      localStorage.setItem('coach_messages_count', newCount.toString());
    }

    try {
      await db.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
      
      // Invalidate all queries to refresh data after AI actions
      setTimeout(() => {
        queryClient.invalidateQueries(['own-projects']);
        queryClient.invalidateQueries(['collab-projects']);
        queryClient.invalidateQueries(['project-tasks']);
        queryClient.invalidateQueries(['habits']);
        queryClient.invalidateQueries(['active-projects']);
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickMessage = (text) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const starterPrompts = [
    { text: '📊 Analiza mi progreso', category: 'habits' },
    { text: '💪 Sugiere hábitos para mi', category: 'habits' },
    { text: '✨ Transforma mi hábito de ejercicio', category: 'habits' },
    { text: '🗑️ Eliminar un hábito que ya no sirve', category: 'habits' },
    { text: '🔥 ¿Cómo mejorar mis rachas?', category: 'habits' },
    { text: '🔁 Restaurar un hábito eliminado', category: 'habits' },
    { text: '🎯 Crear un nuevo proyecto', category: 'projects' },
    { text: '📋 Ver mis proyectos activos', category: 'projects' },
    { text: '⚠️ ¿Qué proyecto necesita más atención?', category: 'projects' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-8 pb-32">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" className="mb-3 md:mb-4 hover:bg-purple-100" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Brain className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Coach Personal
                  </h1>
                  {isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                      <Crown className="w-3 h-3 mr-1" /> Premium
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Tu asistente inteligente de hábitos</p>
              </div>
            </div>
            
            {!isPremium && (
              <Link to={createPageUrl('Premium')} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm" size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium
                </Button>
              </Link>
            )}
          </div>
          
          {/* Message counter for free users */}
          {!isPremium && (
            <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-purple-700 truncate">
                    Mensajes: <span className="font-bold">{dailyMessages}/{FREE_DAILY_LIMIT}</span>
                  </span>
                </div>
                <Link to={createPageUrl('Premium')}>
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 text-xs h-7 px-2">
                    <Sparkles className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Ilimitados</span>
                  </Button>
                </Link>
              </div>
              <div className="mt-2 bg-purple-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(dailyMessages / FREE_DAILY_LIMIT) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Free trial banner */}
          {!isPremium && !currentUser?.has_used_trial && dailyMessages >= FREE_DAILY_LIMIT - 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 sm:p-4 border-2 border-emerald-200"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-emerald-700 text-sm sm:text-base">🎁 ¡Prueba Premium GRATIS!</p>
                  <p className="text-xs sm:text-sm text-emerald-600">{TRIAL_DAYS} días de mensajes ilimitados</p>
                </div>
                <Link to={createPageUrl('Premium')} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm" size="sm">
                    Probar Gratis
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Insights Panel */}
        {currentUser && messages.length > 0 && (
          <InsightsPanel 
            user={currentUser} 
            onSendMessage={(text) => {
              setInput(text);
              setTimeout(() => handleSend(), 100);
            }} 
          />
        )}

        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden">
          <div className="h-[55vh] sm:h-[60vh] overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-4 sm:py-6 md:py-8 px-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-3 sm:mb-4"
                >
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">¡Hola, {currentUser?.full_name?.split(' ')[0]}! 👋</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 max-w-xl mx-auto px-2">
                  Soy tu <span className="text-purple-600 font-semibold">Coach Personal con IA</span>. 
                  Analizo tus patrones, sugiero hábitos personalizados y te ayudo a alcanzar tus metas.
                </p>
                
                {/* Intro creativo */}
                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 mx-auto max-w-2xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-2 sm:mb-3 flex items-center justify-center gap-2 text-sm sm:text-base">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                    ¿Cómo puedo ayudarte?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left">
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-purple-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 mb-0.5 sm:mb-1">📊 Análisis de patrones</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Analizo tus hábitos y rachas para darte insights personalizados.</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-pink-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 mb-0.5 sm:mb-1">💡 Sugerencias inteligentes</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Sugiero nuevos hábitos perfectos para ti.</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-blue-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 mb-0.5 sm:mb-1">🔥 Motivación proactiva</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Estrategias para mantener tus rachas.</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-green-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 mb-0.5 sm:mb-1">🎯 Proyectos personalizados</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Creo proyectos adaptados a tu rutina.</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-red-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 mb-0.5 sm:mb-1">🗑️ Eliminar con respaldo</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Borro hábitos y guardo respaldo para restaurarlos.</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-purple-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 mb-0.5 sm:mb-1">✨ Corregir y transformar</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Modifico hábitos sin perder tu historial.</p>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-purple-600 mt-2 sm:mt-4 font-medium text-center">
                    💬 Tip: Cuanto más detallado seas, mejor te puedo ayudar
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Elige una opción rápida:</p>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-purple-600 mb-1.5 sm:mb-2">📊 Hábitos</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                      {starterPrompts.filter(p => p.category === 'habits').map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(prompt.text)}
                          className="border-2 border-purple-200 hover:bg-purple-50 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                        >
                          {prompt.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-violet-600 mb-1.5 sm:mb-2">🎯 Proyectos</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                      {starterPrompts.filter(p => p.category === 'projects').map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(prompt.text)}
                          className="border-2 border-violet-200 hover:bg-violet-50 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                        >
                          {prompt.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div className="bg-white border-2 border-purple-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">Pensando...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t-2 border-purple-200 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50">
            {!canSendMessage ? (
              <div className="text-center py-3 sm:py-4">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm sm:text-base text-gray-600 font-medium mb-2">Has alcanzado el límite diario</p>
                <Link to={createPageUrl('Premium')} className="w-full sm:w-auto inline-block">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-sm">
                    <Crown className="w-4 h-4 mr-2" />
                    Desbloquear ilimitados
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    className="min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none border-2 border-purple-200 focus:border-purple-400 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 sm:px-6 flex-shrink-0"
                    size="sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
                {messages.length === 0 && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-2 text-center">
                    <span className="hidden sm:inline">Presiona Enter para enviar • Shift + Enter para nueva línea</span>
                    <span className="sm:hidden">Enter = enviar</span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}