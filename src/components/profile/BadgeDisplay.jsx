import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Pin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const levelStyles = {
  1: { bg: 'from-gray-400 to-gray-500', border: 'border-gray-400', glow: false },
  2: { bg: 'from-gray-500 to-gray-600', border: 'border-gray-500', glow: false },
  3: { bg: 'from-green-400 to-green-600', border: 'border-green-500', glow: false },
  4: { bg: 'from-green-500 to-emerald-600', border: 'border-emerald-500', glow: false },
  5: { bg: 'from-blue-400 to-blue-600', border: 'border-blue-500', glow: true },
  6: { bg: 'from-blue-500 to-indigo-600', border: 'border-indigo-500', glow: true },
  7: { bg: 'from-purple-400 to-purple-600', border: 'border-purple-500', glow: true },
  8: { bg: 'from-purple-500 to-pink-600', border: 'border-pink-500', glow: true },
  9: { bg: 'from-amber-400 to-orange-600', border: 'border-orange-500', glow: true },
  10: { bg: 'from-amber-500 to-red-600', border: 'border-red-500', glow: true, legendary: true },
};

export default function BadgeDisplay({ 
  badge, 
  userBadge, 
  size = 'medium', 
  showDetails = false,
  isOwner = false,
  onToggleFeatured 
}) {
  const level = userBadge?.current_level || 1;
  const style = levelStyles[Math.min(level, 10)];
  
  const sizeClasses = {
    small: 'w-12 h-12 text-xl',
    medium: 'w-16 h-16 text-2xl',
    large: 'w-20 h-20 text-3xl',
  };

  const BadgeIcon = () => (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={cn(
        "relative rounded-xl flex items-center justify-center bg-gradient-to-br border-2 shadow-lg",
        sizeClasses[size],
        `bg-gradient-to-br ${style.bg}`,
        style.border,
        style.glow && "shadow-lg shadow-purple-500/30",
        style.legendary && "animate-pulse"
      )}
    >
      <span className="drop-shadow-md">{badge.icon}</span>
      
      {/* Level indicator */}
      <div className={cn(
        "absolute -bottom-1 -right-1 rounded-full text-white text-xs font-bold flex items-center justify-center",
        size === 'small' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5',
        style.legendary ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gray-800'
      )}>
        {level}
      </div>

      {/* Featured star */}
      {userBadge?.is_featured && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
          <Star className="w-2.5 h-2.5 text-white fill-white" />
        </div>
      )}
    </motion.div>
  );

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <BadgeIcon />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-bold">{badge.name}</p>
            <p className="text-xs text-gray-400">Nivel {level}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={cn(
      "p-4 text-center relative overflow-hidden",
      style.legendary && "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
    )}>
      {style.legendary && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 animate-pulse" />
      )}
      
      <div className="flex justify-center mb-3">
        <BadgeIcon />
      </div>
      
      <h4 className="font-bold text-gray-800 text-sm mb-1">{badge.name}</h4>
      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{badge.description}</p>
      
      <Badge variant="outline" className={cn(
        "text-xs",
        style.legendary && "border-amber-400 text-amber-700"
      )}>
        Nivel {level}/10
      </Badge>

      {/* Progress to next level */}
      {level < 10 && badge.levels && (
        <div className="mt-2">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn("h-full bg-gradient-to-r", style.bg)}
              style={{ 
                width: `${Math.min(100, ((userBadge?.current_progress || 0) / (badge.levels[level]?.requirement_value || 100)) * 100)}%` 
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {userBadge?.current_progress || 0}/{badge.levels[level]?.requirement_value || '?'}
          </p>
        </div>
      )}

      {isOwner && onToggleFeatured && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-xs"
          onClick={onToggleFeatured}
        >
          <Pin className={cn("w-3 h-3 mr-1", userBadge?.is_featured && "fill-amber-500 text-amber-500")} />
          {userBadge?.is_featured ? 'Quitar' : 'Destacar'}
        </Button>
      )}
    </Card>
  );
}