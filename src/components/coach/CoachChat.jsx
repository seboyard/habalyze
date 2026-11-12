import { db } from '@/api/base44Client';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Crown, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { FREE_DAILY_LIMIT, getDailyUsage, incrementDailyUsage } from '@/lib/coachUsage';

const QUICK_PROMPTS = [
  '📊 Analiza mi progreso',
  '💪 Sugiere un hábito para mí',
  '🔥 ¿Cómo no romper mi racha?',
];

export default function CoachChat({ user }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const endRef = useRef(null);

  const isPremium = !!(user?.is_premium && user?.premium_until && new Date(user.premium_until) > new Date());
  const canSend = isPremium || usage < FREE_DAILY_LIMIT;

  useEffect(() => {
    setUsage(getDailyUsage());
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    (async () => {
      const conversations = await db.agents.listConversations({ agent_name: 'habit_coach' });
      if (!active) return;
      if (conversations && conversations.length > 0) {
        setConversation(conversations[0]);
        setMessages(conversations[0].messages || []);
      } else {
        const created = await db.agents.createConversation({
          agent_name: 'habit_coach',
          metadata: {
            name: 'Coach Personal',
            description: 'Conversación con tu coach de hábitos',
            user_email: user.email,
          },
        });
        if (!active) return;
        setConversation(created);
        setMessages(created.messages || []);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const conversationId = conversation?.id;

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = db.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value || !conversation || isLoading || !canSend) return;
    setInput('');
    setIsLoading(true);
    if (!isPremium) setUsage(incrementDailyUsage());
    try {
      await db.agents.addMessage(conversation, { role: 'user', content: value });
    } catch (error) {
      setIsLoading(false);
      toast.error('No se pudo enviar el mensaje. Intenta de nuevo.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const visibleMessages = messages.filter((m) => m.role === 'user' || m.role === 'assistant');

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[180px]">
        {visibleMessages.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-3">
              Hola {user?.full_name?.split(' ')[0] || ''} 👋 ¿De qué hablamos hoy?
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  disabled={!canSend}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug whitespace-pre-wrap ${
                  isUser
                    ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
              <span className="text-xs text-gray-600">Pensando...</span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="border-t border-gray-100 p-3">
        {!canSend ? (
          <div className="text-center py-1">
            <p className="text-xs text-gray-600 mb-2 flex items-center justify-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Límite diario alcanzado ({FREE_DAILY_LIMIT} mensajes)
            </p>
            <Link to="/Premium">
              <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <Crown className="w-3.5 h-3.5 mr-1.5" />
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
                onKeyDown={handleKeyDown}
                placeholder="Escribe a tu coach..."
                className="min-h-[44px] max-h-[90px] resize-none border-violet-200 focus:border-violet-400 text-sm"
                disabled={!conversation || isLoading}
              />
              <Button
                onClick={() => send()}
                disabled={!input.trim() || !conversation || isLoading}
                className="bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 px-3 flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            {!isPremium && (
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                {FREE_DAILY_LIMIT - usage} mensajes gratis restantes hoy
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}