import { db } from '@/api/base44Client';
import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Brain, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '../coach/MessageBubble';

export default function ProjectChat({ project, user, onRefresh }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initConversation = async () => {
      try {
        setIsInitializing(true);
        const existingConvos = await db.agents.listConversations({
          agent_name: 'habit_coach'
        });

        const projectConvo = existingConvos.find(c => 
          c.metadata?.project_id === project.id
        );

        if (projectConvo) {
          setConversation(projectConvo);
          setMessages(projectConvo.messages || []);
        } else {
          const newConvo = await db.agents.createConversation({
            agent_name: 'habit_coach',
            metadata: {
              project_id: project.id,
              project_name: project.name,
              context: 'project_chat',
              user_email: user?.email
            }
          });
          setConversation(newConvo);
          setMessages(newConvo.messages || []);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    if (project) {
      initConversation();
    }
  }, [project]);

  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = db.agents.subscribeToConversation(
      conversation.id,
      (data) => {
        setMessages(data.messages);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversation]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      await db.agents.addMessage(conversation, {
        role: 'user',
        content: `${userMessage}\n\nContexto: Estoy trabajando en el proyecto "${project.name}" (ID: ${project.id}). ${project.description ? `Descripción: ${project.description}` : ''}`
      });

      // Refresh after AI processes the message
      if (onRefresh) {
        setTimeout(() => onRefresh(), 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-xl">
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">
              Pregúntame sobre el proyecto, añade tareas o vincula hábitos
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                '¿Cómo va mi progreso?',
                'Añade una tarea',
                'Dame consejos'
              ].map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => handleSend(), 100);
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-500"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Coach IA escribiendo...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4 rounded-b-xl">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe tu mensaje al Coach IA..."
            className="resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}