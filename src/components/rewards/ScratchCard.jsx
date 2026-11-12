import { db } from '@/api/base44Client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

const rewards = [
  { type: 'coins', amount: 10, label: '10 Monedas', icon: '💰', rarity: 'common', probability: 0.30 },
  { type: 'coins', amount: 25, label: '25 Monedas', icon: '💰', rarity: 'common', probability: 0.20 },
  { type: 'coins', amount: 50, label: '50 Monedas', icon: '💎', rarity: 'rare', probability: 0.15 },
  { type: 'coins', amount: 100, label: '100 Monedas', icon: '👑', rarity: 'epic', probability: 0.10 },
  { type: 'coins', amount: 250, label: '250 Monedas', icon: '🏆', rarity: 'legendary', probability: 0.03 },
  { type: 'xp', amount: 25, label: '+25 XP', icon: '⚡', rarity: 'common', probability: 0.05 },
  { type: 'xp', amount: 50, label: '+50 XP', icon: '✨', rarity: 'rare', probability: 0.02 },
  { type: 'buff', duration: 60, label: 'Doble XP 1h', icon: '🔥', rarity: 'epic', probability: 0.02 },
  { type: 'shop_item', category: 'hat', label: 'Gorro Random', icon: '🎩', rarity: 'rare', probability: 0.05 },
  { type: 'shop_item', category: 'glasses', label: 'Gafas Random', icon: '🕶️', rarity: 'rare', probability: 0.04 },
  { type: 'shop_item', category: 'shirt', label: 'Camisa Random', icon: '👕', rarity: 'epic', probability: 0.03 },
  { type: 'shop_item', category: 'pet', label: 'Mascota Random', icon: '🐾', rarity: 'legendary', probability: 0.01 },
];

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-500 to-pink-500',
  legendary: 'from-amber-400 to-orange-500',
};

const getRandomReward = () => {
  const rand = Math.random();
  let cumulative = 0;
  for (const reward of rewards) {
    cumulative += reward.probability;
    if (rand <= cumulative) return reward;
  }
  return rewards[0];
};

export default function ScratchCard({ open, onClose, onRewardClaimed, onBoxOpened, currentUser }) {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [reward, setReward] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (open && currentUser) {
      const selectedReward = getRandomReward();
      
      // Si es un shop_item, verificar si ya lo tiene
      if (selectedReward.type === 'shop_item') {
        // Aquí se manejará en el claim, simplemente asignar
        setReward(selectedReward);
      } else {
        setReward(selectedReward);
      }
      
      setRevealed(false);
      setClaimed(false);
      setScratchProgress(0);
    }
  }, [open, currentUser]);

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw scratch layer
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add pattern
    ctx.fillStyle = '#7C3AED';
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.beginPath();
          ctx.arc(i + 10, j + 10, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Add text
    ctx.font = 'bold 24px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('¡RASPA AQUÍ!', canvas.width / 2, canvas.height / 2 + 8);
  }, [open]);

  const handleScratch = (e) => {
    if (revealed || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Scale coordinates
    x = (x / rect.width) * canvas.width;
    y = (y / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const progress = (transparent / (imageData.data.length / 4)) * 100;
    setScratchProgress(progress);

    if (progress > 50 && !revealed) {
      setRevealed(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleClaim = async () => {
    setClaimed(true);
    
    // Si es un shop_item, verificar si ya lo tiene
    if (reward.type === 'shop_item' && currentUser) {
      const { base44 } = await import('@/api/base44Client');
      
      // Obtener items de esa categoría
      const categoryItems = await db.entities.ShopItem.filter({ 
        category: reward.category,
        is_available: true 
      });
      
      // Filtrar items que no posee
      const ownedItems = currentUser.owned_shop_items || [];
      const availableItems = categoryItems.filter(item => !ownedItems.includes(item.data.item_id));
      
      if (availableItems.length > 0) {
        // Dar un item random que no tenga
        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        onRewardClaimed({ 
          ...reward, 
          shop_item: randomItem.data,
          actualReward: randomItem.data 
        });
      } else {
        // Ya tiene todos los items de esa categoría, dar monedas
        const rarityCoins = { common: 50, rare: 100, epic: 200, legendary: 500 };
        const coinAmount = rarityCoins[reward.rarity] || 50;
        onRewardClaimed({ 
          type: 'coins', 
          amount: coinAmount, 
          label: `${coinAmount} Monedas (duplicado)`,
          icon: '💰',
          rarity: reward.rarity,
          isDuplicate: true
        });
      }
    } else {
      onRewardClaimed(reward);
    }
    
    onBoxOpened?.();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-violet-100 to-fuchsia-100 border-2 border-violet-200">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2 text-2xl">
            <Gift className="w-6 h-6 text-violet-600" />
            ¡Raspa y Gana!
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-lg">
          {/* Reward underneath */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: revealed ? 1 : 0.8 }}
              className={`text-7xl mb-4 ${revealed ? '' : 'blur-md'}`}
            >
              {reward?.icon}
            </motion.div>
            <div className={`text-center ${revealed ? '' : 'blur-md'}`}>
              <p className={`text-2xl font-bold bg-gradient-to-r ${rarityColors[reward?.rarity || 'common']} bg-clip-text text-transparent`}>
                {reward?.label}
              </p>
              <p className="text-sm text-gray-500 capitalize">{reward?.rarity}</p>
            </div>
          </div>

          {/* Scratch canvas */}
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className="absolute inset-0 w-full h-full cursor-pointer touch-none"
            onMouseDown={() => setIsScratching(true)}
            onMouseUp={() => setIsScratching(false)}
            onMouseLeave={() => setIsScratching(false)}
            onMouseMove={(e) => isScratching && handleScratch(e)}
            onTouchStart={() => setIsScratching(true)}
            onTouchEnd={() => setIsScratching(false)}
            onTouchMove={handleScratch}
          />
        </div>

        <AnimatePresence>
          {revealed && !claimed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Button
                onClick={handleClaim}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg py-6"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                ¡Reclamar Recompensa!
              </Button>
            </motion.div>
          )}
          {claimed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-4"
            >
              <p className="text-xl font-bold text-green-600">✓ ¡Recompensa añadida!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!revealed && (
          <p className="text-center text-sm text-gray-500">
            Raspa el área púrpura para revelar tu premio
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}