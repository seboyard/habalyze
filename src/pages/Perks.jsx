import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, Lock, Clock, Sparkles, Coins, Shield, Star, 
  TrendingUp, Gift, Check, Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, addMinutes, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

const defaultPerks = [
  { perk_id: 'coin_boost_5', name: 'Bolsa de Oro', description: '+5% monedas en recompensas', icon: '💰', effect_type: 'coin_boost', effect_value: 0.05, unlock_level: 3, is_passive: true, category: 'rewards' },
  { perk_id: 'xp_boost_5', name: 'Experiencia Mejorada', description: '+5% XP en hábitos', icon: '⚡', effect_type: 'xp_boost', effect_value: 0.05, unlock_level: 5, is_passive: true, category: 'progression' },
  { perk_id: 'double_xp_1h', name: 'Hora Dorada', description: 'Doble XP por 1 hora', icon: '✨', effect_type: 'xp_boost', effect_value: 1.0, duration_minutes: 60, unlock_level: 7, is_passive: false, cooldown_hours: 24, category: 'progression' },
  { perk_id: 'streak_save', name: 'Escudo de Racha', description: 'Protege tu racha 1 vez', icon: '🛡️', effect_type: 'streak_save', effect_value: 1, unlock_level: 10, is_passive: false, cooldown_hours: 168, category: 'protection' },
  { perk_id: 'coin_boost_10', name: 'Tesoro del Rey', description: '+10% monedas', icon: '👑', effect_type: 'coin_boost', effect_value: 0.10, unlock_level: 12, is_passive: true, category: 'rewards' },
  { perk_id: 'lucky_drop', name: 'Suerte de Principiante', description: '+5% chance de drops raros', icon: '🍀', effect_type: 'lucky_drop', effect_value: 0.05, unlock_level: 15, is_passive: true, category: 'rewards' },
  { perk_id: 'double_coins_1h', name: 'Fiebre del Oro', description: 'Doble monedas por 1 hora', icon: '💎', effect_type: 'coin_boost', effect_value: 1.0, duration_minutes: 60, unlock_level: 18, is_passive: false, cooldown_hours: 24, category: 'rewards' },
  { perk_id: 'xp_boost_15', name: 'Maestría Absoluta', description: '+15% XP', icon: '🌟', effect_type: 'xp_boost', effect_value: 0.15, unlock_level: 20, is_passive: true, category: 'progression' },
  { perk_id: 'daily_bonus', name: 'Bendición Diaria', description: '+10 monedas gratis cada día', icon: '🎁', effect_type: 'daily_bonus', effect_value: 10, unlock_level: 8, is_passive: false, cooldown_hours: 24, category: 'rewards' },
];

const categoryConfig = {
  progression: { label: 'Progresión', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  rewards: { label: 'Recompensas', icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
  protection: { label: 'Protección', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
  social: { label: 'Social', icon: Star, color: 'text-pink-600', bg: 'bg-pink-50' },
};

export default function PerksPage() {
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: perks = defaultPerks } = useQuery({
    queryKey: ['perks'],
    queryFn: async () => {
      const dbPerks = await db.entities.Perk.list();
      return dbPerks.length > 0 ? dbPerks : defaultPerks;
    },
  });

  const { data: userPerks = [] } = useQuery({
    queryKey: ['user-perks', user?.email],
    queryFn: () => db.entities.UserPerk.filter({ user_email: user?.email }),
    enabled: !!user,
  });

  const activatePerkMutation = useMutation({
    mutationFn: async (perk) => {
      const userPerk = userPerks.find(up => up.perk_id === perk.perk_id);
      
      if (!userPerk) {
        // Create new UserPerk
        await db.entities.UserPerk.create({
          user_email: user.email,
          perk_id: perk.perk_id,
          is_unlocked: true,
          unlocked_date: new Date().toISOString(),
          is_active: true,
          activated_at: new Date().toISOString(),
          expires_at: perk.duration_minutes 
            ? addMinutes(new Date(), perk.duration_minutes).toISOString() 
            : null,
          uses_today: 1,
          total_uses: 1
        });
      } else {
        // Update existing
        await db.entities.UserPerk.update(userPerk.id, {
          is_active: true,
          activated_at: new Date().toISOString(),
          expires_at: perk.duration_minutes 
            ? addMinutes(new Date(), perk.duration_minutes).toISOString() 
            : null,
          uses_today: (userPerk.uses_today || 0) + 1,
          total_uses: (userPerk.total_uses || 0) + 1
        });
      }

      // Apply immediate effects
      if (perk.effect_type === 'daily_bonus') {
        await db.auth.updateMe({
          coins: (user.coins || 0) + perk.effect_value
        });
        toast.success(`+${perk.effect_value} monedas añadidas!`);
      }
    },
    onSuccess: (_, perk) => {
      queryClient.invalidateQueries(['user-perks']);
      if (perk.effect_type !== 'daily_bonus') {
        toast.success(`${perk.name} activado!`, {
          description: perk.duration_minutes ? `Activo por ${perk.duration_minutes} minutos` : 'Efecto aplicado'
        });
      }
    }
  });

  const getPerkStatus = (perk) => {
    const userPerk = userPerks.find(up => up.perk_id === perk.perk_id);
    const userLevel = user?.level || 1;
    
    if (userLevel < perk.unlock_level) {
      return { status: 'locked', message: `Nivel ${perk.unlock_level} requerido` };
    }
    
    if (perk.is_passive) {
      return { status: 'passive', message: 'Siempre activo' };
    }
    
    if (userPerk?.is_active && userPerk?.expires_at && !isPast(new Date(userPerk.expires_at))) {
      return { status: 'active', expires: new Date(userPerk.expires_at) };
    }
    
    if (userPerk?.activated_at && perk.cooldown_hours) {
      const cooldownEnd = addMinutes(new Date(userPerk.activated_at), perk.cooldown_hours * 60);
      if (!isPast(cooldownEnd)) {
        return { status: 'cooldown', cooldownEnd };
      }
    }
    
    return { status: 'ready', message: 'Listo para usar' };
  };

  const filteredPerks = perks.filter(p => 
    activeCategory === 'all' || p.category === activeCategory
  ).sort((a, b) => a.unlock_level - b.unlock_level);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Habilidades</h1>
                <p className="text-purple-200 text-sm">Desbloquea poderes con tu nivel</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-200">Tu nivel</p>
              <p className="text-3xl font-bold">{user.level || 1}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            Todas
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={key}
                variant={activeCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(key)}
                className={activeCategory === key ? '' : config.color}
              >
                <Icon className="w-4 h-4 mr-1" />
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Perks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPerks.map((perk, i) => {
            const status = getPerkStatus(perk);
            const config = categoryConfig[perk.category] || categoryConfig.progression;
            const isLocked = status.status === 'locked';
            const isActive = status.status === 'active';
            const isPassive = status.status === 'passive';
            const isCooldown = status.status === 'cooldown';
            const isReady = status.status === 'ready';

            return (
              <motion.div
                key={perk.perk_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn(
                  "p-4 transition-all",
                  isLocked && "opacity-60",
                  isActive && "ring-2 ring-green-500 bg-green-50",
                  isPassive && "bg-gradient-to-br from-purple-50 to-pink-50"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-3xl",
                      isLocked ? "bg-gray-100" : config.bg
                    )}>
                      {isLocked ? <Lock className="w-6 h-6 text-gray-400" /> : perk.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{perk.name}</h3>
                        {isPassive && <Badge className="bg-purple-100 text-purple-700 text-xs">Pasivo</Badge>}
                        {isActive && <Badge className="bg-green-500 text-white text-xs">Activo</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{perk.description}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={cn("text-xs", config.color)}>
                          Nivel {perk.unlock_level}
                        </Badge>
                        {perk.duration_minutes && (
                          <Badge variant="outline" className="text-xs">
                            <Timer className="w-3 h-3 mr-1" />
                            {perk.duration_minutes} min
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="mt-4">
                    {isLocked && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Nivel {perk.unlock_level} requerido</span>
                        <Progress value={(user.level / perk.unlock_level) * 100} className="w-24 h-2" />
                      </div>
                    )}
                    
                    {isPassive && (
                      <div className="flex items-center gap-2 text-sm text-purple-600">
                        <Check className="w-4 h-4" />
                        Siempre activo
                      </div>
                    )}
                    
                    {isActive && status.expires && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Clock className="w-4 h-4" />
                        Expira: {format(status.expires, 'HH:mm', { locale: es })}
                      </div>
                    )}
                    
                    {isCooldown && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <Clock className="w-4 h-4" />
                        Disponible: {format(status.cooldownEnd, "d MMM 'a las' HH:mm", { locale: es })}
                      </div>
                    )}
                    
                    {isReady && (
                      <Button
                        size="sm"
                        onClick={() => activatePerkMutation.mutate(perk)}
                        disabled={activatePerkMutation.isPending}
                        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Activar
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-200">
          <h3 className="font-bold text-violet-800 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            ¿Cómo funcionan las habilidades?
          </h3>
          <ul className="text-sm text-violet-700 space-y-1">
            <li>• <strong>Pasivas:</strong> Se aplican automáticamente una vez desbloqueadas</li>
            <li>• <strong>Activas:</strong> Debes activarlas manualmente y tienen duración limitada</li>
            <li>• Sube de nivel completando hábitos para desbloquear más habilidades</li>
            <li>• Algunas habilidades tienen tiempo de enfriamiento entre usos</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}