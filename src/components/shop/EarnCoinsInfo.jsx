import React from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function EarnCoinsInfo({ user }) {
  const earnMethods = [
    { icon: '✅', coins: '+10', desc: 'Completar hábito', progress: null },
    { icon: '🔥', coins: '+50', desc: 'Racha 7 días', progress: Math.min(100, ((user?.current_streak || 0) / 7) * 100) },
    { icon: '⚡', coins: '+100', desc: 'Racha 14 días', progress: Math.min(100, ((user?.current_streak || 0) / 14) * 100) },
    { icon: '🏆', coins: '+250', desc: 'Racha 30 días', progress: Math.min(100, ((user?.current_streak || 0) / 30) * 100) },
    { icon: '🎯', coins: '+50-500', desc: 'Completar logros', progress: null },
    { icon: '🏅', coins: '+20', desc: 'Tarea de proyecto', progress: null },
    { icon: '⚔️', coins: '+100', desc: 'Ganar desafío', progress: null },
    { icon: '📊', coins: '+15', desc: 'Subir de nivel', progress: null },
  ];

  return (
    <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-amber-800">
        <Star className="w-4 h-4 text-amber-500" /> ¿Cómo conseguir monedas?
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {earnMethods.map((method, i) => (
          <div key={i} className="bg-white rounded-xl p-3 text-center border border-amber-200 relative overflow-hidden">
            {method.progress !== null && method.progress > 0 && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                style={{ width: `${method.progress}%` }}
              />
            )}
            <span className="text-xl">{method.icon}</span>
            <p className="font-bold text-amber-700 text-sm">{method.coins}</p>
            <p className="text-[10px] text-gray-600">{method.desc}</p>
            {method.progress !== null && method.progress > 0 && (
              <p className="text-[9px] text-amber-600 mt-1">{Math.round(method.progress)}%</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}