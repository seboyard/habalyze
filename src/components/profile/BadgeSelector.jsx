import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const levelStyles = {
  1: { bg: 'from-gray-400 to-gray-500' },
  2: { bg: 'from-gray-500 to-gray-600' },
  3: { bg: 'from-green-400 to-green-600' },
  4: { bg: 'from-green-500 to-emerald-600' },
  5: { bg: 'from-blue-400 to-blue-600' },
  6: { bg: 'from-blue-500 to-indigo-600' },
  7: { bg: 'from-purple-400 to-purple-600' },
  8: { bg: 'from-purple-500 to-pink-600' },
  9: { bg: 'from-amber-400 to-orange-600' },
  10: { bg: 'from-amber-500 to-red-600' },
};

export default function BadgeSelector({ 
  open, 
  onOpenChange, 
  userBadges, 
  allBadges, 
  featuredBadgeIds = [],
  onSave 
}) {
  const [selected, setSelected] = useState(featuredBadgeIds);
  const [saving, setSaving] = useState(false);
  const MAX_FEATURED = 3;

  const toggleBadge = (badgeId) => {
    if (selected.includes(badgeId)) {
      setSelected(selected.filter(id => id !== badgeId));
    } else if (selected.length < MAX_FEATURED) {
      setSelected([...selected, badgeId]);
    } else {
      toast.error(`Solo puedes destacar ${MAX_FEATURED} placas`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selected);
      toast.success('Placas destacadas actualizadas');
      onOpenChange(false);
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const userBadgesWithData = userBadges.map(ub => {
    const badge = allBadges.find(b => b.badge_id === ub.badge_id);
    return { ...ub, badge };
  }).filter(ub => ub.badge);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Configurar Placas Destacadas
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500 mb-4">
          Selecciona hasta {MAX_FEATURED} placas para mostrar en tu perfil ({selected.length}/{MAX_FEATURED})
        </p>

        <div className="max-h-80 overflow-y-auto space-y-2">
          {userBadgesWithData.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No tienes placas desbloqueadas aún</p>
          ) : (
            userBadgesWithData.map(ub => {
              const isSelected = selected.includes(ub.badge_id);
              const level = ub.current_level || 1;
              const style = levelStyles[Math.min(level, 10)];
              
              return (
                <motion.div
                  key={ub.badge_id}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={cn(
                      "p-3 cursor-pointer transition-all border-2",
                      isSelected 
                        ? "border-purple-500 bg-purple-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => toggleBadge(ub.badge_id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br",
                        style.bg
                      )}>
                        {ub.badge.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{ub.badge.name}</p>
                        <p className="text-xs text-gray-500">Nivel {level}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 mt-4"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Star className="w-4 h-4 mr-2" />
          )}
          Guardar Selección
        </Button>
      </DialogContent>
    </Dialog>
  );
}