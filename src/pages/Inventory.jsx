import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, Check, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import PixelAvatar from '../components/avatar/PixelAvatar';

const categories = [
  { id: 'all', label: 'Todo', icon: '📦' },
  { id: 'hat', label: 'Sombreros', icon: '🎩' },
  { id: 'glasses', label: 'Gafas', icon: '👓' },
  { id: 'scarf', label: 'Bufandas', icon: '🧣' },
  { id: 'gloves', label: 'Guantes', icon: '🧤' },
  { id: 'backpack', label: 'Mochilas', icon: '🎒' },
  { id: 'pet', label: 'Mascotas', icon: '🐾' },
  { id: 'effect', label: 'Efectos', icon: '✨' },
];

const rarityConfig = {
  common: { color: 'bg-gray-100 text-gray-700', label: 'Común', border: 'border-gray-300' },
  rare: { color: 'bg-blue-100 text-blue-700', label: 'Raro', border: 'border-blue-400' },
  epic: { color: 'bg-purple-100 text-purple-700', label: 'Épico', border: 'border-purple-400' },
  legendary: { color: 'bg-amber-100 text-amber-700', label: 'Legendario', border: 'border-amber-400' },
  exclusive: { color: 'bg-pink-100 text-pink-700', label: 'Exclusivo', border: 'border-pink-400' },
};

// Catálogo completo de items
const allShopItems = [
  // Sombreros
  { item_id: 'hat_cap_blue', name: 'Gorra Azul', category: 'hat', style_id: 'cap', color: '#3498db', rarity: 'common', icon: '🧢' },
  { item_id: 'hat_cap_red', name: 'Gorra Roja', category: 'hat', style_id: 'cap', color: '#e74c3c', rarity: 'common', icon: '🧢' },
  { item_id: 'hat_cap_green', name: 'Gorra Verde', category: 'hat', style_id: 'cap', color: '#27ae60', rarity: 'common', icon: '🧢' },
  { item_id: 'hat_beanie_purple', name: 'Gorro Morado', category: 'hat', style_id: 'beanie', color: '#9c27b0', rarity: 'rare', icon: '🎿' },
  { item_id: 'hat_beanie_pink', name: 'Gorro Rosa', category: 'hat', style_id: 'beanie', color: '#e91e63', rarity: 'rare', icon: '🎿' },
  { item_id: 'hat_crown', name: 'Corona Real', category: 'hat', style_id: 'crown', rarity: 'legendary', icon: '👑' },
  { item_id: 'hat_tophat', name: 'Sombrero Copa', category: 'hat', style_id: 'tophat', color: '#1a1a1a', rarity: 'epic', icon: '🎩' },
  { item_id: 'hat_wizard', name: 'Gorro de Mago', category: 'hat', style_id: 'wizard', color: '#6c3483', rarity: 'epic', icon: '🧙' },
  { item_id: 'hat_headphones', name: 'Auriculares', category: 'hat', style_id: 'headphones', color: '#1a1a1a', rarity: 'rare', icon: '🎧' },
  
  // Gafas
  { item_id: 'glasses_nerd', name: 'Gafas Nerd', category: 'glasses', style_id: 'nerd', rarity: 'common', icon: '🤓' },
  { item_id: 'glasses_round', name: 'Gafas Redondas', category: 'glasses', style_id: 'round', rarity: 'rare', icon: '👓' },
  { item_id: 'glasses_aviator', name: 'Aviador', category: 'glasses', style_id: 'aviator', rarity: 'epic', icon: '🕶️' },
  { item_id: 'glasses_heart', name: 'Corazones', category: 'glasses', style_id: 'heart', rarity: 'rare', icon: '💕' },
  
  // Bufandas
  { item_id: 'scarf_simple', name: 'Bufanda Simple', category: 'scarf', style_id: 'simple', color: '#e74c3c', rarity: 'common', icon: '🧣' },
  { item_id: 'scarf_striped', name: 'Bufanda Rayada', category: 'scarf', style_id: 'striped', color: '#3498db', rarity: 'rare', icon: '🧣' },
  { item_id: 'scarf_winter', name: 'Bufanda Invernal', category: 'scarf', style_id: 'winter', color: '#9c27b0', rarity: 'epic', icon: '❄️' },
  
  // Guantes
  { item_id: 'gloves_simple', name: 'Guantes Simples', category: 'gloves', style_id: 'simple', color: '#1a1a1a', rarity: 'common', icon: '🧤' },
  { item_id: 'gloves_mittens', name: 'Mitones', category: 'gloves', style_id: 'mittens', color: '#e74c3c', rarity: 'rare', icon: '🧤' },
  { item_id: 'gloves_boxing', name: 'Guantes Boxeo', category: 'gloves', style_id: 'boxing', color: '#e74c3c', rarity: 'epic', icon: '🥊' },
  
  // Mochilas
  { item_id: 'backpack_school', name: 'Mochila Escolar', category: 'backpack', style_id: 'school', color: '#3498db', rarity: 'common', icon: '🎒' },
  { item_id: 'backpack_hiking', name: 'Mochila Montaña', category: 'backpack', style_id: 'hiking', color: '#27ae60', rarity: 'rare', icon: '🏔️' },
  { item_id: 'backpack_jetpack', name: 'Jetpack', category: 'backpack', style_id: 'jetpack', rarity: 'legendary', icon: '🚀' },
  { item_id: 'backpack_wings', name: 'Alas de Ángel', category: 'backpack', style_id: 'wings', rarity: 'legendary', icon: '😇' },
  
  // Mascotas
  { item_id: 'pet_cat', name: 'Gatito', category: 'pet', style_id: 'cat', rarity: 'epic', icon: '🐱' },
  { item_id: 'pet_dog', name: 'Perrito', category: 'pet', style_id: 'dog', rarity: 'epic', icon: '🐶' },
  { item_id: 'pet_dragon', name: 'Mini Dragón', category: 'pet', style_id: 'dragon', rarity: 'legendary', icon: '🐲' },
  { item_id: 'pet_robot', name: 'Robot Mascota', category: 'pet', style_id: 'robot', rarity: 'epic', icon: '🤖' },
  { item_id: 'pet_fairy', name: 'Hada', category: 'pet', style_id: 'fairy', rarity: 'legendary', icon: '🧚' },
  { item_id: 'pet_phoenix', name: 'Fénix', category: 'pet', style_id: 'phoenix', rarity: 'exclusive', icon: '🔥' },
  
  // Efectos
  { item_id: 'effect_sparkle', name: 'Destellos', category: 'effect', style_id: 'sparkle', rarity: 'rare', icon: '✨' },
  { item_id: 'effect_fire', name: 'Aura de Fuego', category: 'effect', style_id: 'fire', rarity: 'epic', icon: '🔥' },
  { item_id: 'effect_ice', name: 'Aura de Hielo', category: 'effect', style_id: 'ice', rarity: 'epic', icon: '❄️' },
  { item_id: 'effect_hearts', name: 'Corazones', category: 'effect', style_id: 'hearts', rarity: 'rare', icon: '💕' },
  { item_id: 'effect_rainbow', name: 'Arcoíris', category: 'effect', style_id: 'rainbow', rarity: 'legendary', icon: '🌈' },
  { item_id: 'effect_lightning', name: 'Relámpago', category: 'effect', style_id: 'lightning', rarity: 'epic', icon: '⚡' },
  { item_id: 'effect_galaxy', name: 'Galaxia', category: 'effect', style_id: 'galaxy', rarity: 'exclusive', icon: '🌌' },
];

export default function InventoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [equippedPreview, setEquippedPreview] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const ownedItems = user?.owned_items || [];
  const avatarConfig = user?.avatar_config || {};

  const getOwnedItemsData = () => {
    return allShopItems.filter(item => ownedItems.includes(item.item_id));
  };

  const filteredItems = activeCategory === 'all' 
    ? getOwnedItemsData()
    : getOwnedItemsData().filter(item => item.category === activeCategory);

  const isEquipped = (item) => {
    const field = item.category;
    return avatarConfig[field] === item.style_id;
  };

  const handleEquip = async (item) => {
    const field = item.category;
    const colorField = `${field}Color`;
    const savedColor = user?.purchased_colors?.[item.item_id] || item.color;
    
    const newConfig = { ...avatarConfig, [field]: item.style_id };
    if (savedColor) newConfig[colorField] = savedColor;
    
    await db.auth.updateMe({ avatar_config: newConfig });
    const updatedUser = await db.auth.me();
    setUser(updatedUser);
    toast.success(`¡${item.name} equipado!`);
  };

  const handleUnequip = async (item) => {
    const field = item.category;
    const colorField = `${field}Color`;
    
    const newConfig = { ...avatarConfig };
    delete newConfig[field];
    delete newConfig[colorField];
    
    await db.auth.updateMe({ avatar_config: newConfig });
    const updatedUser = await db.auth.me();
    setUser(updatedUser);
    toast.success(`${item.name} desequipado`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const previewConfig = equippedPreview 
    ? { ...avatarConfig, [equippedPreview.category]: equippedPreview.style_id, [`${equippedPreview.category}Color`]: user?.purchased_colors?.[equippedPreview.item_id] || equippedPreview.color }
    : avatarConfig;

  const previewUser = { ...user, avatar_config: previewConfig };

  const stats = {
    total: ownedItems.length,
    common: getOwnedItemsData().filter(i => i.rarity === 'common').length,
    rare: getOwnedItemsData().filter(i => i.rarity === 'rare').length,
    epic: getOwnedItemsData().filter(i => i.rarity === 'epic').length,
    legendary: getOwnedItemsData().filter(i => i.rarity === 'legendary').length,
    exclusive: getOwnedItemsData().filter(i => i.rarity === 'exclusive').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Dashboard'))} className="rounded-full border-2 border-violet-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Mi Inventario
            </h1>
            <p className="text-gray-600">Gestiona tus accesorios y equipamiento</p>
          </div>
          <Button onClick={() => navigate(createPageUrl('Shop'))} className="bg-gradient-to-r from-amber-500 to-orange-500">
            🛍️ Tienda
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          <Card className="p-3 text-center bg-white">
            <Package className="w-5 h-5 mx-auto text-violet-600 mb-1" />
            <p className="text-xl font-bold text-violet-700">{stats.total}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </Card>
          <Card className="p-3 text-center bg-gray-50 border-gray-200">
            <p className="text-xl font-bold text-gray-600">{stats.common}</p>
            <p className="text-[10px] text-gray-500">Común</p>
          </Card>
          <Card className="p-3 text-center bg-blue-50 border-blue-200">
            <p className="text-xl font-bold text-blue-600">{stats.rare}</p>
            <p className="text-[10px] text-blue-500">Raro</p>
          </Card>
          <Card className="p-3 text-center bg-purple-50 border-purple-200">
            <p className="text-xl font-bold text-purple-600">{stats.epic}</p>
            <p className="text-[10px] text-purple-500">Épico</p>
          </Card>
          <Card className="p-3 text-center bg-amber-50 border-amber-200">
            <p className="text-xl font-bold text-amber-600">{stats.legendary}</p>
            <p className="text-[10px] text-amber-500">Legendario</p>
          </Card>
          <Card className="p-3 text-center bg-pink-50 border-pink-200">
            <p className="text-xl font-bold text-pink-600">{stats.exclusive}</p>
            <p className="text-[10px] text-pink-500">Exclusivo</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Preview */}
          <div className="lg:sticky lg:top-4 h-fit">
            <Card className="overflow-hidden border-2 border-violet-200">
              <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-3 text-center">
                <h2 className="text-white font-bold flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> 
                  {equippedPreview ? 'Previsualizando' : 'Tu Avatar'}
                </h2>
              </div>
              <div className="p-6 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex justify-center">
                <PixelAvatar user={previewUser} size="xlarge" showLevel={true} showCoins={false} animation="idle" />
              </div>
              {equippedPreview && (
                <div className="p-3 bg-white border-t flex gap-2">
                  <Button variant="outline" onClick={() => setEquippedPreview(null)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={() => { handleEquip(equippedPreview); setEquippedPreview(null); }} className="flex-1 bg-violet-600">
                    Equipar
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  className={cn(activeCategory === cat.id && "bg-gradient-to-r from-violet-500 to-fuchsia-500")}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500 mb-2">Inventario vacío</h3>
                <p className="text-gray-400 mb-4">No tienes items en esta categoría</p>
                <Button onClick={() => navigate(createPageUrl('Shop'))} className="bg-gradient-to-r from-amber-500 to-orange-500">
                  Ir a la Tienda
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems.map((item, index) => {
                  const equipped = isEquipped(item);
                  const rarity = rarityConfig[item.rarity] || rarityConfig.common;
                  
                  return (
                    <motion.div
                      key={item.item_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card 
                        className={cn(
                          "p-3 transition-all hover:shadow-lg cursor-pointer border-2",
                          equipped ? "border-green-400 bg-green-50" : rarity.border,
                          equippedPreview?.item_id === item.item_id && "ring-2 ring-violet-400"
                        )}
                        onClick={() => setEquippedPreview(item)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-3xl">{item.icon}</span>
                          {equipped && (
                            <Badge className="bg-green-500 text-white text-[10px]">
                              <Check className="w-2 h-2 mr-0.5" /> Equipado
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-sm text-gray-800 truncate">{item.name}</h3>
                        <Badge className={cn("text-[10px] mt-1", rarity.color)}>{rarity.label}</Badge>
                        
                        <div className="flex gap-1 mt-2">
                          {equipped ? (
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleUnequip(item); }} className="flex-1 h-7 text-xs text-red-600 border-red-200">
                              Quitar
                            </Button>
                          ) : (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleEquip(item); }} className="flex-1 h-7 text-xs bg-violet-600">
                              Equipar
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}