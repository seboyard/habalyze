import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const skinTones = {
  pale: '#FFECD1',
  light: '#FED6A8',
  medium: '#D4A574',
  tan: '#B88A5B',
  dark: '#8B6342',
  alien: '#7FE87F',
  zombie: '#9DC183',
  vampire: '#E8E8E8',
  robot: '#B8C5D6',
  demon: '#D98B8B',
  blue: '#8BB4E8',
  purple: '#C5A3E8',
  gold: '#FFD700',
  silver: '#C0C0C0'
};

const rarityGlow = {
  common: '',
  rare: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  epic: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]',
  legendary: 'drop-shadow-[0_0_16px_rgba(251,191,36,0.8)] animate-pulse'
};

const faceStyles = {
  happy: { eyes: '• •', mouth: '⌣' },
  cool: { eyes: '■ ■', mouth: '—' },
  excited: { eyes: '★ ★', mouth: '○' },
  wink: { eyes: '• -', mouth: '⌣' },
  surprised: { eyes: '○ ○', mouth: 'o' },
  sleepy: { eyes: '- -', mouth: '~' },
  angry: { eyes: '> <', mouth: '︵' },
  love: { eyes: '♥ ♥', mouth: '⌣' },
  cool_glasses: { eyes: '▓ ▓', mouth: '—' },
  pirate: { eyes: '• X', mouth: 'ꟷ' },
  kawaii: { eyes: '^ ^', mouth: '⌣' },
  dead: { eyes: 'X X', mouth: '︵' },
  confused: { eyes: '• •', mouth: '~' },
  smirk: { eyes: '• •', mouth: '⌣̃' },
  crying: { eyes: '╥ ╥', mouth: '︵' },
  shocked: { eyes: '◉ ◉', mouth: '○' },
  cute: { eyes: '◕ ◕', mouth: 'ω' },
  evil: { eyes: '⦿ ⦿', mouth: '⌢' },
  sleepy_z: { eyes: '- -', mouth: 'z' },
  star_eyes: { eyes: '✦ ✦', mouth: '⌣' }
};

const hairStyles = {
  short: { type: 'short', height: 20 },
  long: { type: 'long', height: 30 },
  spiky: { type: 'spiky', height: 25 },
  curly: { type: 'curly', height: 28 },
  bald: { type: 'bald', height: 0 },
  ponytail: { type: 'ponytail', height: 25 },
  mohawk: { type: 'mohawk', height: 35 },
  afro: { type: 'afro', height: 40 }
};

const hatStyles = {
  crown: { emoji: '👑', offsetY: -15 },
  cap: { emoji: '🧢', offsetY: -10 },
  tophat: { emoji: '🎩', offsetY: -20 },
  beanie: { emoji: '🎿', offsetY: -8 },
  party: { emoji: '🎉', offsetY: -12 },
  santa: { emoji: '🎅', offsetY: -10 },
  wizard: { emoji: '🧙', offsetY: -15 },
  pirate: { emoji: '🏴☠️', offsetY: -12 }
};

export default function HabboAvatar({ user, size = 'large', showLevel = true, showCoins = false }) {
  const sizeMap = {
    small: { scale: 0.7, container: 'w-28 h-36', levelSize: 'w-8 h-8 text-xs' },
    medium: { scale: 0.9, container: 'w-36 h-44', levelSize: 'w-10 h-10 text-sm' },
    large: { scale: 1.1, container: 'w-44 h-56', levelSize: 'w-12 h-12 text-base' },
    xlarge: { scale: 1.5, container: 'w-60 h-76', levelSize: 'w-14 h-14 text-lg' }
  };

  const { scale, container, levelSize } = sizeMap[size];
  
  const face = faceStyles[user?.avatar_face] || faceStyles.happy;
  const skin = skinTones[user?.avatar_skin] || skinTones.light;
  const hat = user?.equipped_hat ? hatStyles[user.equipped_hat] : null;
  
  // Extract item ID and color from equipped items
  const getItemColor = (equippedItem) => {
    if (!equippedItem) return null;
    const parts = equippedItem.split('_');
    const colorPart = parts[parts.length - 1];
    
    const colorMap = {
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
      rainbow: '#667eea'
    };
    
    return colorMap[colorPart] || colorMap.blue;
  };

  const shirtColor = getItemColor(user?.equipped_shirt) || '#4A90E2';
  const pantsColor = getItemColor(user?.equipped_pants) || '#95A5A6';
  const shoesColor = getItemColor(user?.equipped_shoes) || '#ECF0F1';

  const userRarity = user?.avatar_rarity || 'common';
  const glowClass = rarityGlow[userRarity];

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div 
        className={`relative ${glowClass}`}
        whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative flex flex-col items-center" style={{ width: '100px', height: '140px' }}>
          {/* Glow effect for legendary */}
          {userRarity === 'legendary' && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-full blur-2xl opacity-30 animate-pulse" />
          )}
          
          {/* Hat */}
          {hat && (
            <motion.div 
              className="absolute z-30 text-3xl"
              style={{ top: `${hat.offsetY}px` }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -2, rotate: [0, -5, 5, 0] }}
            >
              {hat.emoji}
            </motion.div>
          )}

          {/* Head */}
          <motion.div 
            className="relative z-20 rounded-lg shadow-xl"
            whileHover={{ y: -2 }}
            style={{
              width: '50px',
              height: '60px',
              backgroundColor: skin,
              border: '3px solid rgba(0,0,0,0.2)',
              boxShadow: '6px 6px 0px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(0,0,0,0.1), inset 2px 2px 3px rgba(255,255,255,0.3)'
            }}
          >
            {/* Hair - improved gradient */}
            <div 
              className="absolute -top-1 left-0 right-0 rounded-t-lg"
              style={{
                height: '12px',
                background: 'linear-gradient(to bottom, rgba(101, 67, 33, 0.5), rgba(101, 67, 33, 0.25), rgba(101, 67, 33, 0.1))',
                borderRadius: '8px 8px 0 0'
              }}
            />
            
            {/* Cheek blush */}
            <div className="absolute" style={{ top: '32px', left: '8px', width: '8px', height: '6px', backgroundColor: 'rgba(255, 150, 150, 0.3)', borderRadius: '50%' }} />
            <div className="absolute" style={{ top: '32px', right: '8px', width: '8px', height: '6px', backgroundColor: 'rgba(255, 150, 150, 0.3)', borderRadius: '50%' }} />
            
            {/* Eyes */}
            <div 
              className="absolute flex justify-center items-center font-bold"
              style={{
                top: '20px',
                left: '0',
                right: '0',
                fontSize: '10px',
                letterSpacing: '8px',
                color: '#2C3E50'
              }}
            >
              {face.eyes}
            </div>

            {/* Mouth */}
            <div 
              className="absolute flex justify-center items-center font-bold"
              style={{
                bottom: '15px',
                left: '0',
                right: '0',
                fontSize: '12px',
                color: '#E74C3C'
              }}
            >
              {face.mouth}
            </div>
          </motion.div>

          {/* Body */}
          <motion.div 
            className="relative z-10 -mt-1"
            whileHover={{ scale: 1.02 }}
            style={{
              width: '45px',
              height: '50px',
              background: `linear-gradient(145deg, ${shirtColor}, ${shirtColor}dd 40%, ${shirtColor}bb 70%, ${shirtColor}99)`,
              border: '3px solid rgba(0,0,0,0.2)',
              borderRadius: '0 0 8px 8px',
              boxShadow: '5px 5px 0px rgba(0,0,0,0.2), inset -3px -3px 2px rgba(0,0,0,0.15), inset 2px 2px 2px rgba(255,255,255,0.2)'
            }}
          >
            {/* Shirt details - buttons with better styling */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col gap-1.5">
              <div style={{ width: '5px', height: '5px', background: 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(200,200,200,0.6))', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.4)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
              <div style={{ width: '5px', height: '5px', background: 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(200,200,200,0.6))', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.4)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
            </div>
            {/* Improved shirt collar */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
              style={{
                width: '22px',
                height: '7px',
                background: `linear-gradient(to bottom, ${shirtColor}dd, ${shirtColor}99, ${shirtColor}77)`,
                borderRadius: '0 0 5px 5px',
                border: '1.5px solid rgba(0,0,0,0.25)',
                boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)'
              }}
            />
            {/* Shirt pocket */}
            <div 
              className="absolute"
              style={{
                top: '8px',
                left: '6px',
                width: '10px',
                height: '8px',
                background: `linear-gradient(135deg, ${shirtColor}99, ${shirtColor}77)`,
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: '0 0 2px 2px',
                borderTop: 'none'
              }}
            />
          </motion.div>

          {/* Legs */}
          <div className="flex gap-1 -mt-1 relative z-10">
            <motion.div 
              whileHover={{ y: 1 }}
              style={{
                width: '20px',
                height: '35px',
                background: `linear-gradient(145deg, ${pantsColor}, ${pantsColor}dd 40%, ${pantsColor}aa 80%)`,
                border: '3px solid rgba(0,0,0,0.2)',
                borderRadius: '0 0 7px 7px',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.2), inset -2px -3px 2px rgba(0,0,0,0.15), inset 1px 1px 1px rgba(255,255,255,0.2)'
              }}
            >
              {/* Pants seam */}
              <div style={{ position: 'absolute', left: '50%', top: '0', bottom: '0', width: '1px', background: 'rgba(0,0,0,0.2)' }} />
            </motion.div>
            <motion.div 
              whileHover={{ y: 1 }}
              style={{
                width: '20px',
                height: '35px',
                background: `linear-gradient(145deg, ${pantsColor}, ${pantsColor}dd 40%, ${pantsColor}aa 80%)`,
                border: '3px solid rgba(0,0,0,0.2)',
                borderRadius: '0 0 7px 7px',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.2), inset -2px -3px 2px rgba(0,0,0,0.15), inset 1px 1px 1px rgba(255,255,255,0.2)'
              }}
            >
              {/* Pants seam */}
              <div style={{ position: 'absolute', left: '50%', top: '0', bottom: '0', width: '1px', background: 'rgba(0,0,0,0.2)' }} />
            </motion.div>
          </div>

          {/* Shoes */}
          <div className="flex gap-1 -mt-1 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              style={{
                width: '22px',
                height: '13px',
                background: `linear-gradient(145deg, ${shoesColor}, ${shoesColor}dd 40%, ${shoesColor}88)`,
                border: '2.5px solid rgba(0,0,0,0.25)',
                borderRadius: '7px 7px 5px 5px',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.25), inset -2px -2px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.3)'
              }}
            >
              {/* Shoe shine */}
              <div 
                style={{
                  width: '9px',
                  height: '5px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))',
                  position: 'absolute',
                  top: '2px',
                  left: '3px',
                  borderRadius: '3px'
                }}
              />
              {/* Shoe laces */}
              <div style={{ position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '1px', backgroundColor: 'rgba(0,0,0,0.4)' }} />
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              style={{
                width: '22px',
                height: '13px',
                background: `linear-gradient(145deg, ${shoesColor}, ${shoesColor}dd 40%, ${shoesColor}88)`,
                border: '2.5px solid rgba(0,0,0,0.25)',
                borderRadius: '7px 7px 5px 5px',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.25), inset -2px -2px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.3)'
              }}
            >
              {/* Shoe shine */}
              <div 
                style={{
                  width: '9px',
                  height: '5px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))',
                  position: 'absolute',
                  top: '2px',
                  left: '3px',
                  borderRadius: '3px'
                }}
              />
              {/* Shoe laces */}
              <div style={{ position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '1px', backgroundColor: 'rgba(0,0,0,0.4)' }} />
            </motion.div>
          </div>
        </div>

        {showLevel && (
          <motion.div 
            className={`absolute -bottom-3 -right-3 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white rounded-full ${levelSize} flex items-center justify-center font-bold shadow-xl border-3 border-white`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.15, rotate: 360 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 300 }}
            style={{
              boxShadow: '0 4px 15px rgba(251, 146, 60, 0.5), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.3)'
            }}
          >
            <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{user?.level || 1}</span>
          </motion.div>
        )}
      </motion.div>

      {showLevel && (
        <motion.div 
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gradient-to-r from-white to-gray-50 px-4 py-2 rounded-full shadow-lg border-2 border-amber-200"
            whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(251, 191, 36, 0.3)' }}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Nivel {user?.level || 1}
            </span>
          </motion.div>
          {showCoins && (
            <motion.div 
              className="flex items-center gap-2 text-sm font-bold text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-full shadow-md border-2 border-amber-300"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-lg drop-shadow">💰</span>
              <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                {user?.coins || 0}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}