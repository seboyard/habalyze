import { db } from '@/api/base44Client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Check, Clock, Package, TrendingUp, Gift, Palette, X, Box, ChevronLeft, ChevronRight, Eye, Heart, Sparkles, Search, Star, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import ShopHeader from '../components/shop/ShopHeader';
import ShopPreview from '../components/shop/ShopPreview';
import ShopSearch from '../components/shop/ShopSearch';
import ShopCategories from '../components/shop/ShopCategories';
import EarnCoinsInfo from '../components/shop/EarnCoinsInfo';
import { rarityConfig, colorPalette, categoryFieldMap } from '../components/common/shopConstants';
import PixelAvatar from '../components/avatar/PixelAvatar';

// Loot Box Component - Memoized for performance
const LootBoxSection = React.memo(function LootBoxSection({ lootBoxes, user, setUser, allItems, ownedItems, queryClient }) {
  const [openingBox, setOpeningBox] = useState(null);
  const [revealedItems, setRevealedItems] = useState([]);
  const [showReveal, setShowReveal] = useState(false);

  const openLootBox = async (box) => {
    const boxId = box.box_id || box.id;
    const price = box.price;
    
    if ((user?.coins || 0) < price) {
      toast.error('Monedas insuficientes');
      return;
    }

    setOpeningBox(box);
    
    try {
      // Simular animación
      await new Promise(r => setTimeout(r, 1500));
      
      const response = await db.functions.invoke('openLootBox', {
        box_id: boxId,
        use_gems: false
      });

      if (response.data.success) {
        const updatedUser = await db.auth.me();
        setUser(updatedUser);
        
        // Map items to full item objects for display
        const itemsWithDetails = response.data.items.map(itemData => {
          const fullItem = allItems.find(i => i.item_id === itemData.item_id);
          return fullItem || itemData;
        });
        
        setRevealedItems(itemsWithDetails);
        setShowReveal(true);
        setOpeningBox(null);
        queryClient.invalidateQueries(['shop-items']);
      }
    } catch (error) {
      setOpeningBox(null);
      toast.error('Error al abrir caja', { description: error.response?.data?.error || error.message });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
        <Box className="w-5 h-5 text-violet-600" /> Cofre de constancia
        <Badge className="bg-[#78CAA8] text-[#2B1741]">Sin azar y sin dinero</Badge>
      </h2>
      <p className="text-sm text-gray-600">Abre el cofre y recibes la siguiente pieza de la colección, siempre en el mismo orden. Las monedas salen de tus hábitos.</p>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {lootBoxes.map((box) => (
          <motion.div
            key={box.box_id || box.id}
            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
            className="cursor-pointer"
            onClick={() => openLootBox(box)}
          >
            <Card className={cn(
              "overflow-hidden border-2 transition-all",
              rarityConfig[box.rarity]?.glow
            )}>
              <div className={cn("bg-gradient-to-br p-4 text-white text-center", box.color_gradient || box.color)}>
                <motion.div 
                  className="text-5xl mb-2"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {box.icon}
                </motion.div>
                <h3 className="font-bold">{box.name}</h3>
                <p className="text-xs opacity-80 mt-1">{box.description}</p>
                <div className="mt-3 bg-white/20 rounded-lg py-2">
                  <span className="font-bold">💰 {box.price}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Opening Animation Dialog */}
      <Dialog open={!!openingBox} onOpenChange={() => setOpeningBox(null)}>
        <DialogContent className="bg-gradient-to-br from-violet-900 to-fuchsia-900 border-none text-white max-w-md">
          <div className="text-center py-8">
            <motion.div
              className="text-8xl mb-4"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 360],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {openingBox?.icon}
            </motion.div>
            <h2 className="text-2xl font-bold">Abriendo {openingBox?.name}...</h2>
            <div className="flex justify-center gap-1 mt-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reveal Dialog */}
      <Dialog open={showReveal} onOpenChange={setShowReveal}>
        <DialogContent className="bg-gradient-to-br from-amber-50 to-orange-50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 ¡Felicidades!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-600 mb-4">Has obtenido:</p>
            <div className="grid grid-cols-3 gap-3">
              {revealedItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.3, type: "spring" }}
                  className="text-center"
                >
                  <Card className={cn(
                    "p-4 border-2",
                    rarityConfig[item?.rarity]?.glow
                  )}>
                    <div className="text-4xl mb-2">{item?.icon}</div>
                    <p className="font-bold text-sm">{item?.name}</p>
                    <Badge className={cn("mt-1 text-[10px]", rarityConfig[item?.rarity]?.color)}>
                      {rarityConfig[item?.rarity]?.label}
                    </Badge>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Button 
              onClick={() => setShowReveal(false)} 
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500"
            >
              ¡Genial!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

// Fallback data if DB is empty
const defaultShopItems = [];

// Loot Boxes
const lootBoxes = [
  {
    id: 'box_common',
    name: 'Caja Común',
    description: '3 items aleatorios comunes o raros',
    icon: '📦',
    price: 200,
    rarity: 'common',
    color: 'from-gray-400 to-gray-500',
    possibleRarities: ['common', 'rare'],
    itemCount: 3,
  },
  {
    id: 'box_rare',
    name: 'Caja Rara',
    description: '3 items con chance de épico',
    icon: '🎁',
    price: 500,
    rarity: 'rare',
    color: 'from-blue-400 to-blue-600',
    possibleRarities: ['common', 'rare', 'epic'],
    itemCount: 3,
  },
  {
    id: 'box_epic',
    name: 'Caja Épica',
    description: '3 items épicos garantizados',
    icon: '🎀',
    price: 1200,
    rarity: 'epic',
    color: 'from-purple-500 to-pink-500',
    possibleRarities: ['rare', 'epic', 'legendary'],
    itemCount: 3,
  },
  {
    id: 'box_legendary',
    name: 'Caja Legendaria',
    description: '1 item legendario garantizado + 2 épicos',
    icon: '👑',
    price: 3000,
    rarity: 'legendary',
    color: 'from-amber-400 to-orange-500',
    possibleRarities: ['epic', 'legendary', 'exclusive'],
    itemCount: 3,
    guaranteedLegendary: true,
  },
  {
    id: 'box_mystery',
    name: 'Caja Misteriosa',
    description: '¡Cualquier cosa puede salir!',
    icon: '❓',
    price: 800,
    rarity: 'exclusive',
    color: 'from-violet-600 to-fuchsia-600',
    possibleRarities: ['common', 'rare', 'epic', 'legendary', 'exclusive'],
    itemCount: 2,
  },
];

// Packs temáticos
const shopPacks = [
  {
    id: 'pack_winter',
    name: 'Pack Invernal',
    description: 'Todo lo necesario para el frío',
    icon: '❄️',
    items: ['hat_beanie_purple', 'scarf_winter', 'effect_ice'],
    originalPrice: 1200,
    discountPrice: 850,
    discount: 30,
    rarity: 'epic',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'pack_fire',
    name: 'Pack Fuego',
    description: 'Enciende tu avatar con estilo',
    icon: '🔥',
    items: ['pet_dragon', 'effect_fire', 'hat_crown'],
    originalPrice: 3800,
    discountPrice: 2660,
    discount: 30,
    rarity: 'legendary',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'pack_cute',
    name: 'Pack Adorable',
    description: 'Los más tiernos del juego',
    icon: '💕',
    items: ['pet_cat', 'glasses_heart', 'effect_hearts'],
    originalPrice: 1100,
    discountPrice: 750,
    discount: 32,
    rarity: 'rare',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'pack_wizard',
    name: 'Pack Mago',
    description: 'Conviértete en un hechicero',
    icon: '🧙',
    items: ['hat_wizard', 'effect_sparkle', 'pet_fairy'],
    originalPrice: 2100,
    discountPrice: 1400,
    discount: 33,
    rarity: 'epic',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'pack_starter',
    name: 'Pack Inicial',
    description: 'Perfecto para empezar',
    icon: '🎁',
    items: ['hat_cap_blue', 'glasses_nerd', 'scarf_simple'],
    originalPrice: 300,
    discountPrice: 180,
    discount: 40,
    rarity: 'common',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function ShopPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);
  const [previewColor, setPreviewColor] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
      setWishlist(currentUser.wishlist || []);
    };
    loadUser();
  }, []);

  const { data: dbItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['shop-items'],
    queryFn: () => db.entities.ShopItem.filter({ is_available: true }, '-sort_order'),
    staleTime: 300000,
    gcTime: 600000,
  });

  const { data: lootBoxesDB = [] } = useQuery({
    queryKey: ['loot-boxes'],
    queryFn: () => db.entities.LootBox.filter({ is_available: true }, '-sort_order'),
    staleTime: 300000,
    gcTime: 600000,
  });

  const { data: shopPacksDB = [] } = useQuery({
    queryKey: ['shop-packs'],
    queryFn: () => db.entities.ShopPack.filter({ is_available: true }, '-sort_order'),
    staleTime: 300000,
    gcTime: 600000,
  });

  const allItems = dbItems;
  const allLootBoxes = lootBoxesDB.length > 0 ? lootBoxesDB : lootBoxes;
  const allShopPacks = shopPacksDB.length > 0 ? shopPacksDB : shopPacks;

  const getFilteredItems = () => {
    let items = [];
    switch (category) {
      case 'new':
        items = allItems.filter(item => item.is_new);
        break;
      case 'popular':
        items = [...allItems].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 20);
        break;
      case 'packs':
      case 'lootbox':
        items = [];
        break;
      case 'all':
        items = allItems;
        break;
      default:
        items = allItems.filter(item => item.category === category);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(query) || 
        item.item_id?.toLowerCase().includes(query)
      );
    }
    
    return items;
  };

  const filteredItems = getFilteredItems();
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery]);
  const ownedItems = user?.owned_items || [];

  const checkUnlock = useCallback((item) => {
    if (!item.unlock_requirement || item.unlock_requirement.type === 'none') return { unlocked: true };
    const { type, value } = item.unlock_requirement;
    switch (type) {
      case 'level':
        return { unlocked: (user?.level || 1) >= parseInt(value), message: `Nivel ${value} requerido` };
      case 'streak':
        return { unlocked: (user?.best_streak || 0) >= parseInt(value), message: `Racha de ${value} días requerida` };
      case 'achievement':
        return { unlocked: user?.achievements?.includes(value), message: `Logro "${value}" requerido` };
      default:
        return { unlocked: true };
    }
  }, [user?.level, user?.best_streak, user?.achievements]);

  const toggleWishlist = async (itemId) => {
    const newWishlist = wishlist.includes(itemId)
      ? wishlist.filter(id => id !== itemId)
      : [...wishlist, itemId];
    setWishlist(newWishlist);
    await db.auth.updateMe({ wishlist: newWishlist });
    toast.success(wishlist.includes(itemId) ? 'Eliminado de favoritos' : 'Añadido a favoritos ❤️');
  };

  const handleBuy = async (item, customColor = null) => {
    const unlock = checkUnlock(item);
    if (!unlock.unlocked) {
      toast.error('Item bloqueado', { description: unlock.message });
      return;
    }
    
    if ((user?.coins || 0) < item.price) {
      toast.error('Monedas insuficientes', { description: `Necesitas ${item.price - (user?.coins || 0)} monedas más` });
      return;
    }

    try {
      const response = await db.functions.invoke('purchaseItem', {
        item_id: item.item_id,
        custom_color: customColor,
        use_gems: false
      });

      if (response.data.success) {
        const updatedUser = await db.auth.me();
        setUser(updatedUser);
        setPreviewItem(null);
        setPreviewColor(null);
        queryClient.invalidateQueries(['shop-items']);
        
        toast.success(`¡${item.name} comprado! 🎉`, { 
          description: `Te quedan ${response.data.remaining_coins} monedas` 
        });
      }
    } catch (error) {
      toast.error('Error al comprar', { description: error.response?.data?.error || error.message });
    }
  };

  const handleBuyPack = async (pack) => {
    const packId = pack.pack_id || pack.id;
    const price = pack.discount_price || pack.discountPrice;
    
    if ((user?.coins || 0) < price) {
      toast.error('Monedas insuficientes', { description: `Necesitas ${price - (user?.coins || 0)} monedas más` });
      return;
    }

    try {
      const response = await db.functions.invoke('purchasePack', {
        pack_id: packId,
        use_gems: false
      });

      if (response.data.success) {
        const updatedUser = await db.auth.me();
        setUser(updatedUser);
        queryClient.invalidateQueries(['shop-items']);
        
        toast.success(`¡Pack ${pack.name} comprado! 🎉`, { 
          description: `Ahorraste ${response.data.savings} monedas` 
        });
      }
    } catch (error) {
      toast.error('Error al comprar pack', { description: error.response?.data?.error || error.message });
    }
  };

  const handleEquip = useCallback(async (item) => {
    const mapping = categoryFieldMap[item.category];
    if (mapping) {
      const savedColor = user?.purchased_colors?.[item.item_id] || item.color;
      const newConfig = { ...user.avatar_config, [mapping.field]: item.style_id };
      if (savedColor) newConfig[mapping.colorField] = savedColor;
      
      await db.auth.updateMe({ avatar_config: newConfig });
      const updatedUser = await db.auth.me();
      setUser(updatedUser);
      toast.success(`¡${item.name} equipado!`);
    }
  }, [user]);

  const previewConfig = useMemo(() => {
    if (!previewItem) return user?.avatar_config || {};
    const baseConfig = { ...(user?.avatar_config || {}) };
    
    const mapping = categoryFieldMap[previewItem.category];
    if (mapping) {
      baseConfig[mapping.field] = previewItem.style_id;
      if (previewColor || previewItem.color) {
        baseConfig[mapping.colorField] = previewColor || previewItem.color;
      }
    }
    return baseConfig;
  }, [previewItem, previewColor, user?.avatar_config]);

  const previewUser = useMemo(() => ({ 
    ...user, 
    avatar_config: previewConfig 
  }), [user, previewConfig]);

  if (!user || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <ShopHeader 
        user={user} 
        wishlistCount={wishlist.length}
        onWishlistClick={() => setCategory('wishlist')}
      />

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-[260px_1fr] gap-4 lg:gap-6">
          <ShopPreview
            user={user}
            previewUser={previewUser}
            previewItem={previewItem}
            previewColor={previewColor}
            setPreviewColor={setPreviewColor}
            setPreviewItem={setPreviewItem}
            ownedItems={ownedItems}
            handleBuy={handleBuy}
            handleEquip={handleEquip}
            wishlist={wishlist}
            allItems={allItems}
          />

          {/* Shop Content */}
          <div className="space-y-6">
            <ShopSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <ShopCategories category={category} setCategory={setCategory} />

            {/* Loot Boxes Section */}
            {(category === 'all' || category === 'lootbox') && (
              <LootBoxSection 
                lootBoxes={allLootBoxes} 
                user={user} 
                setUser={setUser}
                allItems={allItems}
                ownedItems={ownedItems}
                queryClient={queryClient}
              />
            )}

            {/* Novedades Banner */}
            {category === 'all' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🆕</div>
                  <div className="flex-1">
                    <h3 className="font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Novedades de la Semana
                    </h3>
                    <p className="text-sm text-emerald-100">¡Descubre los últimos accesorios!</p>
                  </div>
                  <Button onClick={() => setCategory('new')} variant="secondary" size="sm">
                    Ver todo
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Packs Section */}
            {(category === 'all' || category === 'packs') && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-violet-600" /> Packs Temáticos
                  <Badge className="bg-red-500 text-white">¡Ahorra!</Badge>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allShopPacks.map((pack) => {
                    const packItems = pack.item_ids || pack.items;
                    const allOwned = packItems.every(id => ownedItems.includes(id));
                    return (
                      <motion.div
                        key={pack.id}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "rounded-2xl overflow-hidden border-2",
                          allOwned ? "border-green-300" : "border-transparent"
                        )}
                      >
                        <div className={cn("bg-gradient-to-r p-4 text-white", pack.color_gradient || pack.color)}>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-3xl">{pack.icon}</span>
                              <h3 className="font-bold text-lg mt-1">{pack.name}</h3>
                              <p className="text-sm opacity-90">{pack.description}</p>
                            </div>
                            <Badge className="bg-white/20 text-white">-{pack.discount_percentage || pack.discount}%</Badge>
                          </div>

                          <div className="flex gap-1 mt-3">
                            {packItems.map(itemId => {
                              const item = allItems.find(i => i.item_id === itemId);
                              return item && (
                                <span key={itemId} className="text-xl bg-white/20 rounded-lg p-1" title={item.name}>
                                  {item.icon}
                                </span>
                              );
                            })}
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div>
                              <span className="text-sm line-through opacity-60">💰{pack.original_price || pack.originalPrice}</span>
                              <span className="text-xl font-bold ml-2">💰{pack.discount_price || pack.discountPrice}</span>
                            </div>
                            {allOwned ? (
                              <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> Completado</Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleBuyPack(pack)}
                                disabled={(user?.coins || 0) < (pack.discount_price || pack.discountPrice)}
                                className="bg-white text-gray-800 hover:bg-gray-100"
                              >
                                Comprar
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wishlist View */}
            {category === 'wishlist' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500 fill-current" /> Mi Lista de Deseos
                </h2>
                {wishlist.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Tu lista de deseos está vacía</p>
                    <p className="text-sm text-gray-400">Haz clic en ❤️ para guardar items</p>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map(itemId => {
                      const item = allItems.find(i => i.item_id === itemId);
                      if (!item) return null;
                      return <ShopItemCard key={itemId} item={item} {...{ ownedItems, checkUnlock, handleBuy, handleEquip, setPreviewItem, toggleWishlist, wishlist, currentAvatarConfig: user?.avatar_config }} />;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Items Grid */}
            {category !== 'packs' && category !== 'wishlist' && category !== 'lootbox' && (
              <>
                {category === 'popular' && (
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" /> Más Vendidos
                  </h2>
                )}
                {category === 'new' && (
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-emerald-500" /> Novedades
                  </h2>
                )}

                {/* Results count */}
                {searchQuery && (
                  <p className="text-sm text-gray-500">
                    {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{searchQuery}"
                  </p>
                )}
                
                {paginatedItems.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {paginatedItems.map((item, index) => (
                        <ShopItemCard
                          key={item.item_id}
                          item={item}
                          index={index}
                          ownedItems={ownedItems}
                          checkUnlock={checkUnlock}
                          handleBuy={handleBuy}
                          handleEquip={handleEquip}
                          setPreviewItem={setPreviewItem}
                          toggleWishlist={toggleWishlist}
                          wishlist={wishlist}
                          currentAvatarConfig={user?.avatar_config}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron items</p>
                    <p className="text-sm text-gray-400">Intenta con otra búsqueda o categoría</p>
                  </Card>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Show first, last, current, and adjacent pages
                        if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "w-8 h-8 p-0",
                                currentPage === page && "bg-amber-500"
                              )}
                            >
                              {page}
                            </Button>
                          );
                        } else if (Math.abs(page - currentPage) === 2) {
                          return <span key={page} className="px-1 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            <EarnCoinsInfo user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

const ShopItemCard = React.memo(function ShopItemCard({ item, index = 0, ownedItems, checkUnlock, handleBuy, handleEquip, setPreviewItem, toggleWishlist, wishlist, currentAvatarConfig }) {
  const owned = ownedItems.includes(item.item_id);
  const unlock = checkUnlock(item);
  const rarity = rarityConfig[item.rarity] || rarityConfig.common;
  const isWishlisted = wishlist.includes(item.item_id);
  const [colorIndex, setColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Check if item is currently equipped
  const isEquipped = useMemo(() => {
    if (!currentAvatarConfig) return false;
    const mapping = categoryFieldMap[item.category];
    if (!mapping) return false;
    return currentAvatarConfig[mapping.field] === item.style_id;
  }, [currentAvatarConfig, item.category, item.style_id]);

  // Animación de colores para items personalizables
  useEffect(() => {
    if (item.customizable) {
      const interval = setInterval(() => {
        setColorIndex(prev => (prev + 1) % colorPalette.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [item.customizable]);

  const displayColor = item.customizable ? colorPalette[colorIndex] : item.color;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "overflow-hidden border-2 transition-all hover:shadow-xl group",
        owned ? "border-green-300 bg-green-50/50" : rarity.glow,
        !unlock.unlocked && "opacity-70"
      )}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            {/* Icono con animación al hover */}
            <div className="relative">
              <motion.div 
                className="text-3xl"
                animate={isHovered ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                  y: [0, -5, 0]
                } : item.customizable ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isHovered ? Infinity : item.customizable ? Infinity : 0 }}
              >
                {item.icon}
              </motion.div>
              {item.customizable && (
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow"
                  animate={{ backgroundColor: displayColor }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(item.item_id); }}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Heart className={cn("w-4 h-4", isWishlisted ? "fill-pink-500 text-pink-500" : "text-gray-300")} />
                </button>
                <button
                  onClick={() => setPreviewItem(item)}
                  className="p-1 hover:scale-110 transition-transform text-gray-400 hover:text-violet-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <Badge className={cn("text-[10px]", rarity.color)}>
                {rarity.label}
              </Badge>
              {item.is_new && (
                <Badge className="bg-emerald-500 text-white text-[10px]">Nuevo</Badge>
              )}
              {item.is_limited && (
                <Badge className="bg-pink-500 text-white text-[10px]">
                  <Clock className="w-2 h-2 mr-0.5" /> Limitado
                </Badge>
              )}
            </div>
          </div>
          
          <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
          
          {item.customizable && (
            <div className="flex items-center gap-1 mt-1">
              <Palette className="w-3 h-3 text-violet-500" />
              <span className="text-[10px] text-violet-600">+20 colores</span>
              <div className="flex gap-0.5 ml-1">
                {colorPalette.slice(0, 6).map((c, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                <span>💰</span> {item.price}
              </div>
              {item.sales_count > 0 && (
                <p className="text-[9px] text-gray-400 mt-0.5">{item.sales_count} vendidos</p>
              )}
            </div>
            
            {owned ? (
              <Button 
                size="sm" 
                onClick={() => handleEquip(item)} 
                className={cn(
                  "h-7 text-xs transition-all",
                  isEquipped 
                    ? "bg-violet-500 hover:bg-violet-600 ring-2 ring-violet-300" 
                    : "bg-green-500 hover:bg-green-600"
                )}
              >
                <Check className="w-3 h-3 mr-1" /> {isEquipped ? 'Equipado' : 'Equipar'}
              </Button>
            ) : !unlock.unlocked ? (
              <Button size="sm" disabled className="bg-gray-300 h-7 text-xs">
                <Lock className="w-3 h-3 mr-1" /> Bloqueado
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => {
                  setPreviewItem(item);
                  // Scroll to preview panel on mobile
                  document.getElementById('preview-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="bg-amber-500 hover:bg-amber-600 h-7 text-xs"
              >
                Ver
              </Button>
            )}
          </div>
          
          {!unlock.unlocked && (
            <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
              <Lock className="w-2 h-2" /> {unlock.message}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
});