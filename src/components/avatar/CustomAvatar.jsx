import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const skinTones = {
  light: '#FFE0BD',
  medium: '#E8B98A',
  tan: '#C68642',
  dark: '#8D5524',
  pale: '#F7E7CE'
};

const faces = {
  happy: '😊',
  cool: '😎',
  excited: '🤩',
  angel: '😇',
  ninja: '🥷',
  pirate: '🏴☠️',
  robot: '🤖',
  alien: '👽',
  cat: '😺',
  star: '⭐'
};

const hats = {
  crown: { emoji: '👑', color: '#FFD700' },
  cap: { emoji: '🧢', color: '#4A90E2' },
  tophat: { emoji: '🎩', color: '#2C3E50' },
  cowboy: { emoji: '🤠', color: '#8B4513' },
  party: { emoji: '🎉', color: '#FF6B6B' },
  chef: { emoji: '👨🍳', color: '#FFFFFF' },
  witch: { emoji: '🧙♂️', color: '#8B008B' },
  viking: { emoji: '⚔️', color: '#C0C0C0' },
  ninja_mask: { emoji: '🥷', color: '#000000' },
  halo: { emoji: '😇', color: '#FFD700' }
};

const shirts = {
  basic_blue: { color: '#4A90E2', pattern: 'solid' },
  basic_red: { color: '#E74C3C', pattern: 'solid' },
  basic_green: { color: '#2ECC71', pattern: 'solid' },
  basic_purple: { color: '#9B59B6', pattern: 'solid' },
  basic_orange: { color: '#E67E22', pattern: 'solid' },
  stripe_rainbow: { color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', pattern: 'striped' },
  tshirt_fire: { color: '#FF6B6B', pattern: 'fire' },
  tshirt_star: { color: '#FFD93D', pattern: 'star' },
  hoodie_black: { color: '#2C3E50', pattern: 'hoodie' },
  suit: { color: '#34495E', pattern: 'suit' }
};

const pants = {
  basic_gray: { color: '#95A5A6' },
  basic_black: { color: '#2C3E50' },
  basic_blue: { color: '#3498DB' },
  basic_brown: { color: '#8D6E63' },
  jeans: { color: '#1E3A5F' },
  shorts_red: { color: '#E74C3C' },
  shorts_green: { color: '#27AE60' },
  joggers: { color: '#7F8C8D' },
  camo: { color: '#556B2F' },
  golden: { color: '#FFD700' }
};

const shoes = {
  basic_white: { color: '#ECF0F1', emoji: '👟' },
  basic_black: { color: '#2C3E50', emoji: '👞' },
  sneakers_red: { color: '#E74C3C', emoji: '👟' },
  sneakers_blue: { color: '#3498DB', emoji: '👟' },
  boots: { color: '#8D6E63', emoji: '🥾' },
  sandals: { color: '#F39C12', emoji: '👡' },
  heels: { color: '#E91E63', emoji: '👠' },
  soccer: { color: '#27AE60', emoji: '⚽' },
  skates: { color: '#9B59B6', emoji: '⛸️' },
  rainbow: { color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', emoji: '🌈' }
};

export default function CustomAvatar({ user, size = 'large', showLevel = true, showCoins = false }) {
  const sizeMap = {
    small: { container: 'w-20 h-28', body: 'w-16 h-20', head: 'w-12 h-12', text: 'text-xl' },
    medium: { container: 'w-28 h-40', body: 'w-24 h-28', head: 'w-16 h-16', text: 'text-2xl' },
    large: { container: 'w-36 h-52', body: 'w-32 h-36', head: 'w-20 h-20', text: 'text-3xl' },
    xlarge: { container: 'w-48 h-72', body: 'w-40 h-48', head: 'w-28 h-28', text: 'text-5xl' }
  };

  const sizes = sizeMap[size];
  const face = faces[user?.avatar_face] || faces.happy;
  const skin = skinTones[user?.avatar_skin] || skinTones.light;
  const hat = user?.equipped_hat ? hats[user.equipped_hat] : null;
  const shirt = shirts[user?.equipped_shirt] || shirts.basic_blue;
  const pant = pants[user?.equipped_pants] || pants.basic_gray;
  const shoe = shoes[user?.equipped_shoes] || shoes.basic_white;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className={`${sizes.container} relative flex flex-col items-center`}>
          {/* Hat */}
          {hat && (
            <motion.div 
              className="absolute -top-2 z-10"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-3xl">{hat.emoji}</span>
            </motion.div>
          )}

          {/* Head */}
          <div 
            className={`${sizes.head} rounded-full shadow-lg flex items-center justify-center relative z-20`}
            style={{ backgroundColor: skin }}
          >
            <span className={sizes.text}>{face}</span>
          </div>

          {/* Body */}
          <div className={`${sizes.body} flex flex-col items-center -mt-2`}>
            {/* Shirt */}
            <div 
              className="w-full h-2/3 rounded-t-lg shadow-md relative overflow-hidden"
              style={{ 
                background: shirt.color.includes('gradient') ? shirt.color : shirt.color 
              }}
            >
              {shirt.pattern === 'fire' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
              )}
              {shirt.pattern === 'star' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              )}
            </div>

            {/* Pants */}
            <div 
              className="w-3/4 h-1/3 rounded-b-lg shadow-md"
              style={{ backgroundColor: pant.color }}
            />

            {/* Shoes */}
            <div className="flex gap-2 -mb-2">
              <div 
                className="w-6 h-4 rounded-lg shadow-sm"
                style={{ 
                  background: shoe.color.includes('gradient') ? shoe.color : shoe.color 
                }}
              />
              <div 
                className="w-6 h-4 rounded-lg shadow-sm"
                style={{ 
                  background: shoe.color.includes('gradient') ? shoe.color : shoe.color 
                }}
              />
            </div>
          </div>
        </div>

        {showLevel && (
          <motion.div 
            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            {user?.level || 1}
          </motion.div>
        )}
      </motion.div>

      {showLevel && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Nivel {user?.level || 1}
          </div>
          {showCoins && (
            <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
              <span className="text-lg">💰</span>
              {user?.coins || 0} monedas
            </div>
          )}
        </div>
      )}
    </div>
  );
}