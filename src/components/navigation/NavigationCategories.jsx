import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Target, Users, Store, BarChart3, Trophy, Award, 
  Brain, X, FolderKanban, Sparkles, Scroll, Gem, 
  Gift, Shield, User, Settings, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const navigationCategories = {
  main: [
    { name: 'Hoy', icon: Home, url: createPageUrl('Dashboard') },
    { name: 'Caminos', icon: FolderKanban, url: createPageUrl('Projects') },
    { name: 'Social', icon: Users, url: createPageUrl('Social') },
    { name: 'Tienda', icon: Store, url: createPageUrl('Shop') },
  ],
  features: [
    { name: 'Mi Avatar', icon: User, url: createPageUrl('Avatar'), description: 'Personaliza tu personaje pixel art' },
    { name: 'Objetivos', icon: Flag, url: createPageUrl('Objectives'), description: 'Metas a largo plazo con seguimiento' },
    { name: 'Estadísticas', icon: BarChart3, url: createPageUrl('Statistics'), description: 'Analiza tu progreso con gráficas avanzadas' },
    { name: 'Ranking', icon: Trophy, url: createPageUrl('Leaderboard'), description: 'Compite con la comunidad' },
    { name: 'Desafíos', icon: Sparkles, url: createPageUrl('Challenges'), description: 'Únete a desafíos grupales' },
    { name: 'Logros', icon: Award, url: createPageUrl('Achievements'), description: 'Desbloquea logros épicos' },
    { name: 'Configuración', icon: Settings, url: createPageUrl('Settings'), description: 'Ajustes de tu cuenta' },
  ],
  rpg: [
    { name: 'Misiones', icon: Scroll, url: createPageUrl('Missions'), description: 'Misiones diarias y semanales' },
    { name: 'Perks', icon: Gem, url: createPageUrl('Perks'), description: 'Ventajas permanentes desbloqueables' },
    { name: 'Gremios', icon: Shield, url: createPageUrl('Guilds'), description: 'Únete a comunidades de interés' },
    { name: 'Regalos', icon: Gift, url: createPageUrl('Gifts'), description: 'Envía y recibe regalos de amigos' },
  ],
  tools: [
    { name: 'Tienda', icon: Store, url: createPageUrl('Shop'), description: 'Personaliza tu avatar con items únicos' },
  ]
};

export const coachItem = {
  name: 'Coach IA',
  icon: Brain,
  url: createPageUrl('Coach'),
  description: 'Tu asistente personal potenciado con IA'
};

export function MobileNavigationMenu({ onClose }) {
  const allSections = [
    { label: 'Funcionalidades', items: navigationCategories.features, accent: 'purple' },
    { label: 'RPG & Gamificación', items: navigationCategories.rpg, accent: 'amber' },
    { label: 'Tienda', items: navigationCategories.tools, accent: 'pink' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Menú</span>
          <Button variant="ghost" size="icon" onClick={onClose} className="min-h-[44px] min-w-[44px]">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-5">
          {/* Coach IA highlight */}
          <Link to={coachItem.url} onClick={onClose}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Brain className="w-7 h-7" />
                <div className="flex-1">
                  <p className="font-bold text-base">{coachItem.name}</p>
                  <p className="text-xs text-purple-100">{coachItem.description}</p>
                </div>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            </motion.div>
          </Link>

          {allSections.map((section) => (
            <div key={section.label}>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} to={item.url} onClick={onClose}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors min-h-[44px]"
                      >
                        <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.name}</p>
                          {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}