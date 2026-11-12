import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Sparkles, X, Palette, Check, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import PixelAvatar from '../avatar/PixelAvatar';
import { colorPalette } from '../common/shopConstants';

export default function ShopPreview({ 
  user, 
  previewUser, 
  previewItem, 
  previewColor, 
  setPreviewColor, 
  setPreviewItem, 
  ownedItems,
  handleBuy, 
  handleEquip,
  wishlist,
  allItems
}) {
  const navigate = useNavigate();

  return (
    <div id="preview-panel" className="lg:sticky lg:top-4 h-fit space-y-4">
      <Card className="overflow-hidden border-2 border-amber-200">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-2 text-center">
          <h2 className="text-white font-bold text-sm flex items-center justify-center gap-2">
            {previewItem ? <Eye className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {previewItem ? 'Previsualizando' : 'Tu Avatar'}
          </h2>
        </div>
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 flex justify-center relative">
          <PixelAvatar user={previewUser} size="xlarge" showLevel={true} showCoins={false} animation="idle" />
          {previewItem && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => { setPreviewItem(null); setPreviewColor(null); }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Color picker for preview */}
        {previewItem?.customizable && (
          <div className="p-3 bg-white border-t">
            <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Color personalizado
            </p>
            <div className="grid grid-cols-11 gap-1">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  onClick={() => setPreviewColor(color)}
                  className={cn(
                    "w-5 h-5 rounded border-2 transition-all",
                    previewColor === color ? "border-violet-500 scale-110" : "border-gray-200"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {previewItem && (
          <div className="p-3 bg-white border-t space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">{previewItem.name}</span>
              <span className="font-bold text-amber-600">💰 {previewItem.price}</span>
            </div>
            {ownedItems.includes(previewItem.item_id) ? (
              <Button onClick={() => handleEquip(previewItem)} className="w-full bg-green-500 hover:bg-green-600">
                <Check className="w-4 h-4 mr-1" /> Equipar
              </Button>
            ) : (
              <Button 
                onClick={() => handleBuy(previewItem, previewColor)} 
                disabled={(user?.coins || 0) < previewItem.price}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                Comprar {previewColor && previewItem.customizable && '(Color personalizado)'}
              </Button>
            )}
          </div>
        )}

        {!previewItem && (
          <div className="p-3 bg-white border-t">
            <Button onClick={() => navigate(createPageUrl('Avatar'))} variant="outline" size="sm" className="w-full">
              ✏️ Editar Avatar
            </Button>
          </div>
        )}
      </Card>

      {/* Wishlist Preview */}
      {wishlist.length > 0 && (
        <Card className="p-3 border-2 border-pink-200">
          <h3 className="font-bold text-sm text-pink-700 flex items-center gap-1 mb-2">
            <Heart className="w-4 h-4 fill-current" /> Mi Lista de Deseos ({wishlist.length})
          </h3>
          <div className="space-y-1">
            {wishlist.slice(0, 3).map(itemId => {
              const item = allItems.find(i => i.item_id === itemId);
              return item && (
                <div key={itemId} className="flex items-center justify-between text-xs bg-pink-50 rounded p-1.5">
                  <span>{item.icon} {item.name}</span>
                  <span className="text-amber-600 font-bold">💰{item.price}</span>
                </div>
              );
            })}
            {wishlist.length > 3 && (
              <p className="text-xs text-gray-500 text-center">+{wishlist.length - 3} más</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}