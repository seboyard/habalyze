import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ExternalLink, Brain, Sparkles, CheckCircle2, Wifi, WifiOff, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function WhatsAppIntegration({ user }) {
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const capabilities = [
    { emoji: '✅', text: 'Marcar hábitos como completados' },
    { emoji: '⏩', text: 'Posponer o reportar un hábito' },
    { emoji: '📊', text: 'Ver tu rendimiento semanal' },
    { emoji: '⏰', text: 'Recordatorios personalizados' },
    { emoji: '🎯', text: 'Crear nuevos hábitos desde WhatsApp' },
    { emoji: '🧠', text: 'Consejos inteligentes del Coach IA' },
  ];

  useEffect(() => {
    initWhatsApp();
  }, []);

  const initWhatsApp = async () => {
    setIsLoading(true);
    try {
      const url = db.agents.getWhatsAppConnectURL('habit_coach');
      setWhatsappUrl(url);
      // Check connection status via user preferences
      if (user?.whatsapp_connected) {
        setIsConnected(true);
      }
    } catch (e) {
      console.error('Error initializing WhatsApp:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    if (!whatsappUrl) return;
    const popup = window.open(whatsappUrl, '_blank');
    // Poll for when user returns
    const timer = setInterval(async () => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        // Give it a moment then check connection
        setTimeout(() => checkConnection(), 2000);
      }
    }, 500);
  };

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Re-fetch user to check if whatsapp_connected was set
      const updatedUser = await db.auth.me();
      if (updatedUser?.whatsapp_connected) {
        setIsConnected(true);
        toast.success('¡WhatsApp conectado! Ya puedes usar tu coach 🎉');
      } else {
        toast.info('Aún no detectamos la conexión. ¿Enviaste el mensaje de WhatsApp?');
      }
    } catch (e) {
      // Silent
    } finally {
      setIsChecking(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(whatsappUrl);
    toast.success('Enlace copiado al portapapeles');
  };

  return (
    <Card className="p-6 border-2 border-green-100 bg-gradient-to-br from-white to-green-50/30">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          {isConnected && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-800">Coach Habalyze en WhatsApp</h3>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Wifi className="w-3 h-3 mr-1" /> Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                <WifiOff className="w-3 h-3 mr-1" /> Sin conectar
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Gestiona tus hábitos, recibe recordatorios y análisis directo en WhatsApp
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isConnected ? (
          /* ── CONNECTED STATE ── */
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <p className="font-semibold text-green-800">¡Tu coach está activo en WhatsApp!</p>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Puedes escribirle directamente para gestionar tus hábitos, pedir análisis o recibir motivación.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.slice(0, 4).map((cap, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-green-700">
                    <span>{cap.emoji}</span><span>{cap.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-100">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Abrir WhatsApp
                    <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
                  </Button>
                </a>
              </motion.div>
              <Button variant="outline" size="icon" onClick={copyLink} className="rounded-xl">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ── NOT CONNECTED STATE ── */
          <motion.div
            key="not-connected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* How it works */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" /> ¿Qué puedes hacer desde WhatsApp?
              </p>
              <ul className="grid grid-cols-1 gap-1.5">
                {capabilities.map((cap, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-green-700">
                    <span>{cap.emoji}</span>
                    <span>{cap.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold text-blue-800 mb-3">📋 Cómo conectar (2 pasos)</p>
              <ol className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-blue-700">
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">1</span>
                  <span>Toca el botón de abajo — te abrirá WhatsApp con un mensaje listo</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-blue-700">
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">2</span>
                  <span>Envía el mensaje tal como está — ¡y listo! Tu coach ya te estará esperando</span>
                </li>
              </ol>
            </div>

            {/* Unveil mention */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-violet-700">
                  <strong>Extra:</strong> El coach también puede recomendarte <strong>Unveil</strong> para bienestar mental profundo, de forma opcional y no invasiva.
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-2">
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleConnect}
                  disabled={isLoading || !whatsappUrl}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl text-base shadow-lg shadow-green-200"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Conectar con Coach IA en WhatsApp
                  <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                </Button>
              </motion.div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
                disabled={!whatsappUrl}
                className="rounded-xl"
                title="Copiar enlace"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-400">
                Al tocar el botón se abrirá WhatsApp con el Coach listo
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkConnection}
                disabled={isChecking}
                className="text-xs text-gray-500 h-7"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                Ya lo conecté
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}