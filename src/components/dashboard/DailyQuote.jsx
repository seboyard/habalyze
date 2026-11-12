import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, X } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function DailyQuote({ user, userPrefs, onClose }) {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    // Check cache
    const cache = userPrefs?.daily_quote_cache;
    if (cache?.date === today && cache?.quote) {
      setQuote(cache.quote);
      return;
    }

    // Generate new quote
    setLoading(true);
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `Genera una frase motivacional corta (máximo 2 líneas) en español para alguien que está trabajando en mejorar sus hábitos. Debe ser inspiradora, positiva y orientada a la acción. Solo devuelve la frase, sin comillas ni formato adicional.`,
        response_json_schema: null
      });

      const newQuote = typeof response === 'string' ? response : response.quote || 'Cada día es una nueva oportunidad para ser mejor.';
      setQuote(newQuote);

      // Save to cache
      if (userPrefs?.id) {
        await db.entities.UserPreferences.update(userPrefs.id, {
          daily_quote_cache: { date: today, quote: newQuote }
        });
      }
    } catch (e) {
      setQuote('Cada pequeño paso cuenta. ¡Sigue adelante!');
    } finally {
      setLoading(false);
    }
  };

  const refreshQuote = async () => {
    setLoading(true);
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `Genera una frase motivacional diferente y corta (máximo 2 líneas) en español para alguien que está trabajando en mejorar sus hábitos. Debe ser inspiradora, positiva y orientada a la acción. Solo devuelve la frase, sin comillas ni formato adicional.`,
        response_json_schema: null
      });

      const newQuote = typeof response === 'string' ? response : response.quote || 'Hoy es el día perfecto para comenzar.';
      setQuote(newQuote);

      if (userPrefs?.id) {
        await db.entities.UserPreferences.update(userPrefs.id, {
          daily_quote_cache: { date: today, quote: newQuote }
        });
      }
    } catch (e) {
      setQuote('La constancia es la clave del éxito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-purple-900">Frase del Día</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-purple-600 hover:bg-purple-100"
                  onClick={refreshQuote}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-purple-600 hover:bg-purple-100"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-purple-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-purple-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-lg font-medium italic leading-relaxed">
                "{quote}"
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}