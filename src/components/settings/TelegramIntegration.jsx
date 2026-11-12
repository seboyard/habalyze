import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageSquare, Link as LinkIcon, Unlink, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function TelegramIntegration({ user, onUpdate }) {
  const [chatId, setChatId] = useState('');
  const [username, setUsername] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const isLinked = !!user?.linked_accounts?.telegram;
  const telegramData = user?.linked_accounts?.telegram;

  const handleLink = async () => {
    if (!chatId.trim()) {
      toast.error('Por favor ingresa tu Chat ID de Telegram');
      return;
    }

    setIsLinking(true);
    try {
      const response = await db.functions.invoke('linkTelegramAccount', {
        telegram_chat_id: chatId.trim(),
        telegram_username: username.trim() || null
      });

      if (response.data.success) {
        toast.success('¡Telegram conectado exitosamente!', {
          description: 'Ahora recibirás notificaciones importantes'
        });
        setChatId('');
        setUsername('');
        if (onUpdate) onUpdate();
      } else {
        toast.error('Error al conectar', {
          description: response.data.error || 'Intenta de nuevo'
        });
      }
    } catch (error) {
      toast.error('Error al conectar Telegram', {
        description: error.message
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('¿Deseas desconectar tu cuenta de Telegram? Ya no recibirás notificaciones.')) {
      return;
    }

    setIsUnlinking(true);
    try {
      const response = await db.functions.invoke('unlinkTelegramAccount');

      if (response.data.success) {
        toast.success('Telegram desconectado');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error('Error al desconectar', {
        description: error.message
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">Notificaciones por Telegram</h3>
          <p className="text-sm text-gray-600">
            Recibe alertas importantes directamente en tu Telegram
          </p>
        </div>
      </div>

      {isLinked ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Cuenta conectada</span>
            </div>
            {telegramData?.username && (
              <p className="text-sm text-green-700">
                Usuario: @{telegramData.username}
              </p>
            )}
            <p className="text-xs text-green-600 mt-1">
              Conectado el {new Date(telegramData?.linked_date).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Recibirás notificaciones de:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>🏆 Logros desbloqueados</li>
              <li>🔥 Rachas alcanzadas</li>
              <li>⏰ Recordatorios diarios</li>
              <li>📋 Actualizaciones de proyectos</li>
              <li>⭐ Subidas de nivel</li>
            </ul>
          </div>

          <Button
            onClick={handleUnlink}
            disabled={isUnlinking}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
          >
            <Unlink className="w-4 h-4 mr-2" />
            {isUnlinking ? 'Desconectando...' : 'Desconectar Telegram'}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800 mb-2">Pasos para conectar:</p>
                <ol className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-5">1.</span>
                    <span>Haz clic en el botón de abajo para abrir el bot de Habalyze en Telegram</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-5">2.</span>
                    <span>Envía <code className="bg-blue-100 px-1 rounded">/start</code> o <code className="bg-blue-100 px-1 rounded">/id</code> al bot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-5">3.</span>
                    <span>El bot te responderá con tu Chat ID automáticamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-5">4.</span>
                    <span>Copia el número y pégalo aquí abajo</span>
                  </li>
                </ol>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <a
                href="https://t.me/HabalyzeBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Abrir @HabalyzeBot
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => copyToClipboard('/start')}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <Copy className="w-4 h-4" />
                Copiar /start
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chat ID de Telegram *
              </label>
              <Input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="123456789"
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu usuario de Telegram (opcional)
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@tu_usuario"
              />
            </div>

            <Button
              onClick={handleLink}
              disabled={isLinking || !chatId.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              {isLinking ? 'Conectando...' : 'Conectar Telegram'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}