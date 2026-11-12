import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ShopItemCard({ item, owned, equipped, userCoins, unlocked = true, unlockMessage = '', onBuy, onEquip }) {
  const canAfford = userCoins >= item.price;
  const isEquipped = equipped === item.item_id;

  const rarityConfig = {
    common: {
      gradient: 'from-gray-400 to-gray-500',
      border: 'border-gray-300',
      text: 'text-gray-700',
      bg: 'bg-gray-50',
      glow: 'shadow-gray-200'
    },
    rare: {
      gradient: 'from-blue-400 to-blue-600',
      border: 'border-blue-400',
      text: 'text-blue-700',
      bg: 'bg-blue-50',
      glow: 'shadow-blue-300'
    },
    epic: {
      gradient: 'from-purple-400 to-purple-600',
      border: 'border-purple-400',
      text: 'text-purple-700',
      bg: 'bg-purple-50',
      glow: 'shadow-purple-300'
    },
    legendary: {
      gradient: 'from-amber-400 to-orange-600',
      border: 'border-amber-400',
      text: 'text-amber-700',
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      glow: 'shadow-amber-400'
    }
  };

  const config = rarityConfig[item.rarity] || rarityConfig.common;
  
  const colorDot = {
    red: '#E74C3C',
    blue: '#3498DB',
    green: '#27AE60',
    purple: '#9B59B6',
    orange: '#E67E22',
    black: '#2C3E50',
    white: '#ECF0F1',
    yellow: '#F1C40F',
    pink: '#FF69B4',
    brown: '#8D6E63',
    gray: '#95A5A6',
    cyan: '#1ABC9C',
    lime: '#A4DE02',
    navy: '#1E3A5F',
    gold: '#FFD700',
    silver: '#C0C0C0',
    rainbow: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all border-2",
        config.border,
        config.glow,
        item.rarity === 'legendary' && "shadow-xl",
        isEquipped && "ring-4 ring-green-400 shadow-2xl scale-105"
      )}>
        <div className={cn("h-3 bg-gradient-to-r relative", config.gradient)}>
          {item.rarity === 'legendary' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="text-4xl drop-shadow-lg">{item.icon}</span>
                {item.rarity === 'legendary' && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </motion.div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn("text-xs capitalize", config.gradient, "text-white shadow-md")}>
                    {item.rarity}
                  </Badge>
                  {!unlocked && (
                    <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                      🔒
                    </Badge>
                  )}
                  {item.color && (
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{ background: colorDot[item.color] || item.color }}
                      title={item.color}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={cn(
                "px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 justify-end",
                config.bg
              )}>
                <span className="text-lg">💰</span>
                <span className={cn("text-xl", config.text)}>{item.price}</span>
              </div>
            </div>
          </div>

          {item.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          )}

          {!unlocked && unlockMessage && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                <span>🔒</span>
                {unlockMessage}
              </p>
            </div>
          )}

          {!unlocked ? (
            <Button size="sm" variant="outline" className="w-full bg-red-50 text-red-700 border-red-300 font-bold" disabled>
              <Lock className="w-4 h-4 mr-1" />
              Bloqueado
            </Button>
          ) : isEquipped ? (
            <Button size="sm" variant="outline" className="w-full bg-green-50 text-green-700 border-green-300 font-bold" disabled>
              <Check className="w-4 h-4 mr-1" />
              Equipado
            </Button>
          ) : owned ? (
            <Button size="sm" onClick={() => onEquip(item)} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold">
              Equipar
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={() => onBuy(item)} 
              disabled={!canAfford}
              className={cn(
                "w-full font-bold",
                canAfford 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" 
                  : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed"
              )}
            >
              {canAfford ? (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Comprar
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-1" />
                  Sin monedas
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}