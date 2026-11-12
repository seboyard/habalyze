import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles } from 'lucide-react';
import PixelAvatar from '../avatar/PixelAvatar';

export default function CoachSuggestionCard({ user, suggestion, onAccept, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-2 border-violet-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-violet-700">Sugerencia del Coach IA</h3>
              <div className="bg-white rounded-full border-2 border-violet-200 p-0.5">
                <PixelAvatar user={user} size="tiny" showLevel={false} showCoins={false} />
              </div>
            </div>
            <p className="text-gray-700 mb-4">{suggestion}</p>
            <div className="flex gap-2">
              <Button
                onClick={onAccept}
                size="sm"
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
              >
                ¡Hazlo!
              </Button>
              <Button
                onClick={onDismiss}
                size="sm"
                variant="ghost"
              >
                Ahora no
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}