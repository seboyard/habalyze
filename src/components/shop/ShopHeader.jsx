import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Heart, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function ShopHeader({ user, wishlistCount, onWishlistClick }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FFF6EA] text-[#2B1741] border-b border-[#E6D3F2] py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#693CA1] text-[#FFF4DD] flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tienda de avatar</h1>
              <p className="text-[#555267] text-sm">Piezas fijas, pagadas con monedas de hábitos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Button 
              variant="ghost" 
              onClick={onWishlistClick}
              className="text-[#2B1741] hover:bg-[#F3E8FF]"
            >
              <Heart className={cn("w-5 h-5 mr-1", wishlistCount > 0 && "fill-current")} />
              {wishlistCount}
            </Button>
            <div className="bg-[#FFC95D] rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <p className="text-xl font-bold">{user?.coins || 0}</p>
            </div>
            <div className="bg-[#EDE4FF] rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <p className="text-xl font-bold">{user?.gems || 0}</p>
            </div>
            <Button onClick={() => navigate(createPageUrl('BuyCoins'))} size="sm" variant="outline" className="border-[#2B1741]">
              <CreditCard className="w-4 h-4 mr-1" /> Monedas
            </Button>
            <Button onClick={() => navigate(createPageUrl('BuyGems'))} size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90">
              💎 Gemas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}