import { db } from '@/api/base44Client';
import React, { useState, useEffect, useRef } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PixelAvatar from '../avatar/PixelAvatar';

export default function FriendChat({ friend, currentUser, onClose }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const conversationId = [currentUser.email, friend.email].sort().join('_');

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: () => db.entities.ChatMessage.filter({ conversation_id: conversationId }, 'created_date', 100),
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageText) => db.entities.ChatMessage.create({
      conversation_id: conversationId,
      sender_email: currentUser.email,
      receiver_email: friend.email,
      message: messageText,
      is_read: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages', conversationId]);
      setMessage('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marcar mensajes como leídos
  useEffect(() => {
    const unreadMessages = messages.filter(m => m.receiver_email === currentUser.email && !m.is_read);
    unreadMessages.forEach(m => {
      db.entities.ChatMessage.update(m.id, { is_read: true });
    });
  }, [messages, currentUser.email]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border-2 border-violet-200 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <PixelAvatar user={friend} size="small" showLevel={false} />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm truncate">{friend.full_name}</p>
          <p className="text-violet-200 text-xs">Nivel {friend.level || 1}</p>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Inicia la conversación</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_email === currentUser.email;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  isMe 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-sm' 
                    : 'bg-white text-gray-800 shadow border rounded-bl-sm'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-violet-200' : 'text-gray-400'}`}>
                    {format(new Date(msg.created_date), 'HH:mm', { locale: es })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t bg-white flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 text-sm"
        />
        <Button type="submit" size="icon" disabled={!message.trim()} className="bg-violet-600 hover:bg-violet-700">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </motion.div>
  );
}